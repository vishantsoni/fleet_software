'use client'

import { useState } from 'react'
import { createWorkshopAction } from '@/server/actions/workshop'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useToast } from '@/components/ui/toast'

interface WorkshopFormProps {
  onSuccess?: () => void
}

export function WorkshopCreateDialog({ onSuccess }: WorkshopFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    contactPerson: '',
    email: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrors({})

    try {
      const result = await createWorkshopAction(formData)
      if (result.success) {
        toast({ title: 'Workshop created successfully' })
        onSuccess?.()
      } else {
        setErrors({ form: result.error || 'An error occurred' })
        toast({ title: 'Error', description: result.error || 'An error occurred', variant: 'destructive' })
      }
    } catch {
      setErrors({ form: 'Failed to create workshop' })
      toast({ title: 'Error', description: 'Failed to create workshop', variant: 'destructive' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          + Add Workshop
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Workshop</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Workshop Name *</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter workshop name"
              required
              disabled={isLoading}
            />
            {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Enter address"
              disabled={isLoading}
            />
            {errors.address && <p className="text-sm text-red-600">{errors.address}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Enter phone number"
              disabled={isLoading}
            />
            {errors.phone && <p className="text-sm text-red-600">{errors.phone}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="contactPerson">Contact Person</Label>
            <Input
              id="contactPerson"
              name="contactPerson"
              value={formData.contactPerson}
              onChange={handleChange}
              placeholder="Enter contact person name"
              disabled={isLoading}
            />
            {errors.contactPerson && <p className="text-sm text-red-600">{errors.contactPerson}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter email"
              disabled={isLoading}
            />
            {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
          </div>
          {errors.form && <p className="text-sm text-red-600">{errors.form}</p>}
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => setFormData({ name: '', address: '', phone: '', contactPerson: '', email: '' })}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Workshop'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}