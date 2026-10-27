'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { CreateDriverSchema, UpdateDriverSchema, type CreateDriverInput } from '@/types/driver'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { DatePicker } from '@/components/ui/date-picker'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createDriverAction, updateDriverAction } from '@/server/actions/drivers'
import { useToast } from '@/components/ui/toast'

interface DriverFormProps {
  driver?: {
    id: string
    fullName: string
    licenseNumber: string
    licenseExpiry: string | Date
    phone: string | null
    address: string | null
    baseSalary: number
    aadharNumber: string | null
    status: string
  }
  onSuccess?: () => void
}

export function DriverForm({ driver, onSuccess }: DriverFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  interface FormData {
    fullName: string
    licenseNumber: string
    licenseExpiry: string
    phone: string | null
    address: string | null
    baseSalary: number
    aadharNumber: string | null
  }

  const [formData, setFormData] = useState<FormData>({
    fullName: driver?.fullName || '',
    licenseNumber: driver?.licenseNumber || '',
    licenseExpiry: driver?.licenseExpiry
      ? new Date(driver.licenseExpiry).toISOString().split('T')[0]
      : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    phone: driver?.phone || '',
    address: driver?.address || '',
    baseSalary: driver?.baseSalary || 0,
    aadharNumber: driver?.aadharNumber || '',
  })

  useEffect(() => {
    if (driver) {
      setFormData({
        fullName: driver.fullName,
        licenseNumber: driver.licenseNumber,
        licenseExpiry: new Date(driver.licenseExpiry).toISOString().split('T')[0],
        phone: driver.phone || '',
        address: driver.address || '',
        baseSalary: driver.baseSalary,
        aadharNumber: driver.aadharNumber || '',
      })
    }
  }, [driver])

  const validate = (): boolean => {
    try {
      if (driver) {
        UpdateDriverSchema.parse({ ...formData, id: driver.id })
      } else {
        CreateDriverSchema.parse(formData)
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
      const submitData = {
        ...formData,
        licenseExpiry: new Date(formData.licenseExpiry),
      }
      let result
      if (driver) {
        result = await updateDriverAction({ ...submitData, id: driver.id })
      } else {
        result = await createDriverAction(submitData)
      }

      if (result.success) {
        toast({
          title: driver ? 'Driver updated' : 'Driver created',
          description: `Driver ${formData.fullName} has been ${driver ? 'updated' : 'created'} successfully.`,
        })
        onSuccess?.()
        router.push('/drivers')
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
          <Label htmlFor="fullName">Full Name</Label>
          <Input
            id="fullName"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            placeholder="Enter full name"
          />
          {errors.fullName && <p className="text-sm text-red-600">{errors.fullName}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="licenseNumber">License Number</Label>
          <Input
            id="licenseNumber"
            value={formData.licenseNumber}
            onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value.toUpperCase() })}
            placeholder="Enter license number"
          />
          {errors.licenseNumber && <p className="text-sm text-red-600">{errors.licenseNumber}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="licenseExpiry">License Expiry Date</Label>
          <DatePicker
            value={formData.licenseExpiry}
            onChange={(val) => setFormData({ ...formData, licenseExpiry: val })}
            placeholder="Pick license expiry date"
            disabled={isSubmitting}
          />
          {errors.licenseExpiry && <p className="text-sm text-red-600">{errors.licenseExpiry}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            value={formData.phone || ''}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value || null })}
            placeholder="Enter phone number"
          />
          {errors.phone && <p className="text-sm text-red-600">{errors.phone}</p>}
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="address">Address</Label>
          <Input
            id="address"
            value={formData.address || ''}
            onChange={(e) => setFormData({ ...formData, address: e.target.value || null })}
            placeholder="Enter address"
          />
          {errors.address && <p className="text-sm text-red-600">{errors.address}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="baseSalary">Base Salary</Label>
          <Input
            id="baseSalary"
            type="number"
            step="0.01"
            value={formData.baseSalary}
            onChange={(e) => setFormData({ ...formData, baseSalary: parseFloat(e.target.value) || 0 })}
          />
          {errors.baseSalary && <p className="text-sm text-red-600">{errors.baseSalary}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="aadharNumber">Aadhar Number</Label>
          <Input
            id="aadharNumber"
            value={formData.aadharNumber || ''}
            onChange={(e) => setFormData({ ...formData, aadharNumber: e.target.value || null })}
            placeholder="Enter Aadhar number"
          />
          {errors.aadharNumber && <p className="text-sm text-red-600">{errors.aadharNumber}</p>}
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : driver ? 'Update Driver' : 'Create Driver'}
        </Button>
      </div>
    </form>
  )
}