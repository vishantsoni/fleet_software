import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { getDriverAction } from '@/server/actions/drivers'
import { DriverForm } from '../../_components/driver-form'

interface EditDriverPageProps {
  params: Promise<{ id: string }>
}

async function EditDriverContent({ id }: { id: string }) {
  const result = await getDriverAction(id)

  if (!result.success || !result.data) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Driver</h1>
        <p className="text-muted-foreground">Update driver information</p>
      </div>

      <div className="max-w-2xl rounded-lg border bg-card p-6">
        <DriverForm driver={result.data} />
      </div>
    </div>
  )
}

export default async function EditDriverPage({ params }: EditDriverPageProps) {
  const { id } = await params

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <EditDriverContent id={id} />
    </Suspense>
  )
}