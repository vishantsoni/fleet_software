'use client'

import { useState } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { Search, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DatePicker } from '@/components/ui/date-picker'

interface VehicleOption {
  id: string
  vehicleNo: string
  makeModel: string
}

interface MaintenanceFilterFormProps {
  vehicles: VehicleOption[]
}

export function MaintenanceFilterForm({ vehicles }: MaintenanceFilterFormProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [dateFrom, setDateFrom] = useState<string>(searchParams.get('dateFrom') || '')
  const [dateTo, setDateTo] = useState<string>(searchParams.get('dateTo') || '')

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const params = new URLSearchParams()

    const search = (formData.get('search') as string) || ''
    const vehicleId = (formData.get('vehicleId') as string) || ''
    const jobType = (formData.get('jobType') as string) || ''

    if (search) params.set('search', search)
    if (vehicleId) params.set('vehicleId', vehicleId)
    if (jobType) params.set('jobType', jobType)
    if (dateFrom) params.set('dateFrom', dateFrom)
    if (dateTo) params.set('dateTo', dateTo)

    router.push(`${pathname}?${params.toString()}`)
  }

  const handleReset = () => {
    router.push(pathname)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-wrap items-end gap-4 rounded-lg border bg-card p-4"
    >
      <div className="relative min-w-[200px] flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          name="search"
          placeholder="Search description, vehicle, workshop..."
          defaultValue={searchParams.get('search') || ''}
          className="pl-10"
        />
      </div>

      <select
        name="vehicleId"
        defaultValue={searchParams.get('vehicleId') || ''}
        className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm sm:w-auto"
      >
        <option value="">All Vehicles</option>
        {vehicles.map((vehicle) => (
          <option key={vehicle.id} value={vehicle.id}>
            {vehicle.vehicleNo} - {vehicle.makeModel}
          </option>
        ))}
      </select>

      <select
        name="jobType"
        defaultValue={searchParams.get('jobType') || ''}
        className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm sm:w-auto"
      >
        <option value="">All Job Types</option>
        <option value="PREVENTATIVE">Preventative</option>
        <option value="BREAKDOWN">Breakdown</option>
      </select>

      <div className="flex items-center gap-2">
        <DatePicker
          value={dateFrom}
          onChange={setDateFrom}
          placeholder="From date"
        />
        <span className="text-sm text-muted-foreground">to</span>
        <DatePicker
          value={dateTo}
          onChange={setDateTo}
          placeholder="To date"
        />
      </div>

      <div className="flex gap-2">
        <Button type="submit" size="sm">
          Filter
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={handleReset}>
          <RotateCcw className="mr-2 h-4 w-4" />
          Reset
        </Button>
      </div>
    </form>
  )
}
