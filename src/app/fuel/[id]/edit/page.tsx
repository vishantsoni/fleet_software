import { Suspense } from 'react'
import { getFuelEntryAction } from '@/server/actions/fuel'
import { FuelForm } from '../../_components/fuel-form'

interface EditFuelEntryPageProps {
  params: Promise<{ id: string }>
}

async function EditFuelEntryForm({ params }: EditFuelEntryPageProps) {
  const { id } = await params
  const result = await getFuelEntryAction(id)

  if (!result.success) {
    return <div className="text-red-600">{result.error}</div>
  }

  return <FuelForm entry={result.data as any} />
}

export default async function EditFuelEntryPage({ params }: EditFuelEntryPageProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Fuel Entry</h1>
        <p className="text-muted-foreground">Update fuel entry details</p>
      </div>

      <div className="max-w-3xl rounded-lg border bg-card p-6">
        <Suspense fallback={<div className="text-center py-8">Loading...</div>}>
          <EditFuelEntryForm params={params} />
        </Suspense>
      </div>
    </div>
  )
}