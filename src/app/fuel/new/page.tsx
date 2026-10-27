import { FuelForm } from '../_components/fuel-form'

export default function NewFuelEntryPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">New Fuel Entry</h1>
        <p className="text-muted-foreground">Record a new fuel purchase</p>
      </div>

      <div className="max-w-3xl rounded-lg border bg-card p-6">
        <FuelForm />
      </div>
    </div>
  )
}