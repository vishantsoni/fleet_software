'use server'

import { z } from 'zod'
import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { UpdateTripSchema } from '@/server/utils/validators'

export async function updateTrip(id: string, input: z.infer<typeof UpdateTripSchema>) {
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

  return trip
}
