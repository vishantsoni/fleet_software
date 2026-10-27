import { Suspense } from 'react'
import { listFuelEntriesAction } from '@/server/actions/fuel'
import { listVehiclesAction } from '@/server/actions/vehicles'
import { FuelTable } from './_components/fuel-table'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Search, Filter, Calendar, ChevronDown } from 'lucide-react'

interface FuelPageProps {
  searchParams: Promise<{
    page?: string
    vehicleId?: string
    fuelType?: string
    dateFrom?: string
    dateTo?: string
  }>
}

async function FuelList({ searchParams }: FuelPageProps) {
  const params = await searchParams
  const page = params.page ? parseInt(params.page) : 1
  const vehicleId = params.vehicleId || ''
  const fuelType = params.fuelType || ''
  const dateFrom = params.dateFrom || ''
  const dateTo = params.dateTo || ''

  const [result, vehiclesResult] = await Promise.all([
    listFuelEntriesAction(page, 10, { vehicleId, fuelType: fuelType as 'DIESEL' | 'PETROL' | 'CNG' | 'ELECTRIC', dateFrom, dateTo }),
    listVehiclesAction(1, 100),
  ])

  if (!result.success) {
    return <div className="text-red-600">{result.error}</div>
  }

  return (
    <FuelTable data={result.entries as any} />
  )
}

export default async function FuelPage({ searchParams }: FuelPageProps) {
  const params = await searchParams
  const page = params.page ? parseInt(params.page) : 1
  const vehicleId = params.vehicleId || ''
  const fuelType = params.fuelType || ''
  const dateFrom = params.dateFrom || ''
  const dateTo = params.dateTo || ''

  const vehiclesResult = await listVehiclesAction(1, 100)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Fuel Register</h1>
          <p className="text-muted-foreground">Manage fuel entries for your fleet</p>
        </div>
        <Button asChild>
          <Link href="/fuel/new">New Entry</Link>
        </Button>
      </div>

      <form className="flex flex-wrap items-center gap-4" method="GET">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            name="search"
            placeholder="Search entries..."
            className="flex h-10 w-full rounded-md border border-input bg-background pl-10 pr-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
        </div>

        <select
          name="vehicleId"
          value={vehicleId}
          className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="">All Vehicles</option>
          {vehiclesResult.success && 'vehicles' in vehiclesResult && vehiclesResult.vehicles.map((v: any) => (
            <option key={v.id} value={v.id}>{v.vehicleNo} - {v.makeModel}</option>
          ))}
        </select>

        <select
          name="fuelType"
          value={fuelType}
          className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="">All Fuel Types</option>
          <option value="DIESEL">Diesel</option>
          <option value="PETROL">Petrol</option>
          <option value="CNG">CNG</option>
          <option value="ELECTRIC">Electric</option>
        </select>

        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="date"
            name="dateFrom"
            value={dateFrom}
            className="h-10 rounded-md border border-input bg-background pl-10 pr-3 py-2 text-sm"
            placeholder="From"
          />
        </div>

        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="date"
            name="dateTo"
            value={dateTo}
            className="h-10 rounded-md border border-input bg-background pl-10 pr-3 py-2 text-sm"
            placeholder="To"
          />
        </div>

        <button type="submit" className="hidden" />
      </form>

      <Suspense fallback={<div className="text-center py-8">Loading...</div>}>
        <FuelList searchParams={searchParams} />
      </Suspense>
    </div>
  )
}