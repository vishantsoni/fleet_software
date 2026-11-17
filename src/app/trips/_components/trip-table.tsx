'use client'

import { useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Trip, TripWithRelations } from '@/types/trip'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDate, formatNumber } from '@/server/utils/formatters'
import { Badge } from '@/components/ui/badge'
import { TripForm } from './trip-form'
import { updateTripStatus } from '@/server/actions/trips'
import { ChevronLeft, ChevronRight, Check, Edit, Eye, MoreHorizontal, Play } from 'lucide-react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import Link from 'next/link'

interface TripTableProps {
  trips: TripWithRelations[]
  page: number
  total: number
}

interface TripActionsProps {
  trip: TripWithRelations
  loading: boolean
  onEdit: () => void
  onStatusChange: (status: 'IN_PROGRESS' | 'COMPLETED') => void
}

function TripActions({ trip, loading, onEdit, onStatusChange }: TripActionsProps) {
  const itemClassName =
    'flex cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50'

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <Button variant="ghost" size="icon" aria-label="Trip actions">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={4}
          className="z-50 min-w-[160px] rounded-md border bg-popover p-1 text-popover-foreground shadow-md"
        >
          <DropdownMenu.Item asChild className={itemClassName}>
            <Link href={`/trips/${trip.id}`}>
              <Eye className="h-4 w-4" />
              View
            </Link>
          </DropdownMenu.Item>
          <DropdownMenu.Item className={itemClassName} onSelect={onEdit}>
            <Edit className="h-4 w-4" />
            Edit
          </DropdownMenu.Item>
          {trip.status === 'SCHEDULED' && (
            <DropdownMenu.Item
              className={itemClassName}
              disabled={loading}
              onSelect={() => onStatusChange('IN_PROGRESS')}
            >
              <Play className="h-4 w-4" />
              Start
            </DropdownMenu.Item>
          )}
          {trip.status === 'IN_PROGRESS' && (
            <DropdownMenu.Item
              className={itemClassName}
              disabled={loading}
              onSelect={() => onStatusChange('COMPLETED')}
            >
              <Check className="h-4 w-4" />
              Complete
            </DropdownMenu.Item>
          )}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}

export function TripTable({ trips, page, total }: TripTableProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null)
  const [loading, setLoading] = useState<string | null>(null)
  const totalPages = Math.max(1, Math.ceil(total / 10))

  const goToPage = (nextPage: number) => {
    const params = new URLSearchParams(searchParams.toString())
    if (nextPage === 1) {
      params.delete('page')
    } else {
      params.set('page', String(nextPage))
    }
    const query = params.toString()
    router.push(query ? `${pathname}?${query}` : pathname)
  }

  const handleStatusChange = async (tripId: string, status: string) => {
    setLoading(tripId)
    try {
      const result = await updateTripStatus(tripId, status as 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED')
      if (result.success) {
        router.refresh()
      }
    } catch (error) {
      console.error('Failed to update trip status:', error)
    } finally {
      setLoading(null)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
        return <Badge variant="warning">Scheduled</Badge>
      case 'IN_PROGRESS':
        return <Badge variant="secondary">In Progress</Badge>
      case 'COMPLETED':
        return <Badge variant="success">Completed</Badge>
      case 'CANCELLED':
        return <Badge variant="destructive">Cancelled</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const getTripTypeBadge = (tripType: string) => {
    if (tripType === 'PACKAGE') {
      return <Badge variant="secondary">Package / Rental</Badge>
    }
    return <Badge variant="outline">Point to Point</Badge>
  }

  return (
    <div className="space-y-4">
      {/* Desktop Table View */}
      <div className="hidden md:block rounded-md border overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
            <th className="p-3 text-center font-medium">Actions</th>
            <th className="p-3 text-center font-medium">Type</th>
              <th className="p-3 text-left font-medium">Date</th>
              <th className="p-3 text-left font-medium">Vehicle</th>
              <th className="p-3 text-left font-medium">Driver</th>
              <th className="p-3 text-left font-medium">Party Name</th>
              <th className="p-3 text-left font-medium">Docket No</th>
              <th className="p-3 text-center font-medium">POD Status</th>
              <th className="p-3 text-left font-medium">Origin</th>
              <th className="p-3 text-left font-medium">Destination</th>
              <th className="p-3 text-right font-medium">KM</th>
              <th className="p-3 text-right font-medium">Revenue</th>
              <th className="p-3 text-right font-medium">Advance</th>
              <th className="p-3 text-right font-medium">Commission deduct</th>
              <th className="p-3 text-right font-medium">Balance</th>
              <th className="p-3 text-left font-medium">Status</th>


            </tr>
          </thead>
          <tbody>
            {trips.length === 0 ? (
              <tr>
                <td colSpan={16} className="p-6 text-center text-muted-foreground">
                  No trips found
                </td>
              </tr>
            ) : (
              trips.map((trip) => (
                <tr key={trip.id} className="border-b hover:bg-muted/30">
                  <td className="p-3">
                    <div className="flex justify-center">
                      <TripActions
                        trip={trip}
                        loading={loading === trip.id}
                        onEdit={() => setEditingTrip(trip)}
                        onStatusChange={(status) => void handleStatusChange(trip.id, status)}
                      />
                    </div>
                  </td>
                  <td className="p-3 text-center">{getTripTypeBadge(trip.tripType)}</td>
                  <td className="p-3">{formatDate(trip.tripDate)}</td>
                  <td className="p-3">{trip.vehicle?.vehicleNo} - {trip.vehicle?.makeModel || ''}</td>
                  <td className="p-3">{trip.driver?.fullName || trip.driverId}</td>
                  <td className="p-3">{trip.partyName || trip.customer?.name || '-'}</td>
                  <td className="p-3">{trip.socketNo || '-'}</td>
                  <td className="p-3 text-center">
                    <Badge
                      variant={
                        trip.podStatus === 'RECEIVED'
                          ? 'success'
                          : trip.podStatus === 'SENT'
                            ? 'secondary'
                            : 'warning'
                      }
                    >
                      {(trip.podStatus || 'PENDING').replace(/_/g, ' ')}
                    </Badge>
                  </td>
                  <td className="p-3">{trip.origin}</td>
                  <td className="p-3">{trip.destination}</td>
                  <td className="p-3 text-right">{formatNumber(trip.totalKm, 1)}</td>
                  <td className="p-3 text-right">{formatCurrency(trip.revenue)}</td>
                  <td className="p-3 text-right">{formatCurrency(trip.advance || 0)}</td>
                  <td className="p-3 text-right">{formatCurrency(trip.commissionDeduct || 0)}</td>
                  <td className="p-3 text-right">
                    {formatCurrency(trip.revenue - (trip.advance || 0) - (trip.commissionDeduct || 0))}
                  </td>
                  <td className="p-3 text-center">{getStatusBadge(trip.status)}</td>


                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {trips.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground border rounded-md">
            No trips found
          </div>
        ) : (
          trips.map((trip) => (
            <div key={trip.id} className="border rounded-lg p-4 space-y-3 bg-card">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold">{trip.vehicle?.vehicleNo}</p>
                  <p className="text-sm text-muted-foreground">{trip.vehicle?.makeModel}</p>
                  <p className="text-xs text-muted-foreground mt-1">{formatDate(trip.tripDate)}</p>
                </div>
                {getStatusBadge(trip.status)}
                {getTripTypeBadge(trip.tripType)}
              </div>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Driver:</span> {trip.driver?.fullName || trip.driverId}
                </div>
                <div>
                  <span className="text-muted-foreground">Party Name:</span>{' '}
                  {trip.partyName || trip.customer?.name || '-'}
                </div>
                <div className="flex justify-between gap-3">
                  <div>
                    <span className="text-muted-foreground">Docket No:</span> {trip.socketNo || '-'}
                  </div>
                  <div>
                    <span className="text-muted-foreground">POD:</span> {(trip.podStatus || 'PENDING').replace(/_/g, ' ')}
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Route:</span> {trip.origin} → {trip.destination}
                </div>
                <div className="flex justify-between">
                  <div>
                    <span className="text-muted-foreground">KM:</span> {formatNumber(trip.totalKm, 1)}
                  </div>
                  <div className="font-semibold">
                    <span className="text-muted-foreground font-normal">Revenue:</span> {formatCurrency(trip.revenue)}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-muted-foreground">Advance:</span> {formatCurrency(trip.advance || 0)}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Commission:</span> {formatCurrency(trip.commissionDeduct || 0)}
                  </div>
                  <div className="font-semibold">
                    <span className="text-muted-foreground font-normal">Balance:</span>{' '}
                    {formatCurrency(trip.revenue - (trip.advance || 0) - (trip.commissionDeduct || 0))}
                  </div>
                </div>
              </div>
              <div className="flex justify-end border-t pt-2">
                <TripActions
                  trip={trip}
                  loading={loading === trip.id}
                  onEdit={() => setEditingTrip(trip)}
                  onStatusChange={(status) => void handleStatusChange(trip.id, status)}
                />
              </div>
            </div>
          ))
        )}
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {total === 0 ? 'No trips' : `Showing ${(page - 1) * 10 + 1}-${Math.min(page * 10, total)} of ${total} trips`}
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => goToPage(page - 1)}
            disabled={page <= 1}
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => goToPage(page + 1)}
            disabled={page >= totalPages}
          >
            Next
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </div>

      {editingTrip && (
        <TripForm
          trip={editingTrip}
          onClose={() => setEditingTrip(null)}
          onSuccess={() => {
            setEditingTrip(null)
            router.refresh()
          }}
        />
      )}
    </div>
  )
}