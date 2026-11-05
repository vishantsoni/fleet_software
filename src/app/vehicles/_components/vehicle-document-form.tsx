'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DatePicker } from '@/components/ui/date-picker'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/components/ui/toast'

const documentTypes = [
  ['VEHICLE_REGISTRATION', 'Vehicle Registration (RC)'],
  ['INSURANCE', 'Insurance'],
  ['FITNESS', 'Fitness Certificate'],
  ['ROAD_TAX', 'Road Tax'],
  ['NATIONAL_PERMIT', 'National Permit'],
  ['FIVE_YEAR_PERMIT', '5 Year Permit'],
  ['POLLUTION_CERTIFICATE', 'Pollution Certificate'],
  ['GPS_PAPER', 'GPS Paper'],
  ['CYLINDER', 'Cylinder'],
  ['SPEED', 'Speed'],
  ['OTHER', 'Other'],
] as const

interface VehicleDocumentFormProps {
  vehicleId: string
}

export function VehicleDocumentForm({ vehicleId }: VehicleDocumentFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [documentType, setDocumentType] = useState<string>('VEHICLE_REGISTRATION')
  const [customType, setCustomType] = useState('')
  const [documentNumber, setDocumentNumber] = useState('')
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0])
  const [expiryDate, setExpiryDate] = useState(
    new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  )
  const [renewalCost, setRenewalCost] = useState('0')
  const [file, setFile] = useState<File | null>(null)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (file && file.size > 10 * 1024 * 1024) {
      toast({
        title: 'File is too large',
        description: 'Choose a PDF or image smaller than 10 MB.',
        variant: 'destructive',
      })
      return
    }

    setIsSubmitting(true)

    try {
      const formData = new FormData()
      formData.set('vehicleId', vehicleId)
      formData.set(
        'document',
        JSON.stringify({
          documentType,
          customType: documentType === 'OTHER' ? customType : null,
          documentNumber: documentNumber || null,
          issueDate,
          expiryDate,
          renewalCost: Number(renewalCost),
        })
      )
      if (file) formData.set('file', file)

      const response = await fetch('/api/vehicle-documents', {
        method: 'POST',
        body: formData,
      })
      const result = await response.json()

      if (!response.ok) {
        toast({ title: 'Error', description: result.error || 'Could not save the document.', variant: 'destructive' })
        return
      }

      toast({ title: 'Document added', description: 'Vehicle document saved successfully.' })
      router.push(`/vehicles/${vehicleId}`)
      router.refresh()
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Could not save the document.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/vehicles/${vehicleId}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add Vehicle Document</h1>
          <p className="text-muted-foreground">Add an RC, permit, or another vehicle document.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="documentType">Document Type</Label>
            <Select value={documentType} onValueChange={setDocumentType}>
              <SelectTrigger id="documentType">
                <SelectValue placeholder="Select document type" />
              </SelectTrigger>
              <SelectContent>
                {documentTypes.map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {documentType === 'OTHER' && (
            <div className="space-y-2">
              <Label htmlFor="customType">Other Document Name</Label>
              <Input
                id="customType"
                value={customType}
                onChange={(event) => setCustomType(event.target.value)}
                maxLength={100}
                required
                placeholder="Enter document type"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="documentNumber">Document Number</Label>
            <Input
              id="documentNumber"
              value={documentNumber}
              onChange={(event) => setDocumentNumber(event.target.value)}
              maxLength={100}
              placeholder="Enter document number"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="issueDate">Issue Date</Label>
            <DatePicker value={issueDate} onChange={setIssueDate} placeholder="Pick issue date" disabled={isSubmitting} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="expiryDate">Expiry Date</Label>
            <DatePicker value={expiryDate} onChange={setExpiryDate} placeholder="Pick expiry date" disabled={isSubmitting} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="renewalCost">Renewal Cost</Label>
            <Input
              id="renewalCost"
              type="number"
              min="0"
              step="0.01"
              value={renewalCost}
              onChange={(event) => setRenewalCost(event.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="documentFile">Document File (optional)</Label>
            <Input
              id="documentFile"
              type="file"
              accept=".pdf,.jpeg,.jpg,.png,.webp,application/pdf,image/jpeg,image/png,image/webp"
              onChange={(event) => setFile(event.target.files?.[0] || null)}
            />
            <p className="text-sm text-muted-foreground">PDF, JPEG, JPG, PNG, or WEBP. Maximum file size: 10 MB.</p>
            {file && <p className="text-sm">{file.name}</p>}
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Document'}
          </Button>
        </div>
      </form>
    </div>
  )
}
