import prisma from '@/lib/prisma'
import { Decimal } from '@prisma/client/runtime/library'
import { calculateTotalCost } from '@/server/utils/calculations'
import type {
  CreateMaintenanceJobInput,
  MaintenanceJobWithRelations,
  UpdateMaintenanceJobInput,
} from '@/types/maintenance'

export interface MaintenanceJobFilters {
  vehicleId?: string
  jobType?: string
  dateFrom?: Date
  dateTo?: Date
  search?: string
}

interface MaintenanceJobWithDecimals {
  id: string
  jobDate: Date
  vehicleId: string
  odometerAtService: number
  jobType: string
  workshopId: string | null
  partsCost: Decimal
  labourCost: Decimal
  totalCost: Decimal
  description: string | null
  createdById: string | null
  createdAt: Date
  updatedAt: Date
  vehicle?: {
    id: string
    vehicleNo: string
    makeModel: string
  }
  workshop?: {
    id: string
    name: string
    address?: string | null
    phone?: string | null
  } | null
  createdBy?: {
    id: string
    name: string | null
    email: string
  } | null
}

export class MaintenanceService {
  static async create(input: CreateMaintenanceJobInput) {
    const partsCost = input.partsCost ?? 0
    const labourCost = input.labourCost ?? 0
    const totalCost = input.totalCost ?? calculateTotalCost(partsCost, labourCost)

    const job = await prisma.maintenanceJob.create({
      data: {
        jobDate: input.jobDate,
        vehicleId: input.vehicleId,
        odometerAtService: input.odometerAtService,
        jobType: input.jobType,
        workshopId: input.workshopId ?? null,
        partsCost: new Decimal(partsCost),
        labourCost: new Decimal(labourCost),
        totalCost: new Decimal(totalCost),
        description: input.description ?? null,
      },
    })

    return this.transformJob(job)
  }

  static async update(id: string, input: Partial<CreateMaintenanceJobInput>) {
    const existing = await prisma.maintenanceJob.findUnique({ where: { id } })
    if (!existing) throw new Error('Maintenance job not found')

    const partsCost =
      input.partsCost !== undefined ? input.partsCost : Number(existing.partsCost)
    const labourCost =
      input.labourCost !== undefined ? input.labourCost : Number(existing.labourCost)
    const totalCost = calculateTotalCost(partsCost, labourCost)

    const job = await prisma.maintenanceJob.update({
      where: { id },
      data: {
        ...(input.jobDate !== undefined && { jobDate: input.jobDate }),
        ...(input.vehicleId !== undefined && { vehicleId: input.vehicleId }),
        ...(input.odometerAtService !== undefined && {
          odometerAtService: input.odometerAtService,
        }),
        ...(input.jobType !== undefined && { jobType: input.jobType }),
        ...(input.workshopId !== undefined && {
          workshopId: input.workshopId ?? null,
        }),
        ...(input.partsCost !== undefined && { partsCost: new Decimal(input.partsCost) }),
        ...(input.labourCost !== undefined && {
          labourCost: new Decimal(input.labourCost),
        }),
        totalCost: new Decimal(totalCost),
        ...(input.description !== undefined && {
          description: input.description ?? null,
        }),
      },
    })

    return this.transformJob(job)
  }

  static async delete(id: string) {
    const existing = await prisma.maintenanceJob.findUnique({ where: { id } })
    if (!existing) throw new Error('Maintenance job not found')

    await prisma.maintenanceJob.delete({ where: { id } })

    return { success: true }
  }

  static async findById(id: string) {
    const job = await prisma.maintenanceJob.findUnique({
      where: { id },
      include: {
        vehicle: { select: { id: true, vehicleNo: true, makeModel: true } },
        workshop: {
          select: { id: true, name: true, address: true, phone: true },
        },
        createdBy: { select: { id: true, name: true, email: true } },
      },
    })

    if (!job) return null

    return this.transformJob(job)
  }

  static async findAll(page = 1, limit = 10) {
    const skip = (page - 1) * limit

    const [jobs, total] = await Promise.all([
      prisma.maintenanceJob.findMany({
        skip,
        take: limit,
        orderBy: { jobDate: 'desc' },
        include: {
          vehicle: { select: { id: true, vehicleNo: true, makeModel: true } },
          workshop: { select: { id: true, name: true } },
        },
      }),
      prisma.maintenanceJob.count(),
    ])

    return {
      jobs: jobs.map((job) => this.transformJob(job)),
      total,
      page,
      limit,
    }
  }

  static async search(page = 1, limit = 10, filters: MaintenanceJobFilters = {}) {
    const skip = (page - 1) * limit
    const where: Record<string, unknown> = {}

    if (filters.vehicleId) {
      where.vehicleId = filters.vehicleId
    }

    if (filters.jobType) {
      where.jobType = filters.jobType
    }

    if (filters.dateFrom || filters.dateTo) {
      where.jobDate = {}
      if (filters.dateFrom) {
        (where.jobDate as Record<string, Date>).gte = filters.dateFrom
      }
      if (filters.dateTo) {
        (where.jobDate as Record<string, Date>).lte = filters.dateTo
      }
    }

    if (filters.search) {
      where.OR = [
        { description: { contains: filters.search, mode: 'insensitive' } },
        { vehicle: { vehicleNo: { contains: filters.search, mode: 'insensitive' } } },
        { vehicle: { makeModel: { contains: filters.search, mode: 'insensitive' } } },
        { workshop: { name: { contains: filters.search, mode: 'insensitive' } } },
      ]
    }

    const [jobs, total] = await Promise.all([
      prisma.maintenanceJob.findMany({
        where,
        skip,
        take: limit,
        orderBy: { jobDate: 'desc' },
        include: {
          vehicle: { select: { id: true, vehicleNo: true, makeModel: true } },
          workshop: { select: { id: true, name: true } },
        },
      }),
      prisma.maintenanceJob.count({ where }),
    ])

    return {
      jobs: jobs.map((job) => this.transformJob(job)),
      total,
      page,
      limit,
    }
  }

  private static transformJob(job: MaintenanceJobWithDecimals): MaintenanceJobWithRelations {
    return {
      id: job.id,
      jobDate: job.jobDate,
      vehicleId: job.vehicleId,
      odometerAtService: job.odometerAtService,
      jobType: job.jobType as 'PREVENTATIVE' | 'BREAKDOWN',
      workshopId: job.workshopId ?? undefined,
      partsCost: Number(job.partsCost),
      labourCost: Number(job.labourCost),
      totalCost: Number(job.totalCost),
      description: job.description ?? undefined,
      createdById: job.createdById ?? undefined,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
      vehicle: job.vehicle,
      workshop: job.workshop ?? undefined,
      createdBy: job.createdBy ?? undefined,
    }
  }
}
