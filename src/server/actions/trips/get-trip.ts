'use server'

import prisma from '@/lib/prisma'

export async function getTrip(id: string) {
  const trip = await prisma.trip.findUnique({
    where: { id },
    include: {
      vehicle: { select: { id: true, vehicleNo: true, makeModel: true } },
      driver: { select: { id: true, fullName: true, licenseNumber: true, phone: true } },
      customer: { select: { id: true, name: true } },
    },
  })

  if (!trip) {
    throw new Error('Trip not found')
  }

  return trip
}
