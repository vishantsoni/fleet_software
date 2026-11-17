'use server'

import { Prisma } from '@prisma/client'
import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const AdvanceSchema = z.object({
  amount: z.coerce.number().positive().multipleOf(0.01),
  advanceDate: z.coerce.date(),
  notes: z.string().trim().max(500).optional().nullable(),
})

const AttendanceSchema = z.object({
  attendanceDate: z.coerce.date(),
  status: z.enum(['PRESENT', 'ABSENT']),
})

const VehicleExpenseSchema = z.object({
  expenseDate: z.coerce.date(),
  amount: z.coerce.number().positive().multipleOf(0.01),
  notes: z.string().trim().max(500).optional().nullable(),
})

function parseSalaryMonth(value: string) {
  const match = /^(\d{4})-(\d{2})$/.exec(value)
  if (!match) throw new Error('Choose a valid salary month.')

  const year = Number(match[1])
  const month = Number(match[2])
  if (month < 1 || month > 12 || year < 2000 || year > 9999) {
    throw new Error('Choose a valid salary month.')
  }

  const start = new Date(Date.UTC(year, month - 1, 1))
  const end = new Date(Date.UTC(year, month, 1))
  const currentMonth = new Date()
  currentMonth.setDate(1)
  currentMonth.setHours(0, 0, 0, 0)
  if (start > new Date(Date.UTC(currentMonth.getFullYear(), currentMonth.getMonth(), 1))) {
    throw new Error('Future salary months are not available.')
  }

  return { year, month, start, end }
}

function decimalSum(value: Prisma.Decimal | null | undefined) {
  return value ?? new Prisma.Decimal(0)
}

function getDaysInMonth(year: number, month: number) {
  return new Date(Date.UTC(year, month, 0)).getUTCDate()
}

function calculateAbsenceDeduction(baseSalary: Prisma.Decimal, absentDays: number, daysInMonth: number) {
  return baseSalary
    .div(daysInMonth)
    .mul(absentDays)
    .toDecimalPlaces(2, Prisma.Decimal.ROUND_HALF_UP)
}

async function ensureSalaryMonthEditable(
  transaction: Prisma.TransactionClient,
  driverId: string,
  period: { year: number; month: number }
) {
  const settledPayment = await transaction.driverSalaryPayment.findFirst({
    where: {
      driverId,
      OR: [
        { salaryYear: { gt: period.year } },
        { salaryYear: period.year, salaryMonth: { gte: period.month } },
      ],
    },
  })
  if (settledPayment) {
    throw new Error('Salary is already settled for this or a later month; entries cannot be changed.')
  }
}

export async function getDriverSalarySummary(driverId: string, monthValue: string) {
  const period = parseSalaryMonth(monthValue)
  const driver = await prisma.driver.findUnique({
    where: { id: driverId },
    select: { id: true, fullName: true, baseSalary: true },
  })
  if (!driver) throw new Error('Driver not found.')

  const [monthAdvances, attendance, expenses, advancesToDate, previousPayments, salaryPayment, recentPayments] = await Promise.all([
    prisma.driverAdvance.findMany({
      where: { driverId, advanceDate: { gte: period.start, lt: period.end } },
      orderBy: { advanceDate: 'desc' },
    }),
    prisma.driverAttendance.findMany({
      where: { driverId, attendanceDate: { gte: period.start, lt: period.end } },
      orderBy: { attendanceDate: 'desc' },
    }),
    prisma.driverVehicleExpense.findMany({
      where: { driverId, expenseDate: { gte: period.start, lt: period.end } },
      orderBy: { expenseDate: 'desc' },
    }),
    prisma.driverAdvance.aggregate({
      where: { driverId, advanceDate: { lt: period.end } },
      _sum: { amount: true },
    }),
    prisma.driverSalaryPayment.aggregate({
      where: {
        driverId,
        OR: [
          { salaryYear: { lt: period.year } },
          { salaryYear: period.year, salaryMonth: { lt: period.month } },
        ],
      },
      _sum: { advanceDeducted: true },
    }),
    prisma.driverSalaryPayment.findUnique({
      where: { driverId_salaryYear_salaryMonth: { driverId, salaryYear: period.year, salaryMonth: period.month } },
    }),
    prisma.driverSalaryPayment.findMany({
      where: { driverId },
      orderBy: [{ salaryYear: 'desc' }, { salaryMonth: 'desc' }],
      take: 12,
    }),
  ])

  const totalAdvances = decimalSum(advancesToDate._sum.amount)
  const totalPreviouslyDeducted = decimalSum(previousPayments._sum.advanceDeducted)
  const outstandingAdvances = Prisma.Decimal.max(totalAdvances.minus(totalPreviouslyDeducted), 0)
  const baseSalary = new Prisma.Decimal(driver.baseSalary)
  const absentDays = attendance.filter((entry) => entry.status === 'ABSENT').length
  const absenceDeduction = salaryPayment
    ? new Prisma.Decimal(salaryPayment.absenceDeducted)
    : calculateAbsenceDeduction(baseSalary, absentDays, getDaysInMonth(period.year, period.month))
  const expenseReimbursement = salaryPayment
    ? new Prisma.Decimal(salaryPayment.expenseReimbursed)
    : expenses.reduce((total, expense) => total.plus(expense.amount), new Prisma.Decimal(0))
  const earnedSalary = Prisma.Decimal.max(baseSalary.minus(absenceDeduction), 0)
  const advanceDeduction = salaryPayment
    ? new Prisma.Decimal(salaryPayment.advanceDeducted)
    : Prisma.Decimal.min(earnedSalary, outstandingAdvances)

  return {
    driver: { ...driver, baseSalary: Number(driver.baseSalary) },
    month: monthValue,
    advances: monthAdvances.map((advance) => ({ ...advance, amount: Number(advance.amount) })),
    attendance,
    absentDays,
    absenceDeduction: Number(absenceDeduction),
    expenses: expenses.map((expense) => ({ ...expense, amount: Number(expense.amount) })),
    expenseReimbursement: Number(expenseReimbursement),
    monthAdvanceTotal: Number(
      monthAdvances.reduce((total, advance) => total.plus(advance.amount), new Prisma.Decimal(0))
    ),
    outstandingAdvances: Number(outstandingAdvances),
    advanceDeduction: Number(advanceDeduction),
    netSalary: salaryPayment
      ? Number(salaryPayment.netSalary)
      : Number(Prisma.Decimal.max(earnedSalary.minus(advanceDeduction), 0).plus(expenseReimbursement)),
    salaryPayment: salaryPayment
      ? {
          ...salaryPayment,
          baseSalary: Number(salaryPayment.baseSalary),
          advanceDeducted: Number(salaryPayment.advanceDeducted),
          absenceDeducted: Number(salaryPayment.absenceDeducted),
          expenseReimbursed: Number(salaryPayment.expenseReimbursed),
          netSalary: Number(salaryPayment.netSalary),
        }
      : null,
    recentPayments: recentPayments.map((payment) => ({
      ...payment,
      baseSalary: Number(payment.baseSalary),
      advanceDeducted: Number(payment.advanceDeducted),
      absenceDeducted: Number(payment.absenceDeducted),
      expenseReimbursed: Number(payment.expenseReimbursed),
      netSalary: Number(payment.netSalary),
    })),
  }
}

export async function addDriverAdvance(driverId: string, input: unknown, monthValue: string) {
  const period = parseSalaryMonth(monthValue)
  const data = AdvanceSchema.parse(input)
  if (data.advanceDate < period.start || data.advanceDate >= period.end) {
    throw new Error('Advance date must be in the selected salary month.')
  }
  if (data.advanceDate > new Date()) {
    throw new Error('Advance date cannot be in the future.')
  }

  await prisma.$transaction(async (transaction) => {
    await ensureSalaryMonthEditable(transaction, driverId, period)

    await transaction.driverAdvance.create({
      data: { driverId, ...data },
    })
  }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable })
  revalidatePath(`/drivers/${driverId}`)
  revalidatePath(`/drivers/${driverId}/salary`)
}

export async function saveDriverAttendance(driverId: string, input: unknown, monthValue: string) {
  const period = parseSalaryMonth(monthValue)
  const data = AttendanceSchema.parse(input)
  if (data.attendanceDate < period.start || data.attendanceDate >= period.end) {
    throw new Error('Attendance date must be in the selected salary month.')
  }
  if (data.attendanceDate > new Date()) {
    throw new Error('Attendance date cannot be in the future.')
  }

  await prisma.$transaction(async (transaction) => {
    await ensureSalaryMonthEditable(transaction, driverId, period)
    await transaction.driverAttendance.upsert({
      where: {
        driverId_attendanceDate: { driverId, attendanceDate: data.attendanceDate },
      },
      create: { driverId, ...data },
      update: { status: data.status },
    })
  }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable })

  revalidatePath(`/drivers/${driverId}/salary`)
}

export async function addDriverVehicleExpense(driverId: string, input: unknown, monthValue: string) {
  const period = parseSalaryMonth(monthValue)
  const data = VehicleExpenseSchema.parse(input)
  if (data.expenseDate < period.start || data.expenseDate >= period.end) {
    throw new Error('Expense date must be in the selected salary month.')
  }
  if (data.expenseDate > new Date()) {
    throw new Error('Expense date cannot be in the future.')
  }

  await prisma.$transaction(async (transaction) => {
    await ensureSalaryMonthEditable(transaction, driverId, period)
    await transaction.driverVehicleExpense.create({
      data: { driverId, ...data },
    })
  }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable })

  revalidatePath(`/drivers/${driverId}/salary`)
}

export async function settleDriverSalary(driverId: string, monthValue: string) {
  const period = parseSalaryMonth(monthValue)

  await prisma.$transaction(async (transaction) => {
    const driver = await transaction.driver.findUnique({
      where: { id: driverId },
      select: { baseSalary: true },
    })
    if (!driver) throw new Error('Driver not found.')

    const alreadySettled = await transaction.driverSalaryPayment.findUnique({
      where: { driverId_salaryYear_salaryMonth: { driverId, salaryYear: period.year, salaryMonth: period.month } },
    })
    if (alreadySettled) throw new Error('This month’s salary has already been settled.')

    const laterPayment = await transaction.driverSalaryPayment.findFirst({
      where: {
        driverId,
        OR: [
          { salaryYear: { gt: period.year } },
          { salaryYear: period.year, salaryMonth: { gt: period.month } },
        ],
      },
    })
    if (laterPayment) throw new Error('Settle salary months in chronological order.')

    const [advances, priorDeductions, attendance, expenses] = await Promise.all([
      transaction.driverAdvance.aggregate({
        where: { driverId, advanceDate: { lt: period.end } },
        _sum: { amount: true },
      }),
      transaction.driverSalaryPayment.aggregate({
        where: {
          driverId,
          OR: [
            { salaryYear: { lt: period.year } },
            { salaryYear: period.year, salaryMonth: { lt: period.month } },
          ],
        },
        _sum: { advanceDeducted: true },
      }),
      transaction.driverAttendance.count({
        where: {
          driverId,
          attendanceDate: { gte: period.start, lt: period.end },
          status: 'ABSENT',
        },
      }),
      transaction.driverVehicleExpense.aggregate({
        where: { driverId, expenseDate: { gte: period.start, lt: period.end } },
        _sum: { amount: true },
      }),
    ])

    const outstanding = Prisma.Decimal.max(
      decimalSum(advances._sum.amount).minus(decimalSum(priorDeductions._sum.advanceDeducted)),
      0
    )
    const baseSalary = new Prisma.Decimal(driver.baseSalary)
    const absenceDeducted = calculateAbsenceDeduction(
      baseSalary,
      attendance,
      getDaysInMonth(period.year, period.month)
    )
    const earnedSalary = Prisma.Decimal.max(baseSalary.minus(absenceDeducted), 0)
    const advanceDeducted = Prisma.Decimal.min(earnedSalary, outstanding)
    const expenseReimbursed = decimalSum(expenses._sum.amount)
    const netSalary = Prisma.Decimal.max(earnedSalary.minus(advanceDeducted), 0).plus(expenseReimbursed)

    await transaction.driverSalaryPayment.create({
      data: {
        driverId,
        salaryYear: period.year,
        salaryMonth: period.month,
        baseSalary,
        advanceDeducted,
        absenceDeducted,
        expenseReimbursed,
        netSalary,
      },
    })
  }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable })

  revalidatePath(`/drivers/${driverId}`)
  revalidatePath(`/drivers/${driverId}/salary`)
}
