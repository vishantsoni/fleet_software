'use server'

import prisma from '@/lib/prisma'

export async function listMaintenanceJobs(filters: {
  page?: number
  limit?: number
  vehicleId?: string
  jobType?: string
  startDate?: string
  endDate?: string
}) {
  const { page = 1, limit = 20, vehicleId, jobType, startDate, endDate } = filters

  const where: any = {}

  if (vehicleId) where.vehicleId = vehicleId
  if (jobType) where.jobType = jobType

  if (startDate || endDate) {
    where.jobDate = {}
    if (startDate) where.jobDate.gte = new Date(startDate)
    if (endDate) where.jobDate.lte = new Date(endDate)
  }

  const [jobs, total] = await Promise.all([
    prisma.maintenanceJob.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { jobDate: 'desc' },
      include: {
        vehicle: true,
        workshop: true,
      },
    }),
    prisma.maintenanceJob.count({ where }),
  ])

  return {
    jobs,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  }
}
