'use client'

import { useState } from 'react'
import { PnLData } from '@/types/analytics'
import { formatCurrency } from '@/server/utils/formatters'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface VehiclePnLContentProps {
  data?: PnLData[]
}

export function VehiclePnLContent({ data }: VehiclePnLContentProps) {
  const [vehicleId, setVehicleId] = useState('')
  const [loading, setLoading] = useState(false)
  const [pnlData, setPnlData] = useState<PnLData | null>(data?.[0] || null)

  const handleCalculate = async () => {
    if (!vehicleId) return

    setLoading(true)
    try {
      const res = await fetch(`/api/analytics/vehicle-pnl/${vehicleId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
      const result = await res.json()
      setPnlData(result)
    } catch (error) {
      console.error('Failed to calculate vehicle P&L:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!pnlData) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Vehicle P&L</h2>
        <div className="flex items-center gap-4">
          <input
            type="text"
            value={vehicleId}
            onChange={(e) => setVehicleId(e.target.value)}
            placeholder="Enter Vehicle ID"
            className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
          <Button onClick={handleCalculate} disabled={loading}>
            {loading ? 'Calculating...' : 'Calculate'}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Vehicle P&L: {pnlData.vehicleNo}</h2>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 border rounded-lg">
          <p className="text-sm text-muted-foreground">Total Revenue</p>
          <p className="text-xl font-bold">{formatCurrency(pnlData.totalRevenue)}</p>
        </div>
        <div className="p-4 border rounded-lg">
          <p className="text-sm text-muted-foreground">Total Cost</p>
          <p className="text-xl font-bold">{formatCurrency(pnlData.totalCost)}</p>
        </div>
        <div className="p-4 border rounded-lg">
          <p className="text-sm text-muted-foreground">Net Profit</p>
          <p className={`text-xl font-bold ${pnlData.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(pnlData.netProfit)}
          </p>
        </div>
        <div className="p-4 border rounded-lg">
          <p className="text-sm text-muted-foreground">Total KM</p>
          <p className="text-xl font-bold">{pnlData.totalKm.toLocaleString()} km</p>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Metric</TableHead>
              <TableHead className="text-right">Value</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">Revenue</TableCell>
              <TableCell className="text-right">{formatCurrency(pnlData.totalRevenue)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Fuel Cost</TableCell>
              <TableCell className="text-right">{formatCurrency(pnlData.fuelCost)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Maintenance Cost</TableCell>
              <TableCell className="text-right">{formatCurrency(pnlData.maintenanceCost)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Tyre Cost</TableCell>
              <TableCell className="text-right">{formatCurrency(pnlData.tyreCost)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Overheads</TableCell>
              <TableCell className="text-right">{formatCurrency(pnlData.overheads)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Total Cost</TableCell>
              <TableCell className="text-right">{formatCurrency(pnlData.totalCost)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Net Profit</TableCell>
              <TableCell className={`text-right ${pnlData.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(pnlData.netProfit)}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Profit Margin</TableCell>
              <TableCell className="text-right">
                <Badge variant={pnlData.profitMargin >= 0 ? 'success' : 'danger'}>
                  {pnlData.profitMargin.toFixed(1)}%
                </Badge>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">CPK</TableCell>
              <TableCell className="text-right">
                {pnlData.cpk !== null ? formatCurrency(pnlData.cpk) : 'N/A'}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">RPK</TableCell>
              <TableCell className="text-right">
                {pnlData.rpk !== null ? formatCurrency(pnlData.rpk) : 'N/A'}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
