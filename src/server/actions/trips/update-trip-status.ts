'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { completeTrip } from './complete-trip'

export async function updateTripStatus(
  id: string,
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
) {
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
    throw new Error('Trip not found')
  }

  const allowed = validTransitions[trip.status]
  if (!allowed.includes(status)) {
    throw new Error(`Invalid status transition from ${trip.status} to ${status}`)
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

  return updated
}
