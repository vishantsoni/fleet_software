'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function fitBattery(input: any) {
  const data = { ...input, purchaseDate: new Date(input.purchaseDate) }
  const battery = await prisma.battery.create({
    data,
    include: { vehicle: true },
  })
  revalidatePath('/batteries')
  revalidatePath('/dashboard')
  return battery
}

export async function removeBattery(id: string, removalOdometer: number) {
  const battery = await prisma.battery.findUnique({ where: { id }, include: { vehicle: true } })
  if (!battery) throw new Error('Battery not found')
  const updated = await prisma.battery.update({
    where: { id },
    data: { status: 'REMOVED', removalOdometer },
    include: { vehicle: true },
  })
  revalidatePath('/batteries')
  return updated
}

export async function scrapBattery(id: string) {
  const battery = await prisma.battery.update({
    where: { id },
    data: { status: 'SCRAPPED' },
    include: { vehicle: true },
  })
  revalidatePath('/batteries')
  return battery
}

export async function listBatteries(filters: { page?: number; limit?: number; vehicleId?: string; status?: string; brand?: string }) {
  const { page = 1, limit = 20, vehicleId, status, brand } = filters
  const where: any = {}
  if (vehicleId) where.vehicleId = vehicleId
  if (status) where.status = status
  if (brand) where.brand = { contains: brand, mode: 'insensitive' }
  const [batteries, total] = await Promise.all([
    prisma.battery.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { purchaseDate: 'desc' }, include: { vehicle: true } }),
    prisma.battery.count({ where }),
  ])
  return { batteries, total, page, limit, totalPages: Math.ceil(total / limit) }
}

export async function getBattery(id: string) {
  const battery = await prisma.battery.findUnique({ where: { id }, include: { vehicle: true } })
  if (!battery) throw new Error('Battery not found')
  return battery
}
