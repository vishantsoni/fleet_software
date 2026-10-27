'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { BatteryForm } from './battery-form'

export function BatteryTable() {
  const [batteries, setBatteries] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)

  const fetchBatteries = async () => {
    const res = await fetch('/api/batteries')
    const data = await res.json()
    setBatteries(data.batteries || [])
  }

  useEffect(() => { fetchBatteries() }, [])

  return (
    <div className="space-y-4">
      <Button onClick={() => setShowForm(true)}>Fit Battery</Button>
      {showForm && <BatteryForm onClose={() => setShowForm(false)} onSuccess={() => { setShowForm(false); fetchBatteries() }} />}
      
      {/* Desktop Table View */}
      <div className="hidden md:block rounded border overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="p-2 text-left font-medium">Vehicle</th>
              <th className="p-2 text-left font-medium">Brand</th>
              <th className="p-2 text-left font-medium">Model</th>
              <th className="p-2 text-left font-medium">Serial</th>
              <th className="p-2 text-left font-medium">Purchase Date</th>
              <th className="p-2 text-left font-medium">Cost</th>
              <th className="p-2 text-left font-medium">Warranty (mo)</th>
              <th className="p-2 text-left font-medium">Fitted Odo</th>
              <th className="p-2 text-left font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {batteries.length === 0 ? (
              <tr>
                <td colSpan={9} className="p-6 text-center text-muted-foreground">
                  No batteries found
                </td>
              </tr>
            ) : (
              batteries.map((b) => (
                <tr key={b.id} className="border-b hover:bg-muted/30">
                  <td className="p-2">{b.vehicle?.vehicleNo}</td>
                  <td className="p-2">{b.brand}</td>
                  <td className="p-2">{b.model}</td>
                  <td className="p-2">{b.serialNumber}</td>
                  <td className="p-2">{b.purchaseDate ? new Date(b.purchaseDate).toLocaleDateString() : ''}</td>
                  <td className="p-2">{b.purchaseCost}</td>
                  <td className="p-2">{b.warrantyMonths}</td>
                  <td className="p-2">{b.fittedOdometer}</td>
                  <td className="p-2">{b.status}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {batteries.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground border rounded-md">
            No batteries found
          </div>
        ) : (
          batteries.map((b) => (
            <div key={b.id} className="border rounded-lg p-4 space-y-3 bg-card">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold">{b.vehicle?.vehicleNo}</p>
                  <p className="text-sm text-muted-foreground">{b.brand} {b.model}</p>
                </div>
                <span className="text-xs bg-muted px-2 py-1 rounded">{b.status}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Serial:</span> {b.serialNumber}
                </div>
                <div>
                  <span className="text-muted-foreground">Warranty:</span> {b.warrantyMonths} mo
                </div>
                <div>
                  <span className="text-muted-foreground">Purchased:</span> {b.purchaseDate ? new Date(b.purchaseDate).toLocaleDateString() : '-'}
                </div>
                <div>
                  <span className="text-muted-foreground">Cost:</span> {b.purchaseCost}
                </div>
                <div>
                  <span className="text-muted-foreground">Fitted Odo:</span> {b.fittedOdometer}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
