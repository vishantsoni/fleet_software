'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trip, TripWithRelations } from '@/types/trip'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDate, formatNumber } from '@/server/utils/formatters'
import { Badge } from '@/components/ui/badge'
import { TripForm } from './trip-form'
import { updateTripStatus } from '@/server/actions/trips'

interface TripTableProps {
  trips: TripWithRelations[]
}

export function TripTable({ trips }: TripTableProps) {
  const router = useRouter()
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null)
  const [loading, setLoading] = useState<string | null>(null)

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
              <th className="p-3 text-left font-medium">Date</th>
              <th className="p-3 text-left font-medium">Vehicle</th>
              <th className="p-3 text-left font-medium">Driver</th>
              <th className="p-3 text-left font-medium">Origin</th>
              <th className="p-3 text-left font-medium">Destination</th>
              <th className="p-3 text-right font-medium">KM</th>
              <th className="p-3 text-right font-medium">Revenue</th>
              <th className="p-3 text-left font-medium">Status</th>
              <th className="p-3 text-center font-medium">Type</th>
              <th className="p-3 text-center font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {trips.length === 0 ? (
              <tr>
                <td colSpan={9} className="p-6 text-center text-muted-foreground">
                  No trips found
                </td>
              </tr>
            ) : (
              trips.map((trip) => (
                <tr key={trip.id} className="border-b hover:bg-muted/30">
                  <td className="p-3">{formatDate(trip.tripDate)}</td>
                  <td className="p-3">{trip.vehicle?.vehicleNo} - {trip.vehicle?.makeModel || ''}</td>
                  <td className="p-3">{trip.driver?.fullName || trip.driverId}</td>
                  <td className="p-3">{trip.origin}</td>
                  <td className="p-3">{trip.destination}</td>
                  <td className="p-3 text-right">{formatNumber(trip.totalKm, 1)}</td>
                  <td className="p-3 text-right">{formatCurrency(trip.revenue)}</td>
                  <td className="p-3 text-center">{getStatusBadge(trip.status)}</td>
                  <td className="p-3 text-center">{getTripTypeBadge(trip.tripType)}</td>
                  <td className="p-3">
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingTrip(trip)}
                      >
                        Edit
                      </Button>
                      {trip.status === 'SCHEDULED' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStatusChange(trip.id, 'IN_PROGRESS')}
                          disabled={loading === trip.id}
                        >
                          Start
                        </Button>
                      )}
                      {trip.status === 'IN_PROGRESS' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStatusChange(trip.id, 'COMPLETED')}
                          disabled={loading === trip.id}
                        >
                          Complete
                        </Button>
                      )}
                    </div>
                  </td>
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
              </div>
              <div className="flex items-center gap-2 pt-2 border-t flex-wrap">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingTrip(trip)}
                  className="flex-1"
                >
                  Edit
                </Button>
                {trip.status === 'SCHEDULED' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleStatusChange(trip.id, 'IN_PROGRESS')}
                    disabled={loading === trip.id}
                    className="flex-1"
                  >
                    Start
                  </Button>
                )}
                {trip.status === 'IN_PROGRESS' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleStatusChange(trip.id, 'COMPLETED')}
                    disabled={loading === trip.id}
                    className="flex-1"
                  >
                    Complete
                  </Button>
                )}
              </div>
            </div>
          ))
        )}
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