'use server'

import { z } from 'zod'
import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { TripSchema, CreateTripSchema, UpdateTripSchema } from '@/server/utils/validators'

function calculatePackageRevenue(input: z.infer<typeof CreateTripSchema>) {
  if (input.tripType !== 'PACKAGE') return input.revenue ?? 0

  const baseAmount = input.baseAmount ?? 0
  const includedKm = input.includedKm ?? 0
  const perKmRate = input.perKmRate ?? 0
  const totalKm = input.totalKm ?? 0

  const extraKm = Math.max(0, totalKm - includedKm)
  const extraAmount = extraKm * perKmRate

  return baseAmount + extraAmount
}

export async function createTrip(input: z.infer<typeof CreateTripSchema>) {
  try {
    const validated = CreateTripSchema.parse(input)

    const revenue = calculatePackageRevenue(validated)

    const trip = await prisma.trip.create({
      data: {
        ...validated,
        revenue,
      },
      include: {
        vehicle: true,
        driver: true,
        customer: true,
      },
    })

    revalidatePath('/trips')
    revalidatePath('/dashboard')

    return { success: true, data: trip }
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: 'An unknown error occurred' }
  }
}

export async function updateTrip(id: string, input: z.infer<typeof UpdateTripSchema>) {
  try {
    const validated = UpdateTripSchema.parse(input)

    const trip = await prisma.trip.update({
      where: { id },
      data: validated,
      include: {
        vehicle: true,
        driver: true,
        customer: true,
      },
    })

    revalidatePath('/trips')
    revalidatePath(`/trips/${id}`)

    return { success: true, data: trip }
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: 'An unknown error occurred' }
  }
}

export async function updateTripStatus(
  id: string,
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
) {
  try {
    const validTransitions: Record<string, string[]> = {
      SCHEDULED: ['IN_PROGRESS', 'CANCELLED'],
      IN_PROGRESS: ['COMPLETED', 'CANCELLED'],
      COMPLETED: [],
      CANCELLED: [],
    }

    const trip = await prisma.trip.findUnique({
      where: { id },
      select: { status: true },
    })

    if (!trip) {
      return { success: false, error: 'Trip not found' }
    }

    const allowed = validTransitions[trip.status]
    if (!allowed.includes(status)) {
      return { success: false, error: `Invalid status transition from ${trip.status} to ${status}` }
    }

    const updated = await prisma.trip.update({
      where: { id },
      data: { status },
      include: {
        vehicle: true,
        driver: true,
        customer: true,
      },
    })

    revalidatePath('/trips')
    revalidatePath(`/trips/${id}`)

    return { success: true, data: updated }
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: 'An unknown error occurred' }
  }
}

export async function listTrips(filters: {
  page?: number
  limit?: number
  vehicleId?: string
  driverId?: string
  status?: string
  startDate?: string
  endDate?: string
}) {
  try {
    const { page = 1, limit = 20, vehicleId, driverId, status, startDate, endDate } = filters

    const where: any = {}

    if (vehicleId) where.vehicleId = vehicleId
    if (driverId) where.driverId = driverId
    if (status) where.status = status

    if (startDate || endDate) {
      where.tripDate = {}
      if (startDate) where.tripDate.gte = new Date(startDate)
      if (endDate) where.tripDate.lte = new Date(endDate)
    }

    const [trips, total] = await Promise.all([
      prisma.trip.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { tripDate: 'desc' },
        include: {
          vehicle: true,
          driver: true,
          customer: true,
        },
      }),
      prisma.trip.count({ where }),
    ])

    return {
      success: true,
      trips,
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

export async function getTrip(id: string) {
  try {
    const trip = await prisma.trip.findUnique({
      where: { id },
      include: {
        vehicle: true,
        driver: true,
        customer: true,
        createdBy: true,
      },
    })

    if (!trip) {
      return { success: false, error: 'Trip not found' }
    }

    return { success: true, data: trip }
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: 'An unknown error occurred' }
  }
}
