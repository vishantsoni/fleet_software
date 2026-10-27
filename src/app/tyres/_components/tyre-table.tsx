'use client'

import { useState } from 'react'
import { Tyre } from '@/types/tyre'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDate } from '@/server/utils/formatters'
import { Badge } from '@/components/ui/badge'
import { TyreForm } from './tyre-form'

interface TyreTableProps {
  tyres: Tyre[]
}

export function TyreTable({ tyres }: TyreTableProps) {
  const [editingTyre, setEditingTyre] = useState<Tyre | null>(null)

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'FITTED':
        return <Badge variant="success">Fitted</Badge>
      case 'REMOVED':
        return <Badge variant="warning">Removed</Badge>
      case 'SCRAPPED':
        return <Badge variant="destructive">Scrapped</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  return (
    <div className="space-y-4">
      {/* Desktop Table View */}
      <div className="hidden md:block rounded-md border overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="p-3 text-left font-medium">Vehicle</th>
              <th className="p-3 text-left font-medium">Axle</th>
              <th className="p-3 text-left font-medium">Brand</th>
              <th className="p-3 text-left font-medium">Size</th>
              <th className="p-3 text-left font-medium">Purchase Date</th>
              <th className="p-3 text-right font-medium">Cost</th>
              <th className="p-3 text-center font-medium">Fitted KM</th>
              <th className="p-3 text-center font-medium">Removal KM</th>
              <th className="p-3 text-center font-medium">Status</th>
              <th className="p-3 text-center font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tyres.length === 0 ? (
              <tr>
                <td colSpan={10} className="p-6 text-center text-muted-foreground">
                  No tyres found
                </td>
              </tr>
            ) : (
              tyres.map((tyre) => (
                <tr key={tyre.id} className="border-b hover:bg-muted/30">
                  <td className="p-3">{tyre.vehicle?.vehicleNo || tyre.vehicleId} - {tyre.vehicle?.makeModel || ''}</td>
                  <td className="p-3">{tyre.axlePosition}</td>
                  <td className="p-3">{tyre.brand}</td>
                  <td className="p-3">{tyre.size}</td>
                  <td className="p-3">{formatDate(tyre.purchaseDate)}</td>
                  <td className="p-3 text-right">{formatCurrency(tyre.purchaseCost)}</td>
                  <td className="p-3 text-center">{tyre.fittedOdometer.toLocaleString()}</td>
                  <td className="p-3 text-center">{tyre.removalOdometer?.toLocaleString() || '—'}</td>
                  <td className="p-3 text-center">{getStatusBadge(tyre.status)}</td>
                  <td className="p-3">
                    <div className="flex items-center justify-center gap-2">
                      {tyre.status === 'FITTED' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingTyre(tyre)}
                        >
                          Edit
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {tyres.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground border rounded-md">
            No tyres found
          </div>
        ) : (
          tyres.map((tyre) => (
            <div key={tyre.id} className="border rounded-lg p-4 space-y-3 bg-card">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold">{tyre.vehicle?.vehicleNo || tyre.vehicleId}</p>
                  <p className="text-sm text-muted-foreground">{tyre.vehicle?.makeModel}</p>
                </div>
                {getStatusBadge(tyre.status)}
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Brand:</span> {tyre.brand}
                </div>
                <div>
                  <span className="text-muted-foreground">Size:</span> {tyre.size}
                </div>
                <div>
                  <span className="text-muted-foreground">Axle:</span> {tyre.axlePosition}
                </div>
                <div>
                  <span className="text-muted-foreground">Cost:</span> {formatCurrency(tyre.purchaseCost)}
                </div>
                <div>
                  <span className="text-muted-foreground">Purchased:</span> {formatDate(tyre.purchaseDate)}
                </div>
                <div>
                  <span className="text-muted-foreground">Fitted KM:</span> {tyre.fittedOdometer.toLocaleString()}
                </div>
                {tyre.removalOdometer && (
                  <div>
                    <span className="text-muted-foreground">Removal KM:</span> {tyre.removalOdometer.toLocaleString()}
                  </div>
                )}
              </div>
              {tyre.status === 'FITTED' && (
                <div className="flex items-center gap-2 pt-2 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingTyre(tyre)}
                    className="flex-1"
                  >
                    Edit
                  </Button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {editingTyre && (
        <TyreForm
          tyre={editingTyre}
          onClose={() => setEditingTyre(null)}
          onSuccess={() => {
            setEditingTyre(null)
          }}
        />
      )}
    </div>
  )
}
