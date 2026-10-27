'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { DatePicker } from '@/components/ui/date-picker'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { listVehiclesAction } from '@/server/actions/vehicles'
import { useToast } from '@/components/ui/toast'

interface BatteryFormProps { battery?: any; onClose: () => void; onSuccess: () => void }

export function BatteryForm({ battery, onClose, onSuccess }: BatteryFormProps) {
  const [loading, setLoading] = useState(false)
  const [vehicles, setVehicles] = useState<any[]>([])
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    vehicleId: battery?.vehicleId || '',
    brand: battery?.brand || '',
    model: battery?.model || '',
    serialNumber: battery?.serialNumber || '',
    purchaseDate: battery?.purchaseDate ? new Date(battery.purchaseDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    purchaseCost: battery?.purchaseCost || 0,
    warrantyMonths: battery?.warrantyMonths || 0,
    fittedOdometer: battery?.fittedOdometer || 0,
  })

  useEffect(() => {
    async function fetchVehicles() {
      try {
        const result = await listVehiclesAction(1, 1000, '', '', 'ACTIVE')
        if (result.success && 'vehicles' in result) {
          setVehicles(result.vehicles.map((v: any) => ({ id: v.id, vehicleNo: v.vehicleNo, makeModel: v.makeModel })))
        }
      } catch {}
    }
    fetchVehicles()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const url = battery ? `/api/batteries/${battery.id}` : '/api/batteries'
      const method = battery ? 'PUT' : 'POST'
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) })
      if (!res.ok) { const err = await res.json(); throw new Error(err.error || 'Failed to save battery') }
      toast({ title: battery ? 'Battery updated' : 'Battery fitted', description: 'Successfully saved' })
      onSuccess()
    } catch (err) {
      toast({ title: 'Error', description: err instanceof Error ? err.message : 'An error occurred', variant: 'destructive' })
    } finally { setLoading(false) }
  }

  const handleChange = (field: string, value: any) => setFormData((prev: any) => ({ ...prev, [field]: value }))

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{battery ? 'Edit Battery' : 'Fit New Battery'}</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Vehicle *</Label>
              <Select value={formData.vehicleId} onValueChange={(v) => handleChange('vehicleId', v)} disabled={loading}>
                <SelectTrigger><SelectValue placeholder="Select vehicle" /></SelectTrigger>
                <SelectContent>{vehicles.map((v) => (<SelectItem key={v.id} value={v.id}>{v.vehicleNo} - {v.makeModel}</SelectItem>))}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Brand *</Label>
              <Input value={formData.brand} onChange={(e) => handleChange('brand', e.target.value)} disabled={loading} />
            </div>
            <div className="space-y-2">
              <Label>Model</Label>
              <Input value={formData.model} onChange={(e) => handleChange('model', e.target.value)} disabled={loading} />
            </div>
            <div className="space-y-2">
              <Label>Serial Number</Label>
              <Input value={formData.serialNumber} onChange={(e) => handleChange('serialNumber', e.target.value)} disabled={loading} />
            </div>
            <div className="space-y-2">
              <Label>Purchase Date *</Label>
              <DatePicker value={formData.purchaseDate} onChange={(v) => handleChange('purchaseDate', v)} placeholder="Pick date" disabled={loading} />
            </div>
            <div className="space-y-2">
              <Label>Purchase Cost *</Label>
              <Input type="number" step="0.01" value={formData.purchaseCost} onChange={(e) => handleChange('purchaseCost', parseFloat(e.target.value) || 0)} disabled={loading} />
            </div>
            <div className="space-y-2">
              <Label>Warranty (months)</Label>
              <Input type="number" value={formData.warrantyMonths} onChange={(e) => handleChange('warrantyMonths', parseInt(e.target.value) || 0)} disabled={loading} />
            </div>
            <div className="space-y-2">
              <Label>Fitted Odometer *</Label>
              <Input type="number" value={formData.fittedOdometer} onChange={(e) => handleChange('fittedOdometer', parseInt(e.target.value) || 0)} disabled={loading} />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? 'Saving...' : battery ? 'Update Battery' : 'Fit Battery'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
