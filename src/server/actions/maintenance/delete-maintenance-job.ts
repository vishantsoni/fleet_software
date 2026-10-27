'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function deleteMaintenanceJob(id: string) {
  const job = await prisma.maintenanceJob.delete({
    where: { id },
  })

  revalidatePath('/maintenance')

  return job
}
