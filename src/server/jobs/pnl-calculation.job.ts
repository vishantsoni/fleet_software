import prisma from '@/lib/prisma'
import { pnlQueue } from './queue'

export async function processPnLCalculations() {
  const vehicles = await prisma.vehicle.findMany({
    where: { status: 'ACTIVE' },
  })

  const results = []

  for (const vehicle of vehicles) {
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - 30)

    const trips = await prisma.trip.findMany({
      where: {
        vehicleId: vehicle.id,
        status: 'COMPLETED',
        tripDate: { gte: startDate, lte: endDate },
      },
    })

    const fuelEntries = await prisma.fuelEntry.findMany({
      where: {
        vehicleId: vehicle.id,
        entryDate: { gte: startDate, lte: endDate },
      },
    })

    const maintenanceJobs = await prisma.maintenanceJob.findMany({
      where: {
        vehicleId: vehicle.id,
        jobDate: { gte: startDate, lte: endDate },
      },
    })

    const tyres = await prisma.tyre.findMany({
      where: {
        vehicleId: vehicle.id,
        purchaseDate: { gte: startDate, lte: endDate },
      },
    })

    const totalRevenue = trips.reduce((sum, trip) => sum + Number(trip.revenue), 0)
    const fuelCost = fuelEntries.reduce((sum, entry) => sum + Number(entry.totalAmount), 0)
    const maintenanceCost = maintenanceJobs.reduce((sum, job) => sum + Number(job.totalCost), 0)
    const tyreCost = tyres.reduce((sum, tyre) => sum + Number(tyre.purchaseCost), 0)
    const overheads = 0
    const totalCost = fuelCost + maintenanceCost + tyreCost + overheads
    const netProfit = totalRevenue - totalCost
    const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0
    const totalKm = trips.reduce((sum, trip) => sum + Number(trip.totalKm), 0)
    const cpk = totalKm > 0 ? totalCost / totalKm : null
    const rpk = totalKm > 0 ? totalRevenue / totalKm : null

    const pnlData = {
      vehicleId: vehicle.id,
      period: { start: startDate, end: endDate },
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

    results.push(pnlData)

    await pnlQueue.add(
      'pnl-calculation',
      { vehicleId: vehicle.id, ...pnlData },
      {
        jobId: `pnl-${vehicle.id}-${startDate.toISOString().split('T')[0]}`,
      }
    )
  }

  return results
}
