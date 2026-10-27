import prisma from '@/lib/prisma'
import { Decimal } from '@prisma/client/runtime/library'

export class FuelService {
  static async getPreviousOdometer(vehicleId: string, entryDate: Date): Promise<number> {
    const [prevFuelEntry, prevMaintenanceJob] = await Promise.all([
      prisma.fuelEntry.findFirst({
        where: {
          vehicleId,
          entryDate: { lt: entryDate },
        },
        orderBy: { odometerReading: 'desc' },
        select: { odometerReading: true },
      }),
      prisma.maintenanceJob.findFirst({
        where: {
          vehicleId,
          jobDate: { lt: entryDate },
        },
        orderBy: { odometerAtService: 'desc' },
        select: { odometerAtService: true },
      }),
    ])

    const fuelOdo = prevFuelEntry?.odometerReading ?? 0
    const maintenanceOdo = prevMaintenanceJob?.odometerAtService ?? 0

    return Math.max(fuelOdo, maintenanceOdo)
  }

  static async create(input: {
    entryDate: Date
    vehicleId: string
    station: string
    fuelType: 'DIESEL' | 'PETROL' | 'CNG' | 'ELECTRIC'
    litres: number
    ratePerLitre: number
    totalAmount?: number
    odometerReading: number
    createdById?: string
  }) {
    const previousOdometer = await this.getPreviousOdometer(input.vehicleId, input.entryDate)
    const kmSinceLastFill = Math.max(0, input.odometerReading - previousOdometer)
    const totalAmount = input.totalAmount ?? input.litres * input.ratePerLitre
    const fuelEconomy = input.litres > 0 ? kmSinceLastFill / input.litres : null

    const entry = await prisma.fuelEntry.create({
      data: {
        entryDate: input.entryDate,
        vehicleId: input.vehicleId,
        station: input.station,
        fuelType: input.fuelType,
        litres: new Decimal(input.litres),
        ratePerLitre: new Decimal(input.ratePerLitre),
        totalAmount: new Decimal(totalAmount),
        odometerReading: input.odometerReading,
        kmSinceLastFill: new Decimal(kmSinceLastFill),
        fuelEconomy: fuelEconomy !== null ? new Decimal(fuelEconomy) : null,
        createdById: input.createdById,
      },
    })

    await prisma.vehicle.update({
      where: { id: input.vehicleId },
      data: { currentOdometer: input.odometerReading },
    })

    return this.transformEntry(entry)
  }

  static async update(id: string, input: Partial<{
    entryDate: Date
    vehicleId: string
    station: string
    fuelType: 'DIESEL' | 'PETROL' | 'CNG' | 'ELECTRIC'
    litres: number
    ratePerLitre: number
    totalAmount: number
    odometerReading: number
  }>) {
    const existing = await prisma.fuelEntry.findUnique({ where: { id } })
    if (!existing) throw new Error('Fuel entry not found')

    const vehicleId = input.vehicleId ?? existing.vehicleId
    const entryDate = input.entryDate ?? existing.entryDate
    const litres = input.litres ?? Number(existing.litres)
    const ratePerLitre = input.ratePerLitre ?? Number(existing.ratePerLitre)
    const odometerReading = input.odometerReading ?? existing.odometerReading

    const previousOdometer = await this.getPreviousOdometer(vehicleId, entryDate)
    const kmSinceLastFill = Math.max(0, odometerReading - previousOdometer)
    const totalAmount = input.totalAmount ?? litres * ratePerLitre
    const fuelEconomy = litres > 0 ? kmSinceLastFill / litres : null

    const entry = await prisma.fuelEntry.update({
      where: { id },
      data: {
        ...(input.entryDate && { entryDate: input.entryDate }),
        ...(input.vehicleId && { vehicleId: input.vehicleId }),
        ...(input.station && { station: input.station }),
        ...(input.fuelType && { fuelType: input.fuelType }),
        ...(input.litres !== undefined && { litres: new Decimal(input.litres) }),
        ...(input.ratePerLitre !== undefined && { ratePerLitre: new Decimal(input.ratePerLitre) }),
        ...(input.totalAmount !== undefined && { totalAmount: new Decimal(input.totalAmount) }),
        ...(input.odometerReading !== undefined && { odometerReading: input.odometerReading }),
        kmSinceLastFill: new Decimal(kmSinceLastFill),
        fuelEconomy: fuelEconomy !== null ? new Decimal(fuelEconomy) : null,
        totalAmount: new Decimal(totalAmount),
      },
    })

    if (input.odometerReading !== undefined && input.odometerReading !== existing.odometerReading) {
      const latestEntry = await prisma.fuelEntry.findFirst({
        where: { vehicleId },
        orderBy: { entryDate: 'desc' },
        select: { odometerReading: true },
      })
      if (latestEntry?.odometerReading === input.odometerReading) {
        await prisma.vehicle.update({
          where: { id: vehicleId },
          data: { currentOdometer: input.odometerReading },
        })
      }
    }

    return this.transformEntry(entry)
  }

  static async delete(id: string) {
    const existing = await prisma.fuelEntry.findUnique({ where: { id } })
    if (!existing) throw new Error('Fuel entry not found')

    await prisma.fuelEntry.delete({ where: { id } })

    const latestEntry = await prisma.fuelEntry.findFirst({
      where: { vehicleId: existing.vehicleId },
      orderBy: { entryDate: 'desc' },
      select: { odometerReading: true },
    })

    if (latestEntry) {
      await prisma.vehicle.update({
        where: { id: existing.vehicleId },
        data: { currentOdometer: latestEntry.odometerReading },
      })
    }

    return { success: true }
  }

  static async findById(id: string) {
    const entry = await prisma.fuelEntry.findUnique({
      where: { id },
      include: {
        vehicle: { select: { id: true, vehicleNo: true, makeModel: true } },
        createdBy: { select: { id: true, name: true, email: true } },
      },
    })

    if (!entry) return null
    return this.transformEntry(entry)
  }

  static async findAll(page: number, limit: number) {
    const skip = (page - 1) * limit
    const [entries, total] = await Promise.all([
      prisma.fuelEntry.findMany({
        skip,
        take: limit,
        orderBy: { entryDate: 'desc' },
        include: {
          vehicle: { select: { id: true, vehicleNo: true, makeModel: true } },
        },
      }),
      prisma.fuelEntry.count(),
    ])

    return {
      entries: entries.map(this.transformEntry),
      total,
    }
  }

  static async search(
    page: number,
    limit: number,
    filters: {
      vehicleId?: string
      fuelType?: 'DIESEL' | 'PETROL' | 'CNG' | 'ELECTRIC'
      dateFrom?: Date
      dateTo?: Date
    } = {}
  ) {
    const skip = (page - 1) * limit
    const where: Record<string, unknown> = {}

    if (filters.vehicleId) {
      where.vehicleId = filters.vehicleId
    }

    if (filters.fuelType) {
      where.fuelType = filters.fuelType
    }

    if (filters.dateFrom || filters.dateTo) {
      where.entryDate = {}
      if (filters.dateFrom) {
        (where.entryDate as Record<string, Date>).gte = filters.dateFrom
      }
      if (filters.dateTo) {
        (where.entryDate as Record<string, Date>).lte = filters.dateTo
      }
    }

    const [entries, total] = await Promise.all([
      prisma.fuelEntry.findMany({
        where,
        skip,
        take: limit,
        orderBy: { entryDate: 'desc' },
        include: {
          vehicle: { select: { id: true, vehicleNo: true, makeModel: true } },
        },
      }),
      prisma.fuelEntry.count({ where }),
    ])

    return {
      entries: entries.map(this.transformEntry),
      total,
    }
  }

  private static transformEntry(entry: {
    id: string
    entryDate: Date
    vehicleId: string
    station: string
    fuelType: string
    litres: Decimal
    ratePerLitre: Decimal
    totalAmount: Decimal
    odometerReading: number
    kmSinceLastFill: Decimal
    fuelEconomy: Decimal | null
    createdById: string | null
    createdAt: Date
    updatedAt: Date
    vehicle?: { id: string; vehicleNo: string; makeModel: string }
    createdBy?: { id: string; name: string | null; email: string }
  }): FuelEntry {
    return {
      id: entry.id,
      entryDate: entry.entryDate,
      vehicleId: entry.vehicleId,
      station: entry.station,
      fuelType: entry.fuelType as 'DIESEL' | 'PETROL' | 'CNG' | 'ELECTRIC',
      litres: Number(entry.litres),
      ratePerLitre: Number(entry.ratePerLitre),
      totalAmount: Number(entry.totalAmount),
      odometerReading: entry.odometerReading,
      kmSinceLastFill: Number(entry.kmSinceLastFill),
      fuelEconomy: entry.fuelEconomy ? Number(entry.fuelEconomy) : undefined,
      createdById: entry.createdById ?? undefined,
      createdAt: entry.createdAt,
      updatedAt: entry.updatedAt,
      vehicle: entry.vehicle,
      createdBy: entry.createdBy,
    }
  }
}

interface FuelEntry {
  id: string
  entryDate: Date
  vehicleId: string
  station: string
  fuelType: 'DIESEL' | 'PETROL' | 'CNG' | 'ELECTRIC'
  litres: number
  ratePerLitre: number
  totalAmount: number
  odometerReading: number
  kmSinceLastFill: number
  fuelEconomy?: number
  createdById?: string
  createdAt: Date
  updatedAt: Date
  vehicle?: { id: string; vehicleNo: string; makeModel: string }
  createdBy?: { id: string; name: string | null; email: string }
}