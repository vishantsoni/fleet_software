import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { getVehicleAction } from '@/server/actions/vehicles'
import { VehicleForm } from '../../_components/vehicle-form'

interface EditVehiclePageProps {
  params: Promise<{ id: string }>
}

async function EditVehicleContent({ id }: { id: string }) {
  const result = await getVehicleAction(id)

  if (!result.success || !result.data) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Vehicle</h1>
        <p className="text-muted-foreground">Update vehicle information</p>
      </div>

      <div className="max-w-2xl rounded-lg border bg-card p-6">
        <VehicleForm vehicle={result.data} />
      </div>
    </div>
  )
}

export default async function EditVehiclePage({ params }: EditVehiclePageProps) {
  const { id } = await params

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <EditVehicleContent id={id} />
    </Suspense>
  )
}
