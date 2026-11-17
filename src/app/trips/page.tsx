import { Suspense } from 'react'
import { listTrips } from '@/server/actions/trips'
import { TripTable } from './_components/trip-table'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import { ExportExcelButton } from '@/components/export-excel-button'

interface TripsPageProps {
  searchParams: Promise<{ page?: string }>
}

export default function TripsPage({ searchParams }: TripsPageProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Trip & Revenue Register</h1>
          <p className="text-muted-foreground">Manage trips and revenue</p>
        </div>
        <div className="flex gap-2">
          <ExportExcelButton href="/api/exports/trips" filename="trips.xlsx" />
          <Link href="/trips/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Trip
            </Button>
          </Link>
        </div>
      </div>

      <Suspense fallback={<div>Loading trips...</div>}>
        <TripsContent searchParams={searchParams} />
      </Suspense>
    </div>
  )
}

async function TripsContent({ searchParams }: TripsPageProps) {
  const params = await searchParams
  const requestedPage = Number(params.page)
  const page = Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1
  const result = await listTrips({ page, limit: 10 })

  if (!('trips' in result) || !Array.isArray(result.trips) || typeof result.total !== 'number') {
    return (
      <div className="text-red-600">
        {'error' in result ? result.error : 'Could not load trip records.'}
      </div>
    )
  }

  const totalPages = Math.ceil(result.total / 10)
  const currentPage = totalPages === 0 ? 1 : Math.min(page, totalPages)
  let tripsResult = result.trips

  if (currentPage !== page && totalPages > 0) {
    const pageResult = await listTrips({ page: currentPage, limit: 10 })
    if (!('trips' in pageResult) || !Array.isArray(pageResult.trips)) {
      return (
        <div className="text-red-600">
          {'error' in pageResult ? pageResult.error : 'Could not load trip records.'}
        </div>
      )
    }
    tripsResult = pageResult.trips
  }

  const trips = tripsResult.map((trip) => ({
    ...trip,
    totalKm: Number(trip.totalKm),
    freightAmount: Number(trip.freightAmount),
    revenue: Number(trip.revenue),
    advance: Number(trip.advance),
    commissionDeduct: Number(trip.commissionDeduct),
    includedKm: trip.includedKm === null ? null : Number(trip.includedKm),
    baseAmount: trip.baseAmount === null ? null : Number(trip.baseAmount),
    perKmRate: trip.perKmRate === null ? null : Number(trip.perKmRate),
    customer: trip.customer ? trip.customer : undefined,
  }))

  return <TripTable trips={trips} page={currentPage} total={result.total} />
}