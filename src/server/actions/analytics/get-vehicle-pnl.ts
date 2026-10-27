'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import {
  calculatePnL,
  calculateCPK,
  calculateRPK,
} from '@/server/utils/calculations'

export async function getVehiclePnL(vehicleId: string, startDate: Date, endDate: Date) {
  const vehicle = await prisma.vehicle.findUnique({
    where: { id: vehicleId },
  })

  if (!vehicle) {
    throw new Error('Vehicle not found')
  }

  const [trips, fuelEntries, maintenanceJobs, tyres] = await Promise.all([
    prisma.trip.findMany({
      where: {
        vehicleId,
        status: 'COMPLETED',
        tripDate: { gte: startDate, lte: endDate },
      },
    }),
    prisma.fuelEntry.findMany({
      where: {
        vehicleId,
        entryDate: { gte: startDate, lte: endDate },
      },
    }),
    prisma.maintenanceJob.findMany({
      where: {
        vehicleId,
        jobDate: { gte: startDate, lte: endDate },
      },
    }),
    prisma.tyre.findMany({
      where: {
        vehicleId,
        purchaseDate: { gte: startDate, lte: endDate },
      },
    }),
  ])

  const totalRevenue = trips.reduce((sum, trip) => sum + Number(trip.revenue), 0)
  const fuelCost = fuelEntries.reduce((sum, entry) => sum + Number(entry.totalAmount), 0)
  const maintenanceCost = maintenanceJobs.reduce((sum, job) => sum + Number(job.totalCost), 0)
  const tyreCost = tyres.reduce((sum, tyre) => sum + Number(tyre.purchaseCost), 0)
  const overheads = 0
  const totalCost = fuelCost + maintenanceCost + tyreCost + overheads
  const netProfit = totalRevenue - totalCost
  const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0
  const totalKm = trips.reduce((sum, trip) => sum + Number(trip.totalKm), 0)
  const cpk = calculateCPK(totalCost, totalKm)
  const rpk = calculateRPK(totalRevenue, totalKm)

  return {
    vehicleId,
    vehicleNo: vehicle.vehicleNo,
    totalRevenue,
    fuelCost,
    maintenanceCost,
    tyreCost,
    overheads,
    totalCost,
    netProfit,
    profitMargin,
    totalKm,
    cpk,
    rpk,
  }
}
