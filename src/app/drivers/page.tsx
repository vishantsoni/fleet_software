import { Suspense } from 'react'
import { listDriversAction } from '@/server/actions/drivers'
import { DriverTable } from './_components/driver-table'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Search } from 'lucide-react'

interface DriversPageProps {
  searchParams: Promise<{ page?: string; search?: string; status?: string }>
}

async function DriversList({ searchParams }: DriversPageProps) {
  const params = await searchParams
  const page = params.page ? parseInt(params.page) : 1
  const search = params.search || ''
  const status = params.status || ''

  const result = await listDriversAction(page, 10, search, status)

  if (!result.success || !('drivers' in result)) {
    return <div className="text-red-600">{result.success ? '' : result.error}</div>
  }

  return <DriverTable data={result.drivers} />
}

export default async function DriversPage({ searchParams }: DriversPageProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Drivers</h1>
          <p className="text-muted-foreground">Manage your fleet drivers</p>
        </div>
        <Button asChild>
          <Link href="/drivers/new">New Driver</Link>
        </Button>
      </div>

      <form className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            name="search"
            placeholder="Search drivers..."
            defaultValue=""
            className="flex h-10 w-full rounded-md border border-input bg-background pl-10 pr-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
        </div>
        <select
          name="status"
          defaultValue=""
          className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="">All Statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
        </select>
        <button type="submit" className="hidden" />
      </form>

      <Suspense fallback={<div>Loading...</div>}>
        <DriversList searchParams={searchParams} />
      </Suspense>
    </div>
  )
}