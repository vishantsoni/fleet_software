'use server'

import { revalidatePath } from 'next/cache'
import prisma from '@/lib/prisma'
import { BankAccountSchema, ExpenseSchema } from '@/server/utils/validators'

export async function listBankAccountsAction(includeInactive = false) {
  const accounts = await prisma.bankAccount.findMany({
    where: includeInactive ? undefined : { isActive: true },
    orderBy: [{ bankName: 'asc' }, { accountNumber: 'asc' }],
  })

  return accounts
}

export async function createBankAccountAction(input: unknown) {
  const validation = BankAccountSchema.safeParse(input)
  if (!validation.success) {
    return { success: false, error: validation.error.issues[0]?.message || 'Invalid bank account details.' }
  }

  try {
    const account = await prisma.bankAccount.create({ data: validation.data })
    revalidatePath('/bank-accounts')
    revalidatePath('/trips')
    revalidatePath('/expenses')
    return { success: true, data: account }
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      return { success: false, error: 'This bank account has already been added.' }
    }
    console.error('Failed to create bank account', error)
    return { success: false, error: 'Could not save the bank account.' }
  }
}

export async function setBankAccountActiveAction(id: string, isActive: boolean) {
  try {
    await prisma.bankAccount.update({ where: { id }, data: { isActive } })
    revalidatePath('/bank-accounts')
    revalidatePath('/trips')
    revalidatePath('/expenses')
    return { success: true }
  } catch (error) {
    console.error('Failed to update bank account status', error)
    return { success: false, error: 'Could not update the bank account.' }
  }
}

export async function listExpensesAction() {
  const expenses = await prisma.expense.findMany({
    orderBy: [{ expenseDate: 'desc' }, { createdAt: 'desc' }],
    take: 500,
    include: {
      vehicle: { select: { vehicleNo: true } },
      driver: { select: { fullName: true } },
      bankAccount: { select: { bankName: true, accountNumber: true } },
    },
  })

  return expenses.map((expense) => ({
    ...expense,
    amount: Number(expense.amount),
    cngRate: expense.cngRate === null ? null : Number(expense.cngRate),
    quantityKg: expense.quantityKg === null ? null : Number(expense.quantityKg),
  }))
}

export async function createExpenseAction(input: unknown) {
  const validation = ExpenseSchema.safeParse(input)
  if (!validation.success) {
    return { success: false, error: validation.error.issues[0]?.message || 'Invalid expense details.' }
  }

  try {
    await prisma.expense.create({ data: validation.data })
    revalidatePath('/expenses')
    revalidatePath('/dashboard')
    return { success: true }
  } catch (error) {
    console.error('Failed to create expense', error)
    return { success: false, error: 'Could not save the expense.' }
  }
}
