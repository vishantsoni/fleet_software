'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { Search } from 'lucide-react'

export function VehicleSearchForm() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const params = new URLSearchParams()

    const search = formData.get('search') as string
    const ownerType = formData.get('ownerType') as string
    const status = formData.get('status') as string

    if (search) params.set('search', search)
    if (ownerType) params.set('ownerType', ownerType)
    if (status) params.set('status', status)

    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-4">
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          name="search"
          placeholder="Search vehicles..."
          defaultValue={searchParams.get('search') || ''}
          className="flex h-10 w-full rounded-md border border-input bg-background pl-10 pr-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        />
      </div>
      <select
        name="ownerType"
        defaultValue={searchParams.get('ownerType') || ''}
        className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
      >
        <option value="">All Owner Types</option>
        <option value="OWNED">Owned</option>
        <option value="MARKET">Market</option>
      </select>
      <select
        name="status"
        defaultValue={searchParams.get('status') || ''}
        className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
      >
        <option value="">All Statuses</option>
        <option value="ACTIVE">Active</option>
        <option value="INACTIVE">Inactive</option>
      </select>
    </form>
  )
}
