'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

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
