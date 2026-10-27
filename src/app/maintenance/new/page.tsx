import { MaintenanceForm } from '../_components/maintenance-form'
import { listVehiclesAction } from '@/server/actions/vehicles'
import prisma from '@/lib/prisma'

export default async function NewMaintenanceJobPage() {
  const [vehiclesResult, workshops] = await Promise.all([
    listVehiclesAction(1, 1000, '', '', 'ACTIVE'),
    prisma.workshop.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true },
    }),
  ])

  if (!vehiclesResult.success || !('vehicles' in vehiclesResult)) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">New Maintenance Job</h1>
          <p className="text-muted-foreground">
            Record a maintenance or repair job for a vehicle in your fleet
          </p>
        </div>
        <div className="text-red-600">{vehiclesResult.error}</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">New Maintenance Job</h1>
        <p className="text-muted-foreground">
          Record a maintenance or repair job for a vehicle in your fleet
        </p>
      </div>

      <div className="max-w-4xl rounded-lg border bg-card p-6">
        <MaintenanceForm
          vehicles={vehiclesResult.vehicles.map((vehicle) => ({
            id: vehicle.id,
            vehicleNo: vehicle.vehicleNo,
            makeModel: vehicle.makeModel,
          }))}
          workshops={workshops.map((workshop) => ({
            id: workshop.id,
            name: workshop.name,
          }))}
        />
      </div>
    </div>
  )
}
