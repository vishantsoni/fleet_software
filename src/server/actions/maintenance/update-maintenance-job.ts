'use server'

import { z } from 'zod'
import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { UpdateMaintenanceJobSchema } from '@/server/utils/validators'

export async function updateMaintenanceJob(id: string, input: z.infer<typeof UpdateMaintenanceJobSchema>) {
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

  return job
}
