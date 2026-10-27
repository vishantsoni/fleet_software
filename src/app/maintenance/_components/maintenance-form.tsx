'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createMaintenanceJobAction } from '@/server/actions/maintenance'
import { CreateMaintenanceJobSchema } from '@/server/utils/validators'
import { calculateTotalCost } from '@/server/utils/calculations'
import { formatCurrency } from '@/server/utils/formatters'
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
import { useToast } from '@/components/ui/toast'

interface VehicleOption {
  id: string
  vehicleNo: string
  makeModel: string
}

interface WorkshopOption {
  id: string
  name: string
}

interface MaintenanceFormProps {
  vehicles: VehicleOption[]
  workshops: WorkshopOption[]
  onSuccess?: () => void
}

interface MaintenanceFormState {
  jobDate: string
  vehicleId: string
  odometerAtService: number
  jobType: 'PREVENTATIVE' | 'BREAKDOWN'
  workshopId: string
  partsCost: number
  labourCost: number
  description: string
}

const initialFormState: MaintenanceFormState = {
  jobDate: new Date().toISOString().split('T')[0],
  vehicleId: '',
  odometerAtService: 0,
  jobType: 'PREVENTATIVE',
  workshopId: '',
  partsCost: 0,
  labourCost: 0,
  description: '',
}

export function MaintenanceForm({ vehicles, workshops, onSuccess }: MaintenanceFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formData, setFormData] = useState<MaintenanceFormState>(initialFormState)

  const totalCost = calculateTotalCost(formData.partsCost, formData.labourCost)
  const selectedVehicle = vehicles.find((vehicle) => vehicle.id === formData.vehicleId)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const payload = {
      jobDate: new Date(formData.jobDate),
      vehicleId: formData.vehicleId,
      odometerAtService: formData.odometerAtService,
      jobType: formData.jobType,
      workshopId: formData.workshopId || null,
      partsCost: formData.partsCost,
      labourCost: formData.labourCost,
      description: formData.description || null,
    }

    try {
      CreateMaintenanceJobSchema.parse(payload)
      setErrors({})
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'errors' in error) {
        const zodError = error as {
          errors: { path: (string | number)[]; message: string }[]
        }
        const newErrors: Record<string, string> = {}
        zodError.errors.forEach((err) => {
          newErrors[err.path.join('.')] = err.message
        })
        setErrors(newErrors)
      }
      return
    }

    setIsSubmitting(true)
    try {
      const result = await createMaintenanceJobAction(payload)

      if (result.success) {
        toast({
          title: 'Maintenance job created',
          description: `Job for ${
            selectedVehicle?.vehicleNo || 'vehicle'
          } recorded with total cost ${formatCurrency(totalCost)}.`,
        })
        onSuccess?.()
        router.push('/maintenance')
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
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
              {vehicles.map((vehicle) => (
                <SelectItem key={vehicle.id} value={vehicle.id}>
                  {vehicle.vehicleNo} - {vehicle.makeModel}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.vehicleId && <p className="text-sm text-red-600">{errors.vehicleId}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="jobDate">Service Date</Label>
          <DatePicker
            value={formData.jobDate}
            onChange={(val) => setFormData({ ...formData, jobDate: val })}
            placeholder="Pick service date"
            disabled={isSubmitting}
            max={new Date().toISOString().split('T')[0]}
          />
          {errors.jobDate && <p className="text-sm text-red-600">{errors.jobDate}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="odometerAtService">Odometer at Service (km)</Label>
          <Input
            id="odometerAtService"
            type="number"
            min={0}
            value={formData.odometerAtService}
            onChange={(e) =>
              setFormData({
                ...formData,
                odometerAtService: parseInt(e.target.value) || 0,
              })
            }
          />
          {errors.odometerAtService && (
            <p className="text-sm text-red-600">{errors.odometerAtService}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="jobType">Job Type</Label>
          <Select
            value={formData.jobType}
            onValueChange={(value: 'PREVENTATIVE' | 'BREAKDOWN') =>
              setFormData({ ...formData, jobType: value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select job type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PREVENTATIVE">Preventative</SelectItem>
              <SelectItem value="BREAKDOWN">Breakdown</SelectItem>
            </SelectContent>
          </Select>
          {errors.jobType && <p className="text-sm text-red-600">{errors.jobType}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="workshopId">Workshop (optional)</Label>
          <Select
            value={formData.workshopId}
            onValueChange={(value) => setFormData({ ...formData, workshopId: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select workshop" />
            </SelectTrigger>
            <SelectContent>
              {workshops.map((workshop) => (
                <SelectItem key={workshop.id} value={workshop.id}>
                  {workshop.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.workshopId && <p className="text-sm text-red-600">{errors.workshopId}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="partsCost">Parts Cost</Label>
          <Input
            id="partsCost"
            type="number"
            min={0}
            step="0.01"
            value={formData.partsCost}
            onChange={(e) =>
              setFormData({ ...formData, partsCost: parseFloat(e.target.value) || 0 })
            }
          />
          {errors.partsCost && <p className="text-sm text-red-600">{errors.partsCost}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="labourCost">Labour Cost</Label>
          <Input
            id="labourCost"
            type="number"
            min={0}
            step="0.01"
            value={formData.labourCost}
            onChange={(e) =>
              setFormData({ ...formData, labourCost: parseFloat(e.target.value) || 0 })
            }
          />
          {errors.labourCost && <p className="text-sm text-red-600">{errors.labourCost}</p>}
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="description">Description (optional)</Label>
          <textarea
            id="description"
            value={formData.description}
            rows={3}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Work performed, parts replaced, observations..."
            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
          {errors.description && <p className="text-sm text-red-600">{errors.description}</p>}
        </div>
      </div>

      <div className="flex items-center justify-between rounded-lg border bg-muted/50 px-4 py-3">
        <div>
          <p className="text-sm font-medium">Total Cost</p>
          <p className="text-xs text-muted-foreground">
            Auto-calculated: parts cost + labour cost
          </p>
        </div>
        <p className="text-xl font-bold">{formatCurrency(totalCost)}</p>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Create Job'}
        </Button>
      </div>
    </form>
  )
}
