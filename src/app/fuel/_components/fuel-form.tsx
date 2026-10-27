'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createFuelEntryAction, updateFuelEntryAction, listVehiclesAction } from '@/server/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { DatePicker } from '@/components/ui/date-picker'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/components/ui/toast'

interface FuelFormProps {
  entry?: {
    id: string
    entryDate: string | Date
    vehicleId: string
    station: string
    fuelType: string
    litres: number
    ratePerLitre: number
    totalAmount: number
    odometerReading: number
    kmSinceLastFill: number
    fuelEconomy?: number
  }
  onSuccess?: () => void
}

export function FuelForm({ entry, onSuccess }: FuelFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [vehicles, setVehicles] = useState<{ id: string; vehicleNo: string; makeModel: string }[]>([])
  const [calculatedKm, setCalculatedKm] = useState<number | null>(null)
  const [calculatedEconomy, setCalculatedEconomy] = useState<number | null>(null)

  const [formData, setFormData] = useState({
    entryDate: entry?.entryDate
      ? new Date(entry.entryDate).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0],
    vehicleId: entry?.vehicleId || '',
    station: entry?.station || '',
    fuelType: (entry?.fuelType as 'DIESEL' | 'PETROL' | 'CNG' | 'ELECTRIC') || 'DIESEL',
    litres: entry?.litres || 0,
    ratePerLitre: entry?.ratePerLitre || 0,
    odometerReading: entry?.odometerReading || 0,
  })

  useEffect(() => {
    listVehiclesAction(1, 100).then((result) => {
      if (result.success && 'vehicles' in result) {
        setVehicles(result.vehicles)
      }
    })
  }, [])

  useEffect(() => {
    if (entry) {
      setFormData({
        entryDate: new Date(entry.entryDate).toISOString().split('T')[0],
        vehicleId: entry.vehicleId,
        station: entry.station,
        fuelType: entry.fuelType as 'DIESEL' | 'PETROL' | 'CNG' | 'ELECTRIC',
        litres: entry.litres,
        ratePerLitre: entry.ratePerLitre,
        odometerReading: entry.odometerReading,
      })
      setCalculatedKm(entry.kmSinceLastFill)
      setCalculatedEconomy(entry.fuelEconomy ?? null)
    }
  }, [entry])

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}
    if (!formData.entryDate) newErrors.entryDate = 'Entry date is required'
    if (!formData.vehicleId) newErrors.vehicleId = 'Vehicle is required'
    if (!formData.station.trim()) newErrors.station = 'Station is required'
    if (formData.litres <= 0) newErrors.litres = 'Litres must be greater than 0'
    if (formData.ratePerLitre <= 0) newErrors.ratePerLitre = 'Rate per litre must be greater than 0'
    if (formData.odometerReading < 0) newErrors.odometerReading = 'Odometer reading must be non-negative'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setIsSubmitting(true)
    try {
      let result
      if (entry) {
        result = await updateFuelEntryAction({ ...formData, id: entry.id })
      } else {
        result = await createFuelEntryAction(formData)
      }

      if (result.success) {
        toast({
          title: entry ? 'Fuel entry updated' : 'Fuel entry created',
          description: `Fuel entry for ${formData.station} has been ${entry ? 'updated' : 'created'} successfully.`,
        })
        onSuccess?.()
        router.push('/fuel')
        router.refresh()
      } else {
        toast({
          title: 'Error',
          description: result.error,
          variant: 'destructive',
        })
      }
    } catch {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const totalAmount = formData.litres * formData.ratePerLitre

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="entryDate">Entry Date</Label>
          <DatePicker
            value={formData.entryDate}
            onChange={(val) => setFormData({ ...formData, entryDate: val })}
            placeholder="Pick entry date"
            disabled={isSubmitting}
          />
          {errors.entryDate && <p className="text-sm text-red-600">{errors.entryDate}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="vehicleId">Vehicle</Label>
          <Select
            value={formData.vehicleId}
            onValueChange={(value) => setFormData({ ...formData, vehicleId: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select vehicle" />
            </SelectTrigger>
            <SelectContent>
              {vehicles.map((v) => (
                <SelectItem key={v.id} value={v.id}>
                  {v.vehicleNo} - {v.makeModel}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.vehicleId && <p className="text-sm text-red-600">{errors.vehicleId}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="station">Station</Label>
          <Input
            id="station"
            value={formData.station}
            onChange={(e) => setFormData({ ...formData, station: e.target.value })}
            placeholder="e.g. HP Petrol Pump"
          />
          {errors.station && <p className="text-sm text-red-600">{errors.station}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="fuelType">Fuel Type</Label>
          <Select
            value={formData.fuelType}
            onValueChange={(value: 'DIESEL' | 'PETROL' | 'CNG' | 'ELECTRIC') => setFormData({ ...formData, fuelType: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select fuel type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="DIESEL">Diesel</SelectItem>
              <SelectItem value="PETROL">Petrol</SelectItem>
              <SelectItem value="CNG">CNG</SelectItem>
              <SelectItem value="ELECTRIC">Electric</SelectItem>
            </SelectContent>
          </Select>
          {errors.fuelType && <p className="text-sm text-red-600">{errors.fuelType}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="litres">Litres</Label>
          <Input
            id="litres"
            type="number"
            step="0.01"
            min="0.01"
            value={formData.litres}
            onChange={(e) => setFormData({ ...formData, litres: parseFloat(e.target.value) || 0 })}
          />
          {errors.litres && <p className="text-sm text-red-600">{errors.litres}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="ratePerLitre">Rate per Litre (₹)</Label>
          <Input
            id="ratePerLitre"
            type="number"
            step="0.01"
            min="0.01"
            value={formData.ratePerLitre}
            onChange={(e) => setFormData({ ...formData, ratePerLitre: parseFloat(e.target.value) || 0 })}
          />
          {errors.ratePerLitre && <p className="text-sm text-red-600">{errors.ratePerLitre}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="odometerReading">Odometer Reading (km)</Label>
          <Input
            id="odometerReading"
            type="number"
            min="0"
            value={formData.odometerReading}
            onChange={(e) => setFormData({ ...formData, odometerReading: parseInt(e.target.value) || 0 })}
          />
          {errors.odometerReading && <p className="text-sm text-red-600">{errors.odometerReading}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
        <div className="space-y-2">
          <Label>Total Amount (₹)</Label>
          <div className="text-2xl font-bold text-primary">{totalAmount.toFixed(2)}</div>
        </div>
        <div className="space-y-2">
          <Label>KM Since Last Fill</Label>
          <div className="text-2xl font-bold text-primary">
            {calculatedKm !== null ? calculatedKm.toFixed(2) : 'Auto-calculated'}
          </div>
        </div>
        <div className="space-y-2">
          <Label>Fuel Economy (km/L)</Label>
          <div className="text-2xl font-bold text-primary">
            {calculatedEconomy !== null ? calculatedEconomy.toFixed(2) : 'Auto-calculated'}
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : entry ? 'Update Fuel Entry' : 'Create Fuel Entry'}
        </Button>
      </div>
    </form>
  )
}