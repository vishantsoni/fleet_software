import { DriverForm } from '../_components/driver-form'

export default function NewDriverPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">New Driver</h1>
        <p className="text-muted-foreground">Create a new driver in your fleet</p>
      </div>

      <div className="max-w-2xl rounded-lg border bg-card p-6">
        <DriverForm />
      </div>
    </div>
  )
}