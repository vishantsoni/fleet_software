import { VehicleForm } from '../_components/vehicle-form'

export default function NewVehiclePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">New Vehicle</h1>
        <p className="text-muted-foreground">Create a new vehicle in your fleet</p>
      </div>

      <div className="max-w-2xl rounded-lg border bg-card p-6">
        <VehicleForm />
      </div>
    </div>
  )
}
