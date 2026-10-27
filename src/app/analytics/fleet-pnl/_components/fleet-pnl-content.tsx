'use client'

import { useState } from 'react'
import { PnLData } from '@/types/analytics'
import { formatCurrency } from '@/server/utils/formatters'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface FleetPnLContentProps {
  data?: PnLData[]
}

export function FleetPnLContent({ data }: FleetPnLContentProps) {
  const [period, setPeriod] = useState({ start: '', end: '' })
  const [loading, setLoading] = useState(false)
  const [pnlData, setPnLData] = useState<PnLData[]>(data || [])

  const handleCalculate = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/analytics/fleet-pnl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(period),
      })
      const result = await res.json()
      setPnLData(result.data || [])
    } catch (error) {
      console.error('Failed to calculate P&L:', error)
    } finally {
      setLoading(false)
    }
  }

  const totals = pnlData.reduce(
    (acc, item) => ({
      totalRevenue: acc.totalRevenue + item.totalRevenue,
      totalCost: acc.totalCost + item.totalCost,
      netProfit: acc.netProfit + item.netProfit,
      totalKm: acc.totalKm + item.totalKm,
    }),
    { totalRevenue: 0, totalCost: 0, netProfit: 0, totalKm: 0 }
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/analytics">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Analytics
          </Button>
        </Link>
        <div className="flex items-center gap-4">
          <input
            type="date"
            value={period.start}
            onChange={(e) => setPeriod({ ...period, start: e.target.value })}
            className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
          <span className="text-muted-foreground">to</span>
          <input
            type="date"
            value={period.end}
            onChange={(e) => setPeriod({ ...period, end: e.target.value })}
            className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
          <Button onClick={handleCalculate} disabled={loading}>
            {loading ? 'Calculating...' : 'Calculate'}
          </Button>
        </div>
      </div>

      {pnlData.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground">Total Revenue</p>
              <p className="text-xl font-bold">{formatCurrency(totals.totalRevenue)}</p>
            </div>
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground">Total Cost</p>
              <p className="text-xl font-bold">{formatCurrency(totals.totalCost)}</p>
            </div>
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground">Net Profit</p>
              <p className={`text-xl font-bold ${totals.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(totals.netProfit)}
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground">Total KM</p>
              <p className="text-xl font-bold">{totals.totalKm.toLocaleString()} km</p>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vehicle</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                  <TableHead className="text-right">Fuel</TableHead>
                  <TableHead className="text-right">Maintenance</TableHead>
                  <TableHead className="text-right">Tyres</TableHead>
                  <TableHead className="text-right">Total Cost</TableHead>
                  <TableHead className="text-right">Net Profit</TableHead>
                  <TableHead className="text-right">Margin</TableHead>
                  <TableHead className="text-right">CPK</TableHead>
                  <TableHead className="text-right">RPK</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pnlData.map((item) => (
                  <TableRow key={item.vehicleId}>
                    <TableCell className="font-medium">{item.vehicleNo}</TableCell>
                    <TableCell className="text-right">{formatCurrency(item.totalRevenue)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(item.fuelCost)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(item.maintenanceCost)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(item.tyreCost)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(item.totalCost)}</TableCell>
                    <TableCell className={`text-right ${item.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(item.netProfit)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant={item.profitMargin >= 0 ? 'success' : 'danger'}>
                        {item.profitMargin.toFixed(1)}%
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {item.cpk !== null ? formatCurrency(item.cpk) : 'N/A'}
                    </TableCell>
                    <TableCell className="text-right">
                      {item.rpk !== null ? formatCurrency(item.rpk) : 'N/A'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </div>
  )
}
