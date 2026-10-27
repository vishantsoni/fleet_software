import prisma from '@/lib/prisma'
import { CreateDriverSchema } from '@/types/driver'
import { Decimal } from '@prisma/client/runtime/library'

export class DriverService {
  static async create(input: { fullName: string }) {
    const validated = CreateDriverSchema.parse(input)

    const driver = await prisma.driver.create({
      data: {
        ...validated,
        licenseNumber: validated.licenseNumber.toUpperCase(),
        baseSalary: new Decimal(validated.baseSalary),
      },
    })

    return {
      ...driver,
      baseSalary: Number(driver.baseSalary),
    }
  }

  static async update(id: string, input: { fullName: string }) {
    const validated = CreateDriverSchema.partial().parse({ ...input, id })

    const data: Record<string, unknown> = { ...validated }
    if (data.licenseNumber) {
      data.licenseNumber = (data.licenseNumber as string).toUpperCase()
    }
    if (data.baseSalary !== undefined) {
      data.baseSalary = new Decimal(data.baseSalary as number)
    }

    const driver = await prisma.driver.update({
      where: { id },
      data,
    })

    return {
      ...driver,
      baseSalary: Number(driver.baseSalary),
    }
  }

  static async delete(id: string) {
    const activeTrips = await prisma.trip.count({
      where: {
        driverId: id,
        status: { in: ['SCHEDULED', 'IN_PROGRESS'] },
      },
    })

    if (activeTrips > 0) {
      throw new Error('Cannot delete driver with active trips')
    }

    await prisma.driver.update({
      where: { id },
      data: { status: 'INACTIVE' },
    })
  }

  static async findById(id: string) {
    const driver = await prisma.driver.findUnique({
      where: { id },
      include: {
        trips: {
          take: 10,
          orderBy: { tripDate: 'desc' },
        },
        driverDocuments: {
          orderBy: { expiryDate: 'asc' },
        },
      },
    })

    if (!driver) return null

    return {
      ...driver,
      baseSalary: Number(driver.baseSalary),
      trips: driver.trips.map((trip) => ({
        ...trip,
        totalKm: Number(trip.totalKm),
        freightAmount: Number(trip.freightAmount),
        revenue: Number(trip.revenue),
      })),
      driverDocuments: driver.driverDocuments.map((doc) => ({
        ...doc,
        renewalCost: Number(doc.renewalCost),
      })),
    }
  }

  static async findAll(page: number, limit: number) {
    const skip = (page - 1) * limit
    const [drivers, total] = await Promise.all([
      prisma.driver.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.driver.count(),
    ])

    return {
      drivers: drivers.map((d) => ({
        ...d,
        baseSalary: Number(d.baseSalary),
      })),
      total,
    }
  }

  static async search(
    page: number,
    limit: number,
    search?: string,
    status?: string
  ) {
    const skip = (page - 1) * limit
    const where: Record<string, unknown> = {}

    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { licenseNumber: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (status) {
      where.status = status
    }

    const [drivers, total] = await Promise.all([
      prisma.driver.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.driver.count({ where }),
    ])

    return {
      drivers: drivers.map((d) => ({
        ...d,
        baseSalary: Number(d.baseSalary),
      })),
      total,
    }
  }

  static async createDocument(input: {
    driverId: string
    documentType: string
    documentNumber: string | null
    issueDate: Date
    expiryDate: Date
    renewalCost: number
    fileUrl: string | null
    daysToExpiry: number
    alertStatus: 'GREEN' | 'AMBER' | 'RED'
  }) {
    const document = await prisma.driverDocument.create({
      data: {
        ...input,
        renewalCost: new Decimal(input.renewalCost),
        daysToExpiry: input.daysToExpiry,
        alertStatus: input.alertStatus,
      },
    })

    return {
      ...document,
      renewalCost: Number(document.renewalCost),
    }
  }

  static async updateDocument(id: string, input: Record<string, unknown>) {
    const data: Record<string, unknown> = { ...input }
    if (data.renewalCost !== undefined) {
      data.renewalCost = new Decimal(data.renewalCost as number)
    }

    const document = await prisma.driverDocument.update({
      where: { id },
      data,
    })

    return {
      ...document,
      renewalCost: Number(document.renewalCost),
    }
  }

  static async getDocuments(driverId: string) {
    const documents = await prisma.driverDocument.findMany({
      where: { driverId },
      orderBy: { expiryDate: 'asc' },
    })

    return documents.map((doc) => ({
      ...doc,
      renewalCost: Number(doc.renewalCost),
    }))
  }
}