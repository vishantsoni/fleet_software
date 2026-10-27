'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function getTrip(id: string) {
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
    throw new Error('Trip not found')
  }

  return trip
}
