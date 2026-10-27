import { Suspense } from 'react'
import Link from 'next/link'
import { listMaintenanceJobsAction } from '@/server/actions/maintenance'
import { listVehiclesAction } from '@/server/actions/vehicles'
import { Button } from '@/components/ui/button'
import { MaintenanceTable } from './_components/maintenance-table'
import { MaintenanceFilterForm } from './_components/maintenance-filter-form'
import { WorkshopCreateDialog } from './_components/workshop-create-dialog'

interface MaintenancePageProps {
  searchParams: Promise<{
    page?: string
    search?: string
    vehicleId?: string
    jobType?: string
    dateFrom?: string
    dateTo?: string
  }>
}

interface VehicleOption {
  id: string
  vehicleNo: string
  makeModel: string
}

async function MaintenanceJobsList({ searchParams }: MaintenancePageProps) {
  const params = await searchParams
  const page = params.page ? parseInt(params.page) : 1

  const result = await listMaintenanceJobsAction({
    page,
    limit: 10,
    vehicleId: params.vehicleId || undefined,
    jobType: params.jobType || undefined,
    startDate: params.dateFrom || undefined,
    endDate: params.dateTo || undefined,
  })

  if (!result.success) {
    return <div className="text-red-600">{result.error}</div>
  }

  const jobs = (result.jobs || []).map((job: any) => ({
    ...job,
    partsCost: Number(job.partsCost),
    labourCost: Number(job.labourCost),
    totalCost: Number(job.totalCost),
  }))

  return (
    <MaintenanceTable data={jobs} total={result.total || 0} page={result.page || page} />
  )
}

export default async function MaintenancePage({ searchParams }: MaintenancePageProps) {
  const vehiclesResult = await listVehiclesAction(1, 1000, '', '', 'ACTIVE')

  const vehicles: VehicleOption[] = vehiclesResult.success && 'vehicles' in vehiclesResult
    ? vehiclesResult.vehicles.map((vehicle) => ({
        id: vehicle.id,
        vehicleNo: vehicle.vehicleNo,
        makeModel: vehicle.makeModel,
      }))
    : []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Maintenance & Repair Register</h1>
          <p className="text-muted-foreground">
            Track maintenance and repair jobs across your fleet
          </p>
        </div>
        <div className="flex items-center gap-2">
          <WorkshopCreateDialog />
          <Button asChild>
            <Link href="/maintenance/new">New Job</Link>
          </Button>
        </div>
      </div>

      <Suspense fallback={null}>
        <MaintenanceFilterForm vehicles={vehicles} />
      </Suspense>

      <Suspense fallback={<div>Loading...</div>}>
        <MaintenanceJobsList searchParams={searchParams} />
      </Suspense>
    </div>
  )
}