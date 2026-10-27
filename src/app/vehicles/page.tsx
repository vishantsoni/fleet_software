import { Suspense } from 'react'
import { listVehiclesAction } from '@/server/actions/vehicles'
import { VehicleTable } from './_components/vehicle-table'
import { VehicleSearchForm } from './_components/vehicle-search-form'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface VehiclesPageProps {
  searchParams: Promise<{ page?: string; search?: string; ownerType?: string; status?: string }>
}

async function VehiclesList({ searchParams }: VehiclesPageProps) {
  const params = await searchParams
  const page = params.page ? parseInt(params.page) : 1
  const search = params.search || ''
  const ownerType = params.ownerType || ''
  const status = params.status || ''

  const result = await listVehiclesAction(page, 10, search, ownerType, status)

  if (!result.success) {
    return <div className="text-red-600">{result.error}</div>
  }

  return (
    <VehicleTable data={result.vehicles} />
  )
}

export default async function VehiclesPage({ searchParams }: VehiclesPageProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Vehicles</h1>
          <p className="text-muted-foreground">Manage your fleet vehicles</p>
        </div>
        <Button asChild>
          <Link href="/vehicles/new">New Vehicle</Link>
        </Button>
      </div>

      <VehicleSearchForm />

      <Suspense fallback={<div>Loading...</div>}>
        <VehiclesList searchParams={searchParams} />
      </Suspense>
    </div>
  )
}
