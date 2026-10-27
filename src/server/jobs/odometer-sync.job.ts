import prisma from '@/lib/prisma'
import { odometerQueue } from './queue'

export async function syncOdometerReadings() {
  const vehicles = await prisma.vehicle.findMany({
    where: { status: 'ACTIVE' },
  })

  const updates = []

  for (const vehicle of vehicles) {
    const latestFuelEntry = await prisma.fuelEntry.findFirst({
      where: { vehicleId: vehicle.id },
      orderBy: { entryDate: 'desc' },
    })

    const latestMaintenanceJob = await prisma.maintenanceJob.findFirst({
      where: { vehicleId: vehicle.id },
      orderBy: { jobDate: 'desc' },
    })

    const latestTyre = await prisma.tyre.findFirst({
      where: { vehicleId: vehicle.id },
      orderBy: { purchaseDate: 'desc' },
    })

    const readings = [
      latestFuelEntry?.odometerReading,
      latestMaintenanceJob?.odometerAtService,
      latestTyre?.fittedOdometer,
    ].filter((r): r is number => r !== undefined)

    if (readings.length > 0) {
      const maxOdometer = Math.max(...readings)
      if (maxOdometer > vehicle.currentOdometer) {
        updates.push(
          prisma.vehicle.update({
            where: { id: vehicle.id },
            data: { currentOdometer: maxOdometer },
          })
        )

        await odometerQueue.add(
          'odometer-sync',
          { vehicleId: vehicle.id, newOdometer: maxOdometer },
          {
            jobId: `odometer-${vehicle.id}`,
          }
        )
      }
    }
  }

  if (updates.length > 0) {
    await prisma.$transaction(updates)
  }

  return { synced: updates.length }
}
