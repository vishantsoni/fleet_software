'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TripForm } from './trip-form'
import { updateTripStatus } from '@/server/actions/trips'
import { formatCurrency, formatDateTime, formatNumber } from '@/server/utils/formatters'
import { TripWithRelations } from '@/types/trip'
import { useToast } from '@/components/ui/toast'

interface TripDetailsProps {
  trip: TripWithRelations
}

function DetailField({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <div className="font-medium">{value ?? '-'}</div>
    </div>
  )
}

export function TripDetails({ trip }: TripDetailsProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [editing, setEditing] = useState(false)
  const [updating, setUpdating] = useState(false)
  const balance = trip.revenue - trip.advance - trip.commissionDeduct

  const updateStatus = async (
    status: 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED',
    successMessage: string
  ) => {
    setUpdating(true)
    try {
      await updateTripStatus(trip.id, status)
      toast({ title: successMessage })
      router.refresh()
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Could not update trip status.',
        variant: 'destructive',
      })
    } finally {
      setUpdating(false)
    }
  }

  const cancelTrip = () => {
    if (window.confirm('Are you sure you want to cancel this trip?')) {
      void updateStatus('CANCELLED', 'Trip cancelled')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/trips" aria-label="Back to trips">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Trip Details</h1>
            <p className="text-muted-foreground">
              {trip.vehicle.vehicleNo} · {trip.origin} → {trip.destination}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => setEditing(true)}>
            Edit
          </Button>
          {trip.status === 'SCHEDULED' && (
            <Button onClick={() => updateStatus('IN_PROGRESS', 'Trip started')} disabled={updating}>
              {updating ? 'Updating...' : 'Start trip'}
            </Button>
          )}
          {trip.status === 'IN_PROGRESS' && (
            <Button onClick={() => updateStatus('COMPLETED', 'Trip completed')} disabled={updating}>
              {updating ? 'Updating...' : 'Complete trip'}
            </Button>
          )}
          {(trip.status === 'SCHEDULED' || trip.status === 'IN_PROGRESS') && (
            <Button variant="destructive" onClick={cancelTrip} disabled={updating}>
              Cancel trip
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Badge variant={
          trip.status === 'COMPLETED'
            ? 'success'
            : trip.status === 'CANCELLED'
              ? 'destructive'
              : trip.status === 'IN_PROGRESS'
                ? 'secondary'
                : 'warning'
        }>
          {trip.status.replace(/_/g, ' ')}
        </Badge>
        <Badge variant={trip.tripType === 'PACKAGE' ? 'secondary' : 'outline'}>
          {trip.tripType === 'PACKAGE' ? 'Package / Rental' : 'Point to Point'}
        </Badge>
        <Badge variant={
          trip.podStatus === 'RECEIVED'
            ? 'success'
            : trip.podStatus === 'SENT'
              ? 'secondary'
              : 'warning'
        }>
          POD: {trip.podStatus.replace(/_/g, ' ')}
        </Badge>
      </div>

      <Card>
        <CardHeader><CardTitle>Trip information</CardTitle></CardHeader>
        <CardContent>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <DetailField label="Trip date" value={formatDateTime(trip.tripDate)} />
            <DetailField
              label="Vehicle"
              value={
                <Link className="text-primary hover:underline" href={`/vehicles/${trip.vehicleId}`}>
                  {trip.vehicle.vehicleNo} - {trip.vehicle.makeModel}
                </Link>
              }
            />
            <DetailField
              label="Driver"
              value={
                <Link className="text-primary hover:underline" href={`/drivers/${trip.driverId}`}>
                  {trip.driver.fullName}
                </Link>
              }
            />
            <DetailField label="Driver license" value={trip.driver.licenseNumber} />
            <DetailField label="Driver phone" value={trip.driver.phone || '-'} />
            <DetailField label="Party name" value={trip.partyName || trip.customer?.name || '-'} />
            <DetailField label="Customer" value={trip.customer?.name || '-'} />
            <DetailField label="Docket number" value={trip.socketNo || '-'} />
            <DetailField label="Origin" value={trip.origin} />
            <DetailField label="Destination" value={trip.destination} />
            <DetailField label="Total distance" value={`${formatNumber(trip.totalKm, 1)} km`} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Financial details</CardTitle></CardHeader>
        <CardContent>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <DetailField label="Freight amount" value={formatCurrency(trip.freightAmount)} />
            <DetailField label="Revenue" value={formatCurrency(trip.revenue)} />
            <DetailField label="Advance" value={formatCurrency(trip.advance)} />
            <DetailField label="Commission deduct" value={formatCurrency(trip.commissionDeduct)} />
            <DetailField label="Balance" value={formatCurrency(balance)} />
          </div>
        </CardContent>
      </Card>

      {trip.tripType === 'PACKAGE' && (
        <Card>
          <CardHeader><CardTitle>Package / rental details</CardTitle></CardHeader>
          <CardContent>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <DetailField label="Rental days" value={trip.rentalDays ?? '-'} />
              <DetailField label="Included KM" value={trip.includedKm == null ? '-' : formatNumber(trip.includedKm, 2)} />
              <DetailField label="Base amount" value={trip.baseAmount == null ? '-' : formatCurrency(trip.baseAmount)} />
              <DetailField label="Per KM rate" value={trip.perKmRate == null ? '-' : formatCurrency(trip.perKmRate)} />
              <DetailField label="Start odometer" value={trip.startOdometer ?? '-'} />
              <DetailField label="End odometer" value={trip.endOdometer ?? '-'} />
              <DetailField label="Start time" value={trip.startDateTime ? formatDateTime(trip.startDateTime) : '-'} />
              <DetailField label="End time" value={trip.endDateTime ? formatDateTime(trip.endDateTime) : '-'} />
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle>Notes</CardTitle></CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap text-sm">{trip.notes || 'No notes for this trip.'}</p>
        </CardContent>
      </Card>

      {editing && (
        <TripForm
          trip={trip}
          onClose={() => setEditing(false)}
          onSuccess={() => {
            setEditing(false)
            router.refresh()
          }}
        />
      )}
    </div>
  )
}
