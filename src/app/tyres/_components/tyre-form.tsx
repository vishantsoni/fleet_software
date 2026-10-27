'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { DatePicker } from '@/components/ui/date-picker'
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
import { listVehiclesAction } from '@/server/actions/vehicles'
import { useToast } from '@/components/ui/toast'

const AXLE_POSITIONS = [
  'FL', 'FR', 'RL', 'RR',
  'FLI', 'FRI', 'RLI', 'RRI',
  'Spare', 'Other'
]

interface VehicleOption {
  id: string
  vehicleNo: string
  makeModel: string
}

interface TyreFormProps {
  tyre?: any
  onClose: () => void
  onSuccess: () => void
}

export function TyreForm({ tyre, onClose, onSuccess }: TyreFormProps) {
  const [loading, setLoading] = useState(false)
  const [vehicles, setVehicles] = useState<VehicleOption[]>([])
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    vehicleId: tyre?.vehicleId || '',
    axlePosition: tyre?.axlePosition || '',
    brand: tyre?.brand || '',
    size: tyre?.size || '',
    purchaseDate: tyre?.purchaseDate
      ? new Date(tyre.purchaseDate).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0],
    purchaseCost: tyre?.purchaseCost || 0,
    fittedOdometer: tyre?.fittedOdometer || 0,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (tyre) {
      setFormData({
        vehicleId: tyre.vehicleId || '',
        axlePosition: tyre.axlePosition || '',
        brand: tyre.brand || '',
        size: tyre.size || '',
        purchaseDate: tyre.purchaseDate
          ? new Date(tyre.purchaseDate).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0],
        purchaseCost: tyre.purchaseCost || 0,
        fittedOdometer: tyre.fittedOdometer || 0,
      })
    }
  }, [tyre])

  useEffect(() => {
    async function fetchVehicles() {
      try {
        const result = await listVehiclesAction(1, 1000, '', '', 'ACTIVE')
        if (result.success && 'vehicles' in result) {
          setVehicles(
            result.vehicles.map((v) => ({
              id: v.id,
              vehicleNo: v.vehicleNo,
              makeModel: v.makeModel,
            }))
          )
        }
      } catch {
        // Silently fail - vehicles will be empty
      }
    }
    fetchVehicles()
  }, [])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.vehicleId) newErrors.vehicleId = 'Vehicle is required'
    if (!formData.axlePosition) newErrors.axlePosition = 'Axle position is required'
    if (!formData.brand) newErrors.brand = 'Brand is required'
    if (!formData.size) newErrors.size = 'Size is required'
    if (!formData.purchaseDate) newErrors.purchaseDate = 'Purchase date is required'
    if (formData.purchaseCost <= 0) newErrors.purchaseCost = 'Purchase cost must be greater than 0'
    if (formData.fittedOdometer < 0) newErrors.fittedOdometer = 'Fitted odometer must be 0 or greater'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast({
        title: 'Validation Error',
        description: 'Please fill all required fields',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)

    try {
      const payload = {
        vehicleId: formData.vehicleId,
        axlePosition: formData.axlePosition,
        brand: formData.brand,
        size: formData.size,
        purchaseDate: new Date(formData.purchaseDate).toISOString(),
        purchaseCost: Number(formData.purchaseCost),
        fittedOdometer: Number(formData.fittedOdometer),
      }

      const url = tyre ? `/api/tyres/${tyre.id}` : '/api/tyres'
      const method = tyre ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to save tyre')
      }

      toast({ title: tyre ? 'Tyre updated' : 'Tyre fitted', description: 'Successfully saved' })
      onSuccess()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred'
      toast({ title: 'Error', description: message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{tyre ? 'Edit Tyre' : 'Fit New Tyre'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="vehicleId">Vehicle *</Label>
              <Select value={formData.vehicleId} onValueChange={(value) => handleChange('vehicleId', value)} disabled={loading}>
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
              {errors.vehicleId && <p className="text-sm text-destructive">{errors.vehicleId}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="axlePosition">Axle Position *</Label>
              <Select value={formData.axlePosition} onValueChange={(value) => handleChange('axlePosition', value)} disabled={loading}>
                <SelectTrigger>
                  <SelectValue placeholder="Select axle position" />
                </SelectTrigger>
                <SelectContent>
                  {AXLE_POSITIONS.map((position) => (
                    <SelectItem key={position} value={position}>
                      {position}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.axlePosition && <p className="text-sm text-destructive">{errors.axlePosition}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="brand">Brand *</Label>
              <Input
                id="brand"
                value={formData.brand}
                onChange={(e) => handleChange('brand', e.target.value)}
                disabled={loading}
              />
              {errors.brand && <p className="text-sm text-destructive">{errors.brand}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="size">Size *</Label>
              <Input
                id="size"
                value={formData.size}
                onChange={(e) => handleChange('size', e.target.value)}
                disabled={loading}
              />
              {errors.size && <p className="text-sm text-destructive">{errors.size}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="purchaseDate">Purchase Date *</Label>
              <DatePicker
                value={formData.purchaseDate}
                onChange={(value) => handleChange('purchaseDate', value)}
                placeholder="Pick purchase date"
                disabled={loading}
              />
              {errors.purchaseDate && <p className="text-sm text-destructive">{errors.purchaseDate}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="purchaseCost">Purchase Cost (INR) *</Label>
              <Input
                id="purchaseCost"
                type="number"
                step="0.01"
                value={formData.purchaseCost}
                onChange={(e) => handleChange('purchaseCost', parseFloat(e.target.value) || 0)}
                disabled={loading}
              />
              {errors.purchaseCost && <p className="text-sm text-destructive">{errors.purchaseCost}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="fittedOdometer">Fitted Odometer *</Label>
              <Input
                id="fittedOdometer"
                type="number"
                value={formData.fittedOdometer}
                onChange={(e) => handleChange('fittedOdometer', parseInt(e.target.value) || 0)}
                disabled={loading}
              />
              {errors.fittedOdometer && <p className="text-sm text-destructive">{errors.fittedOdometer}</p>}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : tyre ? 'Update Tyre' : 'Fit Tyre'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}