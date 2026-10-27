'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import {
  calculatePnL,
  calculateCPK,
  calculateRPK,
} from '@/server/utils/calculations'
import { formatCurrency, formatNumber } from '@/server/utils/formatters'

export async function getFleetPnL(startDate: Date, endDate: Date) {
  const vehicles = await prisma.vehicle.findMany({
    where: { status: 'ACTIVE' },
  })

  const vehicleData = await Promise.all(
    vehicles.map(async (vehicle) => {
      const [trips, fuelEntries, maintenanceJobs, tyres] = await Promise.all([
        prisma.trip.findMany({
          where: {
            vehicleId: vehicle.id,
            status: 'COMPLETED',
            tripDate: { gte: startDate, lte: endDate },
          },
        }),
        prisma.fuelEntry.findMany({
          where: {
            vehicleId: vehicle.id,
            entryDate: { gte: startDate, lte: endDate },
          },
        }),
        prisma.maintenanceJob.findMany({
          where: {
            vehicleId: vehicle.id,
            jobDate: { gte: startDate, lte: endDate },
          },
        }),
        prisma.tyre.findMany({
          where: {
            vehicleId: vehicle.id,
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
        vehicleId: vehicle.id,
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
    })
  )

  const totals = vehicleData.reduce(
    (acc, v) => ({
      totalRevenue: acc.totalRevenue + v.totalRevenue,
      fuelCost: acc.fuelCost + v.fuelCost,
      maintenanceCost: acc.maintenanceCost + v.maintenanceCost,
      tyreCost: acc.tyreCost + v.tyreCost,
      overheads: acc.overheads + v.overheads,
      totalCost: acc.totalCost + v.totalCost,
      netProfit: acc.netProfit + v.netProfit,
      totalKm: acc.totalKm + v.totalKm,
    }),
    {
      totalRevenue: 0,
      fuelCost: 0,
      maintenanceCost: 0,
      tyreCost: 0,
      overheads: 0,
      totalCost: 0,
      netProfit: 0,
      totalKm: 0,
    }
  )

  return {
    vehicles: vehicleData,
    totals: {
      ...totals,
      profitMargin: totals.totalRevenue > 0 ? (totals.netProfit / totals.totalRevenue) * 100 : 0,
      cpk: calculateCPK(totals.totalCost, totals.totalKm),
      rpk: calculateRPK(totals.totalRevenue, totals.totalKm),
    },
  }
}

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

export async function getKPIs() {
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

export async function getRevenueByPeriod(startDate: Date, endDate: Date) {
  const trips = await prisma.trip.findMany({
    where: {
      status: 'COMPLETED',
      tripDate: { gte: startDate, lte: endDate },
    },
    include: {
      fuelEntries: true,
      maintenanceJobs: true,
    },
  })

  const dailyData = new Map<string, { revenue: number; cost: number; profit: number }>()

  for (const trip of trips) {
    const dateKey = new Date(trip.tripDate).toISOString().split('T')[0]
    const existing = dailyData.get(dateKey) || { revenue: 0, cost: 0, profit: 0 }

    existing.revenue += Number(trip.revenue)
    existing.profit += Number(trip.revenue)

    dailyData.set(dateKey, existing)
  }

  const fuelEntries = await prisma.fuelEntry.findMany({
    where: {
      entryDate: { gte: startDate, lte: endDate },
    },
  })

  for (const entry of fuelEntries) {
    const dateKey = new Date(entry.entryDate).toISOString().split('T')[0]
    const existing = dailyData.get(dateKey) || { revenue: 0, cost: 0, profit: 0 }

    existing.cost += Number(entry.totalAmount)
    existing.profit -= Number(entry.totalAmount)

    dailyData.set(dateKey, existing)
  }

  const maintenanceJobs = await prisma.maintenanceJob.findMany({
    where: {
      jobDate: { gte: startDate, lte: endDate },
    },
  })

  for (const job of maintenanceJobs) {
    const dateKey = new Date(job.jobDate).toISOString().split('T')[0]
    const existing = dailyData.get(dateKey) || { revenue: 0, cost: 0, profit: 0 }

    existing.cost += Number(job.totalCost)
    existing.profit -= Number(job.totalCost)

    dailyData.set(dateKey, existing)
  }

  return Array.from(dailyData.entries())
    .map(([date, data]) => ({
      date,
      ...data,
    }))
    .sort((a, b) => a.date.localeCompare(b.date))
}
