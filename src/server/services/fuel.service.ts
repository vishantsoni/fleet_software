import prisma from '@/lib/prisma'
import type { Prisma } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'
import { calculateFuelMetrics } from '@/server/utils/calculations'

export class FuelService {
  static async previewMetrics(input: {
    vehicleId: string
    entryDate: Date
    odometerReading: number
    litres: number
    entryId?: string
  }) {
    const [entries, existingEntry] = await Promise.all([
      prisma.fuelEntry.findMany({
        where: { vehicleId: input.vehicleId },
        orderBy: [{ entryDate: 'asc' }, { createdAt: 'asc' }, { id: 'asc' }],
        select: {
          id: true,
          entryDate: true,
          createdAt: true,
          odometerReading: true,
        },
      }),
      input.entryId
        ? prisma.fuelEntry.findUnique({
            where: { id: input.entryId },
            select: { createdAt: true },
          })
        : Promise.resolve(null),
    ])

    const candidate = {
      id: input.entryId ?? 'zzzz-fuel-preview',
      entryDate: input.entryDate,
      createdAt: existingEntry?.createdAt ?? new Date(),
      odometerReading: input.odometerReading,
    }

    const chronologicalEntries = entries
      .filter((entry) => entry.id !== input.entryId)
      .concat(candidate)
      .sort((a, b) =>
        a.entryDate.getTime() - b.entryDate.getTime() ||
        a.createdAt.getTime() - b.createdAt.getTime() ||
        a.id.localeCompare(b.id)
      )
    const entryIndex = chronologicalEntries.findIndex((entry) => entry.id === candidate.id)
    const previousEntry = chronologicalEntries[entryIndex - 1]

    if (!previousEntry) {
      return { kmSinceLastFill: null, fuelEconomy: null }
    }
    if (input.odometerReading < previousEntry.odometerReading) {
      throw new Error('Odometer reading is below the previous fuel entry for this vehicle.')
    }

    const { kmSinceLastFill, fuelEconomy } = calculateFuelMetrics(
      input.odometerReading,
      previousEntry.odometerReading,
      input.litres
    )
    return {
      kmSinceLastFill,
      fuelEconomy,
    }
  }

  private static async recalculateVehicleMetrics(
    tx: Prisma.TransactionClient,
    vehicleId: string
  ) {
    const entries = await tx.fuelEntry.findMany({
      where: { vehicleId },
      orderBy: [{ entryDate: 'asc' }, { createdAt: 'asc' }, { id: 'asc' }],
      select: {
        id: true,
        odometerReading: true,
        litres: true,
        kmSinceLastFill: true,
        fuelEconomy: true,
      },
    })

    let previousOdometer: number | null = null
    for (const entry of entries) {
      if (previousOdometer !== null && entry.odometerReading < previousOdometer) {
        throw new Error(
          'Fuel entries are out of odometer order. Correct the entry dates or odometer readings before saving.'
        )
      }
      const metrics = calculateFuelMetrics(
        entry.odometerReading,
        previousOdometer,
        Number(entry.litres)
      )

      const fuelEconomy =
        metrics.fuelEconomy === null ? null : new Decimal(metrics.fuelEconomy)
      if (
        !entry.kmSinceLastFill.equals(new Decimal(metrics.kmSinceLastFill)) ||
        (entry.fuelEconomy === null
          ? fuelEconomy !== null
          : fuelEconomy === null || !entry.fuelEconomy.equals(fuelEconomy))
      ) {
        await tx.fuelEntry.update({
          where: { id: entry.id },
          data: {
            kmSinceLastFill: new Decimal(metrics.kmSinceLastFill),
            fuelEconomy,
          },
        })
      }

      previousOdometer = entry.odometerReading
    }

    const [vehicle, latestMaintenance] = await Promise.all([
      tx.vehicle.findUniqueOrThrow({
        where: { id: vehicleId },
        select: { currentOdometer: true },
      }),
      tx.maintenanceJob.findFirst({
        where: { vehicleId },
        orderBy: [{ jobDate: 'desc' }, { createdAt: 'desc' }],
        select: { odometerAtService: true },
      }),
    ])

    const currentOdometer = Math.max(
      vehicle.currentOdometer,
      previousOdometer ?? 0,
      latestMaintenance?.odometerAtService ?? 0
    )

    if (currentOdometer !== vehicle.currentOdometer) {
      await tx.vehicle.update({
        where: { id: vehicleId },
        data: { currentOdometer },
      })
    }
  }

  private static async getCalculatedMetrics(entry: {
    id: string
    entryDate: Date
    createdAt: Date
    vehicleId: string
    odometerReading: number
    litres: Decimal
  }) {
    const previousEntry = await prisma.fuelEntry.findFirst({
      where: {
        vehicleId: entry.vehicleId,
        OR: [
          { entryDate: { lt: entry.entryDate } },
          {
            entryDate: entry.entryDate,
            createdAt: { lt: entry.createdAt },
          },
          {
            entryDate: entry.entryDate,
            createdAt: entry.createdAt,
            id: { lt: entry.id },
          },
        ],
      },
      orderBy: [{ entryDate: 'desc' }, { createdAt: 'desc' }, { id: 'desc' }],
      select: { odometerReading: true },
    })

    if (!previousEntry || entry.odometerReading < previousEntry.odometerReading) {
      return { kmSinceLastFill: 0, fuelEconomy: undefined }
    }

    const { kmSinceLastFill, fuelEconomy } = calculateFuelMetrics(
      entry.odometerReading,
      previousEntry.odometerReading,
      Number(entry.litres)
    )
    return {
      kmSinceLastFill,
      fuelEconomy: fuelEconomy ?? undefined,
    }
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
    const totalAmount = input.totalAmount ?? input.litres * input.ratePerLitre
    const entry = await prisma.$transaction(async (tx) => {
      const created = await tx.fuelEntry.create({
        data: {
          entryDate: input.entryDate,
          vehicleId: input.vehicleId,
          station: input.station,
          fuelType: input.fuelType,
          litres: new Decimal(input.litres),
          ratePerLitre: new Decimal(input.ratePerLitre),
          totalAmount: new Decimal(totalAmount),
          odometerReading: input.odometerReading,
          kmSinceLastFill: new Decimal(0),
          fuelEconomy: null,
          createdById: input.createdById,
        },
      })

      await this.recalculateVehicleMetrics(tx, input.vehicleId)
      return tx.fuelEntry.findUniqueOrThrow({ where: { id: created.id } })
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
    const entry = await prisma.$transaction(async (tx) => {
      const existing = await tx.fuelEntry.findUnique({ where: { id } })
      if (!existing) throw new Error('Fuel entry not found')

      const vehicleId = input.vehicleId ?? existing.vehicleId
      const litres = input.litres ?? Number(existing.litres)
      const ratePerLitre = input.ratePerLitre ?? Number(existing.ratePerLitre)
      const totalAmount = input.totalAmount ?? litres * ratePerLitre

      const updated = await tx.fuelEntry.update({
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
          totalAmount: new Decimal(totalAmount),
        },
      })

      if (existing.vehicleId !== vehicleId) {
        await this.recalculateVehicleMetrics(tx, existing.vehicleId)
      }
      await this.recalculateVehicleMetrics(tx, vehicleId)
      return tx.fuelEntry.findUniqueOrThrow({ where: { id: updated.id } })
    })

    return this.transformEntry(entry)
  }

  static async delete(id: string) {
    await prisma.$transaction(async (tx) => {
      const existing = await tx.fuelEntry.findUnique({ where: { id } })
      if (!existing) throw new Error('Fuel entry not found')

      await tx.fuelEntry.delete({ where: { id } })
      await this.recalculateVehicleMetrics(tx, existing.vehicleId)
    })

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
    const metrics = await this.getCalculatedMetrics(entry)
    return this.transformEntry(entry, metrics)
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
      entries: await Promise.all(
        entries.map(async (entry) =>
          this.transformEntry(entry, await this.getCalculatedMetrics(entry))
        )
      ),
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
      entries: await Promise.all(
        entries.map(async (entry) =>
          this.transformEntry(entry, await this.getCalculatedMetrics(entry))
        )
      ),
      total,
    }
  }

  private static transformEntry(
    entry: {
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
    createdBy?: { id: string; name: string | null; email: string } | null
    },
    metrics?: { kmSinceLastFill: number; fuelEconomy: number | undefined }
  ): FuelEntry {
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
      kmSinceLastFill: metrics ? metrics.kmSinceLastFill : Number(entry.kmSinceLastFill),
      fuelEconomy: metrics
        ? metrics.fuelEconomy
        : entry.fuelEconomy === null
          ? undefined
          : Number(entry.fuelEconomy),
      createdById: entry.createdById ?? undefined,
      createdAt: entry.createdAt,
      updatedAt: entry.updatedAt,
      vehicle: entry.vehicle,
      createdBy: entry.createdBy ?? undefined,
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