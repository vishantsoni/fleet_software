'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { CreateTripSchema } from '@/server/utils/validators'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { DatePicker } from '@/components/ui/date-picker'
import { createTrip, updateTrip, updateTripStatus } from '@/server/actions/trips'
import { listVehiclesAction } from '@/server/actions/vehicles'
import { listDriversAction } from '@/server/actions/drivers'

interface TripFormProps {
  trip?: any
  onClose: () => void
  onSuccess: () => void
}

export function TripForm({ trip, onClose, onSuccess }: TripFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [vehicles, setVehicles] = useState<{ id: string; vehicleNo: string; makeModel: string; status: string }[]>([])
  const [drivers, setDrivers] = useState<{ id: string; fullName: string; licenseNumber: string; status: string }[]>([])
  const [tripDate, setTripDate] = useState<string>(
    trip?.tripDate
      ? new Date(trip.tripDate).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0]
  )

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(CreateTripSchema.omit({ tripDate: true })),
    defaultValues: trip
      ? {
          tripType: trip.tripType,
          vehicleId: trip.vehicleId,
          driverId: trip.driverId,
          origin: trip.origin,
          destination: trip.destination,
          totalKm: trip.totalKm,
          revenue: trip.revenue,
          rentalDays: trip.rentalDays,
          includedKm: trip.includedKm,
          baseAmount: trip.baseAmount,
          perKmRate: trip.perKmRate,
          startOdometer: trip.startOdometer,
          endOdometer: trip.endOdometer,
          startDateTime: trip.startDateTime ? new Date(trip.startDateTime) : undefined,
          endDateTime: trip.endDateTime ? new Date(trip.endDateTime) : undefined,
        }
      : {
          tripType: 'POINT_TO_POINT',
          vehicleId: '',
          driverId: '',
          origin: '',
          destination: '',
          totalKm: 0,
          revenue: 0,
          rentalDays: undefined,
          includedKm: undefined,
          baseAmount: undefined,
          perKmRate: undefined,
          startOdometer: undefined,
          endOdometer: undefined,
          startDateTime: undefined,
          endDateTime: undefined,
        },
  })

  const tripType = watch('tripType')

  useEffect(() => {
    if (trip) {
      reset({
        vehicleId: trip.vehicleId,
        driverId: trip.driverId,
        origin: trip.origin,
        destination: trip.destination,
        totalKm: trip.totalKm,
        revenue: trip.revenue,
      })
      setTripDate(new Date(trip.tripDate).toISOString().split('T')[0])
    }
  }, [trip, reset])

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [vehiclesRes, driversRes] = await Promise.all([
          listVehiclesAction(1, 100, undefined, undefined, 'ACTIVE'),
          listDriversAction(1, 100, undefined, 'ACTIVE'),
        ])
        if (vehiclesRes.success) {
          setVehicles(vehiclesRes.vehicles || [])
        }
        if (driversRes.success) {
          setDrivers(driversRes.drivers || [])
        }
      } catch (err) {
        console.error('Failed to fetch options:', err)
      }
    }
    fetchOptions()
  }, [])

  const onSubmit = async (data: any) => {
    setLoading(true)
    setError('')

    try {
      const payload = {
        ...data,
        tripDate: new Date(tripDate),
        totalKm: Number(data.totalKm),
        revenue: Number(data.revenue),
      }

      let result
      if (trip) {
        result = await updateTrip(trip.id, payload)
      } else {
        result = await createTrip(payload)
      }

      if (!result.success) {
        throw new Error(result.error || 'Failed to save trip')
      }

      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const formContent = (
    <form onSubmit={handleSubmit(onSubmit, (validationErrors) => console.log(validationErrors))} className="space-y-4">
      {error && (
        <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="vehicleId">Vehicle ID</Label>
          <Select
            value={watch('vehicleId')}
            onValueChange={(value) => {
              setValue('vehicleId', value, { shouldValidate: true })
            }}
            disabled={loading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select vehicle" />
            </SelectTrigger>
            <SelectContent>
              {vehicles.map((vehicle) => (
                <SelectItem key={vehicle.id} value={vehicle.id}>
                  {vehicle.vehicleNo} - {vehicle.makeModel}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.vehicleId && (
            <p className="text-sm text-destructive">{errors.vehicleId.message as string}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="driverId">Driver ID</Label>
          <Select
            value={watch('driverId')}
            onValueChange={(value) => {
              setValue('driverId', value, { shouldValidate: true })
            }}
            disabled={loading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select driver" />
            </SelectTrigger>
            <SelectContent>
              {drivers.map((driver) => (
                <SelectItem key={driver.id} value={driver.id}>
                  {driver.fullName} ({driver.licenseNumber})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.driverId && (
            <p className="text-sm text-destructive">{errors.driverId.message as string}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="origin">Origin</Label>
          <Input
            id="origin"
            {...register('origin')}
            disabled={loading}
          />
          {errors.origin && (
            <p className="text-sm text-destructive">{errors.origin.message as string}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="destination">Destination</Label>
          <Input
            id="destination"
            {...register('destination')}
            disabled={loading}
          />
          {errors.destination && (
            <p className="text-sm text-destructive">{errors.destination.message as string}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="tripDate">Trip Date</Label>
          <DatePicker
            value={tripDate}
            onChange={setTripDate}
            placeholder="Pick trip date"
            max={new Date().toISOString().split('T')[0]}
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="totalKm">Total KM</Label>
          <Input
            id="totalKm"
            type="number"
            step="0.01"
            {...register('totalKm', { valueAsNumber: true })}
            disabled={loading}
          />
          {errors.totalKm && (
            <p className="text-sm text-destructive">{errors.totalKm.message as string}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="revenue">Revenue (INR)</Label>
          <Input
            id="revenue"
            type="number"
            step="0.01"
            {...register('revenue', { valueAsNumber: true })}
            disabled={loading}
          />
          {errors.revenue && (
            <p className="text-sm text-destructive">{errors.revenue.message as string}</p>
          )}
        </div>
      </div>

      {/* Package / Rental Mode */}
      <div className="space-y-2">
        <Label htmlFor="tripType">Trip Type</Label>
        <Select
          value={watch('tripType') as 'POINT_TO_POINT' | 'PACKAGE' | undefined}
          onValueChange={(value) => {
            setValue('tripType', value as 'POINT_TO_POINT' | 'PACKAGE', { shouldValidate: true })
          }}
          disabled={loading}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select trip type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem key="POINT_TO_POINT" value="POINT_TO_POINT">
              Point to Point
            </SelectItem>
            <SelectItem key="PACKAGE" value="PACKAGE">
              Package / Rental
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {tripType === 'PACKAGE' && (
        <fieldset className="border p-4 rounded-lg bg-muted/50">
          <legend className="text-sm font-semibold px-2">Package / Rental Details</legend>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="rentalDays">Rental Days</Label>
              <Input
                id="rentalDays"
                type="number"
                step="1"
                {...register('rentalDays', { valueAsNumber: true })}
                disabled={loading}
              />
              {errors.rentalDays && (
                <p className="text-sm text-destructive">{errors.rentalDays.message as string}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="includedKm">Included KM</Label>
              <Input
                id="includedKm"
                type="number"
                step="0.01"
                {...register('includedKm', { valueAsNumber: true })}
                disabled={loading}
              />
              {errors.includedKm && (
                <p className="text-sm text-destructive">{errors.includedKm.message as string}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="baseAmount">Base Amount (INR)</Label>
              <Input
                id="baseAmount"
                type="number"
                step="0.01"
                {...register('baseAmount', { valueAsNumber: true })}
                disabled={loading}
              />
              {errors.baseAmount && (
                <p className="text-sm text-destructive">{errors.baseAmount.message as string}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="perKmRate">Per KM Rate (INR)</Label>
              <Input
                id="perKmRate"
                type="number"
                step="0.01"
                {...register('perKmRate', { valueAsNumber: true })}
                disabled={loading}
              />
              {errors.perKmRate && (
                <p className="text-sm text-destructive">{errors.perKmRate.message as string}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="startOdometer">Start Odometer</Label>
              <Input
                id="startOdometer"
                type="number"
                step="1"
                {...register('startOdometer', { valueAsNumber: true })}
                disabled={loading}
              />
              {errors.startOdometer && (
                <p className="text-sm text-destructive">{errors.startOdometer.message as string}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="endOdometer">End Odometer</Label>
              <Input
                id="endOdometer"
                type="number"
                step="1"
                {...register('endOdometer', { valueAsNumber: true })}
                disabled={loading}
              />
              {errors.endOdometer && (
                <p className="text-sm text-destructive">{errors.endOdometer.message as string}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="startDateTime">Start Date Time</Label>
              <Input
                id="startDateTime"
                type="datetime-local"
                {...register('startDateTime')}
                disabled={loading}
              />
              {errors.startDateTime && (
                <p className="text-sm text-destructive">{errors.startDateTime.message as string}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDateTime">End Date Time</Label>
              <Input
                id="endDateTime"
                type="datetime-local"
                {...register('endDateTime')}
                disabled={loading}
              />
              {errors.endDateTime && (
                <p className="text-sm text-destructive">{errors.endDateTime.message as string}</p>
              )}
            </div>
          </div>
        </fieldset>
      )}

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : trip ? 'Update Trip' : 'Create Trip'}
        </Button>
      </div>
    </form>
  )

  if (trip) {
    return (
      <Dialog open={!!trip} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Trip</DialogTitle>
          </DialogHeader>
          {formContent}
        </DialogContent>
      </Dialog>
    )
  }

  return formContent
}