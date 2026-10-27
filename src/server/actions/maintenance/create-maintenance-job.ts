'use server'

import { z } from 'zod'
import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { CreateMaintenanceJobSchema, UpdateMaintenanceJobSchema } from '@/server/utils/validators'

export async function createMaintenanceJobAction(input: z.infer<typeof CreateMaintenanceJobSchema>) {
  try {
    const validated = CreateMaintenanceJobSchema.parse(input)

    const totalCost = Number(validated.partsCost) + Number(validated.labourCost)

    const job = await prisma.maintenanceJob.create({
      data: {
        ...validated,
        partsCost: validated.partsCost,
        labourCost: validated.labourCost,
        totalCost,
      },
      include: {
        vehicle: true,
        workshop: true,
      },
    })

    revalidatePath('/maintenance')
    revalidatePath('/dashboard')

    return { success: true, data: job }
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: 'An unknown error occurred' }
  }
}

export async function updateMaintenanceJobAction(id: string, input: z.infer<typeof UpdateMaintenanceJobSchema>) {
  try {
    const validated = UpdateMaintenanceJobSchema.parse(input)

    const totalCost = Number(validated.partsCost ?? 0) + Number(validated.labourCost ?? 0)

    const job = await prisma.maintenanceJob.update({
      where: { id },
      data: {
        ...validated,
        totalCost,
      },
      include: {
        vehicle: true,
        workshop: true,
      },
    })

    revalidatePath('/maintenance')
    revalidatePath(`/maintenance/${id}`)

    return { success: true, data: job }
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: 'An unknown error occurred' }
  }
}

export async function deleteMaintenanceJobAction(id: string) {
  try {
    const job = await prisma.maintenanceJob.delete({
      where: { id },
    })

    revalidatePath('/maintenance')

    return { success: true, data: job }
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: 'An unknown error occurred' }
  }
}

export async function listMaintenanceJobsAction(filters: {
  page?: number
  limit?: number
  vehicleId?: string
  jobType?: string
  startDate?: string
  endDate?: string
}) {
  try {
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
      success: true,
      jobs,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: 'An unknown error occurred' }
  }
}

export async function getMaintenanceJobAction(id: string) {
  try {
    const job = await prisma.maintenanceJob.findUnique({
      where: { id },
      include: {
        vehicle: true,
        workshop: true,
      },
    })

    if (!job) {
      return { success: false, error: 'Maintenance job not found' }
    }

    return { success: true, data: job }
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: 'An unknown error occurred' }
  }
}
