import { Suspense } from 'react'
import { listVehiclesAction } from '@/server/actions/vehicles'
import { VehicleTable } from './_components/vehicle-table'
import { VehicleSearchForm } from './_components/vehicle-search-form'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ExportExcelButton } from '@/components/export-excel-button'

interface VehiclesPageProps {
  searchParams: Promise<{ page?: string; search?: string; ownerType?: string; status?: string }>
}

async function VehiclesList({ searchParams }: VehiclesPageProps) {
  const params = await searchParams
  const requestedPage = Number(params.page)
  const page = Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1
  const search = params.search || ''
  const ownerType = params.ownerType || ''
  const status = params.status || ''

  const result = await listVehiclesAction(page, 10, search, ownerType, status)
  const exportParams = new URLSearchParams()
  if (search) exportParams.set('search', search)
  if (ownerType) exportParams.set('ownerType', ownerType)
  if (status) exportParams.set('status', status)
  const exportHref = `/api/exports/vehicles${exportParams.size ? `?${exportParams}` : ''}`
  const heading = (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Vehicles{'vehicles' in result ? ` (${result.total})` : ''}
        </h1>
        <p className="text-muted-foreground">Manage your fleet vehicles</p>
      </div>
      <div className="flex gap-2">
        <ExportExcelButton href={exportHref} filename="vehicles.xlsx" />
        <Button asChild>
          <Link href="/vehicles/new">New Vehicle</Link>
        </Button>
      </div>
    </div>
  )

  if (!('vehicles' in result)) {
    return (
      <>
        {heading}
        <Suspense fallback={null}>
          <VehicleSearchForm />
        </Suspense>
        <div className="text-red-600">{result.error}</div>
      </>
    )
  }

  const totalPages = Math.ceil(result.total / 10)
  const currentPage = totalPages === 0 ? 1 : Math.min(page, totalPages)
  let vehicles = result.vehicles

  if (currentPage !== page && totalPages > 0) {
    const pageResult = await listVehiclesAction(currentPage, 10, search, ownerType, status)
    if (!('vehicles' in pageResult)) {
      return (
        <>
          {heading}
          <Suspense fallback={null}>
            <VehicleSearchForm />
          </Suspense>
          <div className="text-red-600">{pageResult.error}</div>
        </>
      )
    }
    vehicles = pageResult.vehicles
  }

  return (
    <>
      {heading}
      <Suspense fallback={null}>
        <VehicleSearchForm />
      </Suspense>
      <VehicleTable data={vehicles} page={currentPage} total={result.total} />
    </>
  )
}

export default async function VehiclesPage({ searchParams }: VehiclesPageProps) {
  return (
    <div className="space-y-6">
      <Suspense fallback={<div className="text-muted-foreground">Loading vehicles...</div>}>
        <VehiclesList searchParams={searchParams} />
      </Suspense>
    </div>
  )
}
