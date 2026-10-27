'use server'

import prisma from '@/lib/prisma'

export async function getMaintenanceJob(id: string) {
  const job = await prisma.maintenanceJob.findUnique({
    where: { id },
    include: {
      vehicle: true,
      workshop: true,
    },
  })

  if (!job) {
    throw new Error('Maintenance job not found')
  }

  return job
}
