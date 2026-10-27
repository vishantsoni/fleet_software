import prisma from '@/lib/prisma'
import { createVehicleSchema } from '@/types/vehicle'
import { Decimal } from '@prisma/client/runtime/library'

export class VehicleService {
  static async create(input: { vehicleNo: string }) {
    const validated = createVehicleSchema.parse(input)

    const vehicle = await prisma.vehicle.create({
      data: {
        ...validated,
        vehicleNo: validated.vehicleNo.toUpperCase(),
      },
    })

    return {
      ...vehicle,
      capacityTonnage: Number(vehicle.capacityTonnage),
    }
  }

  static async update(id: string, input: { vehicleNo: string }) {
    const validated = createVehicleSchema.partial().parse({ ...input, id })

    const data: Record<string, unknown> = { ...validated }
    if (data.vehicleNo) {
      data.vehicleNo = (data.vehicleNo as string).toUpperCase()
    }

    const vehicle = await prisma.vehicle.update({
      where: { id },
      data,
    })

    return {
      ...vehicle,
      capacityTonnage: Number(vehicle.capacityTonnage),
    }
  }

  static async delete(id: string) {
    const activeTrips = await prisma.trip.count({
      where: {
        vehicleId: id,
        status: { in: ['SCHEDULED', 'IN_PROGRESS'] },
      },
    })

    if (activeTrips > 0) {
      throw new Error('Cannot delete vehicle with active trips')
    }

    await prisma.vehicle.update({
      where: { id },
      data: { status: 'INACTIVE' },
    })
  }

  static async findById(id: string) {
    const vehicle = await prisma.vehicle.findUnique({
      where: { id },
      include: {
        trips: {
          take: 10,
          orderBy: { tripDate: 'desc' },
        },
        fuelEntries: {
          take: 10,
          orderBy: { entryDate: 'desc' },
        },
        maintenanceJobs: {
          take: 10,
          orderBy: { jobDate: 'desc' },
        },
        tyres: {
          take: 10,
          orderBy: { purchaseDate: 'desc' },
        },
      },
    })

    if (!vehicle) return null

    return {
      ...vehicle,
      capacityTonnage: Number(vehicle.capacityTonnage),
      trips: vehicle.trips.map((trip) => ({
        ...trip,
        totalKm: Number(trip.totalKm),
        freightAmount: Number(trip.freightAmount),
        revenue: Number(trip.revenue),
      })),
      fuelEntries: vehicle.fuelEntries.map((entry) => ({
        ...entry,
        litres: Number(entry.litres),
        ratePerLitre: Number(entry.ratePerLitre),
        totalAmount: Number(entry.totalAmount),
        kmSinceLastFill: Number(entry.kmSinceLastFill),
        fuelEconomy: entry.fuelEconomy ? Number(entry.fuelEconomy) : null,
      })),
      maintenanceJobs: vehicle.maintenanceJobs.map((job) => ({
        ...job,
        partsCost: Number(job.partsCost),
        labourCost: Number(job.labourCost),
        totalCost: Number(job.totalCost),
      })),
      tyres: vehicle.tyres.map((tyre) => ({
        ...tyre,
        purchaseCost: Number(tyre.purchaseCost),
        costPerKm: tyre.costPerKm ? Number(tyre.costPerKm) : null,
      })),
    }
  }

  static async findAll(page: number, limit: number) {
    const skip = (page - 1) * limit
    const [vehicles, total] = await Promise.all([
      prisma.vehicle.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.vehicle.count(),
    ])

    return {
      vehicles: vehicles.map((v) => ({
        ...v,
        capacityTonnage: Number(v.capacityTonnage),
      })),
      total,
    }
  }

  static async search(
    page: number,
    limit: number,
    search?: string,
    ownerType?: string,
    status?: string
  ) {
    const skip = (page - 1) * limit
    const where: Record<string, unknown> = {}

    if (search) {
      where.OR = [
        { vehicleNo: { contains: search, mode: 'insensitive' } },
        { makeModel: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (ownerType) {
      where.ownerType = ownerType as 'OWNED' | 'MARKET'
    }

    if (status) {
      where.status = status
    }

    const [vehicles, total] = await Promise.all([
      prisma.vehicle.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.vehicle.count({ where }),
    ])

    return {
      vehicles: vehicles.map((v) => ({
        ...v,
        capacityTonnage: Number(v.capacityTonnage),
      })),
      total,
    }
  }
}
