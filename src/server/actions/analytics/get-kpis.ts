'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import {
  calculateCPK,
  calculateRPK,
} from '@/server/utils/calculations'

export async function getKPIs({ workshopId }: { workshopId?: string } = {}) {
  const [vehicleCount, activeVehicleCount, activeDriverCount, trips] = await Promise.all([
    prisma.vehicle.count(),
    prisma.vehicle.count({ where: { status: 'ACTIVE' } }),
    prisma.driver.count({ where: { status: 'ACTIVE' } }),
    prisma.trip.findMany({
      where: { status: 'COMPLETED' },
      include: { vehicle: true },
    }),
  ])

  const totalRevenue = trips.reduce((sum, trip) => sum + Number(trip.revenue), 0)
  const totalKm = trips.reduce((sum, trip) => sum + Number(trip.totalKm), 0)

  const fuelCost = await prisma.fuelEntry.aggregate({
    _sum: { totalAmount: true },
  })

  const maintenanceCost = await prisma.maintenanceJob.aggregate({
    where: workshopId ? { workshopId } : undefined,
    _sum: { totalCost: true },
  })

  const tyreCost = await prisma.tyre.aggregate({
    _sum: { purchaseCost: true },
  })

  const totalCost =
    Number(fuelCost._sum.totalAmount || 0) +
    Number(maintenanceCost._sum.totalCost || 0) +
    Number(tyreCost._sum.purchaseCost || 0)

  const netProfit = totalRevenue - totalCost
  const fleetCpk = calculateCPK(totalCost, totalKm)
  const fleetRpk = calculateRPK(totalRevenue, totalKm)

  return {
    totalRevenue,
    totalCost,
    netProfit,
    totalKm,
    fleetCpk,
    fleetRpk,
    vehicleCount,
    activeVehicleCount,
    activeDriverCount,
  }
}