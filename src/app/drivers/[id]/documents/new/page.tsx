'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CreateDocumentSchema, type CreateDriverDocumentInput } from '@/types/driver'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { DatePicker } from '@/components/ui/date-picker'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createDriverDocumentAction } from '@/server/actions/drivers'
import { useToast } from '@/components/ui/toast'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface NewDriverDocumentPageProps {
  params: Promise<{ id: string }>
}

export default function NewDriverDocumentPage({ params }: NewDriverDocumentPageProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [driverId, setDriverId] = useState('')

  interface FormData {
    driverId: string
    documentType: string
    documentNumber: string | null
    issueDate: string
    expiryDate: string
    renewalCost: number
    fileUrl: string | null
  }

  const [formData, setFormData] = useState<FormData>({
    driverId: '',
    documentType: 'DRIVER_LICENSE',
    documentNumber: null,
    issueDate: new Date().toISOString().split('T')[0],
    expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    renewalCost: 0,
    fileUrl: null,
  })

  const validate = (): boolean => {
    try {
      CreateDocumentSchema.parse(formData)
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
        issueDate: new Date(formData.issueDate),
        expiryDate: new Date(formData.expiryDate),
      }
      const result = await createDriverDocumentAction(submitData)

      if (result.success) {
        toast({
          title: 'Document created',
          description: `Document ${formData.documentType} has been created successfully.`,
        })
        router.push(`/drivers/${driverId}/documents`)
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
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/drivers/${driverId}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">New Document</h1>
          <p className="text-muted-foreground">Add a new document for this driver</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        <input
          type="hidden"
          name="driverId"
          value={driverId}
          onChange={(e) => setFormData({ ...formData, driverId: e.target.value })}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="documentType">Document Type</Label>
            <Select
              value={formData.documentType}
              onValueChange={(value) => setFormData({ ...formData, documentType: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select document type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DRIVER_LICENSE">Driver License</SelectItem>
                <SelectItem value="INSURANCE">Insurance</SelectItem>
                <SelectItem value="FITNESS">Fitness Certificate</SelectItem>
                <SelectItem value="ROAD_TAX">Road Tax</SelectItem>
                <SelectItem value="NATIONAL_PERMIT">National Permit</SelectItem>
                <SelectItem value="POLLUTION_CERTIFICATE">Pollution Certificate</SelectItem>
                <SelectItem value="VEHICLE_REGISTRATION">Vehicle Registration</SelectItem>
              </SelectContent>
            </Select>
            {errors.documentType && <p className="text-sm text-red-600">{errors.documentType}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="documentNumber">Document Number</Label>
            <Input
              id="documentNumber"
              value={formData.documentNumber || ''}
              onChange={(e) => setFormData({ ...formData, documentNumber: e.target.value || null })}
              placeholder="Enter document number"
            />
            {errors.documentNumber && <p className="text-sm text-red-600">{errors.documentNumber}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="issueDate">Issue Date</Label>
            <DatePicker
              value={formData.issueDate}
              onChange={(val) => setFormData({ ...formData, issueDate: val })}
              placeholder="Pick issue date"
              disabled={isSubmitting}
            />
            {errors.issueDate && <p className="text-sm text-red-600">{errors.issueDate}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="expiryDate">Expiry Date</Label>
            <DatePicker
              value={formData.expiryDate}
              onChange={(val) => setFormData({ ...formData, expiryDate: val })}
              placeholder="Pick expiry date"
              disabled={isSubmitting}
            />
            {errors.expiryDate && <p className="text-sm text-red-600">{errors.expiryDate}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="renewalCost">Renewal Cost</Label>
            <Input
              id="renewalCost"
              type="number"
              step="0.01"
              value={formData.renewalCost}
              onChange={(e) => setFormData({ ...formData, renewalCost: parseFloat(e.target.value) || 0 })}
            />
            {errors.renewalCost && <p className="text-sm text-red-600">{errors.renewalCost}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="fileUrl">File URL</Label>
            <Input
              id="fileUrl"
              type="url"
              value={formData.fileUrl || ''}
              onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value || null })}
              placeholder="https://example.com/document.pdf"
            />
            {errors.fileUrl && <p className="text-sm text-red-600">{errors.fileUrl}</p>}
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Create Document'}
          </Button>
        </div>
      </form>
    </div>
  )
}