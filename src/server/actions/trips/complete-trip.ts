'use server'

import { revalidatePath } from 'next/cache'
import prisma from '@/lib/prisma'

export async function completeTrip(id: string, endOdometer?: number, endDateTime?: Date) {
  const trip = await prisma.trip.findUnique({
    where: { id },
    select: {
      id: true,
      status: true,
      tripType: true,
      includedKm: true,
      baseAmount: true,
      perKmRate: true,
      startOdometer: true,
      totalKm: true,
      revenue: true,
    },
  })

  if (!trip) {
    return { success: false, error: 'Trip not found' }
  }

  const validTransitions: Record<string, string[]> = {
    SCHEDULED: ['IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
    IN_PROGRESS: ['COMPLETED', 'CANCELLED'],
    COMPLETED: [],
    CANCELLED: [],
  }

  const allowed = validTransitions[trip.status]
  if (!allowed.includes('COMPLETED')) {
    return { success: false, error: `Invalid status transition from ${trip.status} to COMPLETED` }
  }

  let revenue = Number(trip.revenue ?? 0)
  let totalKm = Number(trip.totalKm ?? 0)

  if (trip.tripType === 'PACKAGE' && endOdometer != null && trip.startOdometer != null) {
    const actualKm = endOdometer - Number(trip.startOdometer ?? 0)
    totalKm = actualKm
    const includedKm = Number(trip.includedKm ?? 0)
    const perKmRate = Number(trip.perKmRate ?? 0)
    const baseAmount = Number(trip.baseAmount ?? 0)
    const extraKm = Math.max(0, actualKm - includedKm)
    revenue = baseAmount + extraKm * perKmRate
  }

  const updated = await prisma.trip.update({
    where: { id },
    data: {
      status: 'COMPLETED',
      ...(endOdometer != null ? { endOdometer } : {}),
      ...(endDateTime != null ? { endDateTime } : {}),
      ...(totalKm != null ? { totalKm } : {}),
      ...(revenue != null ? { revenue } : {}),
    },
    include: {
      vehicle: true,
      driver: true,
      customer: true,
    },
  })

  revalidatePath('/trips')
  revalidatePath(`/trips/${id}`)

  return { success: true, data: updated }
}
