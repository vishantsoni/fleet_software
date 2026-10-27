'use server'

import { z } from 'zod'
import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { CreateTyreSchema, UpdateTyreSchema } from '@/server/utils/validators'

export async function fitTyre(input: z.infer<typeof CreateTyreSchema>) {
  const validated = CreateTyreSchema.parse(input)

  const tyre = await prisma.tyre.create({
    data: validated,
    include: {
      vehicle: true,
    },
  })

  revalidatePath('/tyres')
  revalidatePath('/dashboard')

  return tyre
}

export async function removeTyre(id: string, removalOdometer: number) {
  const tyre = await prisma.tyre.findUnique({
    where: { id },
    include: { vehicle: true },
  })

  if (!tyre) {
    throw new Error('Tyre not found')
  }

  if (removalOdometer <= tyre.fittedOdometer) {
    throw new Error('Removal odometer must be greater than fitted odometer')
  }

  const costPerKm = tyre.purchaseCost / (removalOdometer - tyre.fittedOdometer)

  const updated = await prisma.tyre.update({
    where: { id },
    data: {
      status: 'REMOVED',
      removalOdometer,
      costPerKm,
    },
    include: {
      vehicle: true,
    },
  })

  revalidatePath('/tyres')

  return updated
}

export async function scrapTyre(id: string) {
  const tyre = await prisma.tyre.update({
    where: { id },
    data: {
      status: 'SCRAPPED',
    },
    include: {
      vehicle: true,
    },
  })

  revalidatePath('/tyres')

  return tyre
}

export async function listTyres(filters: {
  page?: number
  limit?: number
  vehicleId?: string
  status?: string
  brand?: string
}) {
  const { page = 1, limit = 20, vehicleId, status, brand } = filters

  const where: any = {}

  if (vehicleId) where.vehicleId = vehicleId
  if (status) where.status = status
  if (brand) where.brand = { contains: brand, mode: 'insensitive' }

  const [tyres, total] = await Promise.all([
    prisma.tyre.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { purchaseDate: 'desc' },
      include: {
        vehicle: true,
      },
    }),
    prisma.tyre.count({ where }),
  ])

  return {
    tyres,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  }
}

export async function getTyre(id: string) {
  const tyre = await prisma.tyre.findUnique({
    where: { id },
    include: {
      vehicle: true,
    },
  })

  if (!tyre) {
    throw new Error('Tyre not found')
  }

  return tyre
}
