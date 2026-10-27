'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createVehicleSchema, updateVehicleSchema, type CreateVehicleInput } from '@/types/vehicle'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { DatePicker } from '@/components/ui/date-picker'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createVehicleAction, updateVehicleAction } from '@/server/actions/vehicles'
import { useToast } from '@/components/ui/toast'

interface VehicleFormProps {
  vehicle?: {
    id: string
    vehicleNo: string
    registrationDate: string | Date
    makeModel: string
    year: number
    capacityTonnage: number
    ownerType: string
    engineRef?: string | null
    chassisRef?: string | null
    currentOdometer: number
    status: string
  }
  onSuccess?: () => void
}

export function VehicleForm({ vehicle, onSuccess }: VehicleFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [formData, setFormData] = useState<CreateVehicleInput>({
    vehicleNo: vehicle?.vehicleNo || '',
    registrationDate: vehicle?.registrationDate
      ? new Date(vehicle.registrationDate).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0],
    makeModel: vehicle?.makeModel || '',
    year: vehicle?.year || new Date().getFullYear(),
    capacityTonnage: vehicle?.capacityTonnage || 0,
    ownerType: (vehicle?.ownerType as 'OWNED' | 'MARKET') || 'OWNED',
    engineRef: vehicle?.engineRef || null,
    chassisRef: vehicle?.chassisRef || null,
    currentOdometer: vehicle?.currentOdometer || 0,
    status: vehicle?.status || 'ACTIVE',
  })

  useEffect(() => {
    if (vehicle) {
      setFormData({
        vehicleNo: vehicle.vehicleNo,
        registrationDate: new Date(vehicle.registrationDate).toISOString().split('T')[0],
        makeModel: vehicle.makeModel,
        year: vehicle.year,
        capacityTonnage: vehicle.capacityTonnage,
        ownerType: vehicle.ownerType as 'OWNED' | 'MARKET',
        engineRef: vehicle.engineRef,
        chassisRef: vehicle.chassisRef,
        currentOdometer: vehicle.currentOdometer,
        status: vehicle.status,
      })
    }
  }, [vehicle])

  const validate = (): boolean => {
    try {
      if (vehicle) {
        updateVehicleSchema.parse({ ...formData, id: vehicle.id })
      } else {
        createVehicleSchema.parse(formData)
      }
      setErrors({})
      return true
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'errors' in error) {
        const zodError = error as { errors: { path: string[]; message: string }[] }
        const newErrors: Record<string, string> = {}
        zodError.errors.forEach((err) => {
          newErrors[err.path.join('.')] = err.message
        })
        setErrors(newErrors)
      }
      return false
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setIsSubmitting(true)
    try {
      let result
      if (vehicle) {
        result = await updateVehicleAction({ ...formData, id: vehicle.id })
      } else {
        result = await createVehicleAction(formData)
      }

      if (result.success) {
        toast({
          title: vehicle ? 'Vehicle updated' : 'Vehicle created',
          description: `Vehicle ${formData.vehicleNo} has been ${vehicle ? 'updated' : 'created'} successfully.`,
        })
        onSuccess?.()
        router.push('/vehicles')
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="vehicleNo">Vehicle Number</Label>
          <Input
            id="vehicleNo"
            value={formData.vehicleNo}
            onChange={(e) => setFormData({ ...formData, vehicleNo: e.target.value.toUpperCase() })}
            placeholder="e.g. MH01AB1234"
          />
          {errors.vehicleNo && <p className="text-sm text-red-600">{errors.vehicleNo}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="registrationDate">Registration Date</Label>
          <DatePicker
            value={formData.registrationDate}
            onChange={(val) => setFormData({ ...formData, registrationDate: val })}
            placeholder="Pick registration date"
            disabled={isSubmitting}
          />
          {errors.registrationDate && <p className="text-sm text-red-600">{errors.registrationDate}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="makeModel">Make/Model</Label>
          <Input
            id="makeModel"
            value={formData.makeModel}
            onChange={(e) => setFormData({ ...formData, makeModel: e.target.value })}
            placeholder="e.g. Tata Ace"
          />
          {errors.makeModel && <p className="text-sm text-red-600">{errors.makeModel}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="year">Year</Label>
          <Input
            id="year"
            type="number"
            value={formData.year}
            onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) || 0 })}
          />
          {errors.year && <p className="text-sm text-red-600">{errors.year}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="capacityTonnage">Capacity (Tonnage)</Label>
          <Input
            id="capacityTonnage"
            type="number"
            step="0.01"
            value={formData.capacityTonnage}
            onChange={(e) => setFormData({ ...formData, capacityTonnage: parseFloat(e.target.value) || 0 })}
          />
          {errors.capacityTonnage && <p className="text-sm text-red-600">{errors.capacityTonnage}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="ownerType">Owner Type</Label>
          <Select
            value={formData.ownerType}
            onValueChange={(value: 'OWNED' | 'MARKET') => setFormData({ ...formData, ownerType: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select owner type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="OWNED">Owned</SelectItem>
              <SelectItem value="MARKET">Market</SelectItem>
            </SelectContent>
          </Select>
          {errors.ownerType && <p className="text-sm text-red-600">{errors.ownerType}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="engineRef">Engine Ref</Label>
          <Input
            id="engineRef"
            value={formData.engineRef || ''}
            onChange={(e) => setFormData({ ...formData, engineRef: e.target.value || null })}
          />
          {errors.engineRef && <p className="text-sm text-red-600">{errors.engineRef}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="chassisRef">Chassis Ref</Label>
          <Input
            id="chassisRef"
            value={formData.chassisRef || ''}
            onChange={(e) => setFormData({ ...formData, chassisRef: e.target.value || null })}
          />
          {errors.chassisRef && <p className="text-sm text-red-600">{errors.chassisRef}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="currentOdometer">Current Odometer</Label>
          <Input
            id="currentOdometer"
            type="number"
            value={formData.currentOdometer}
            onChange={(e) => setFormData({ ...formData, currentOdometer: parseInt(e.target.value) || 0 })}
          />
          {errors.currentOdometer && <p className="text-sm text-red-600">{errors.currentOdometer}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select
            value={formData.status}
            onValueChange={(value) => setFormData({ ...formData, status: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="INACTIVE">Inactive</SelectItem>
            </SelectContent>
          </Select>
          {errors.status && <p className="text-sm text-red-600">{errors.status}</p>}
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : vehicle ? 'Update Vehicle' : 'Create Vehicle'}
        </Button>
      </div>
    </form>
  )
}
