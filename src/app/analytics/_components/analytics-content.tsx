'use client'

import { useState, useEffect } from 'react'
import { KPIs } from '@/types/analytics'
import { formatCurrency, formatNumber } from '@/server/utils/formatters'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

interface AnalyticsContentProps {
  data?: {
    kpis: KPIs
    chartData: any[]
  }
}

export function AnalyticsContent({ data }: AnalyticsContentProps) {
  const [period, setPeriod] = useState({ start: '', end: '' })
  const [loading, setLoading] = useState(false)
  const [analyticsData, setAnalyticsData] = useState(data)
  const [workshops, setWorkshops] = useState<{ id: string; name: string }[]>([])
  const [selectedWorkshopId, setSelectedWorkshopId] = useState('')

  useEffect(() => {
    fetch('/api/workshops')
      .then((res) => res.json())
      .then((data) => setWorkshops(data))
      .catch((error) => console.error('Failed to fetch workshops:', error))
  }, [])

  const handleCalculate = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'kpis',
          startDate: period.start || undefined,
          endDate: period.end || undefined,
          workshopId: selectedWorkshopId || undefined,
        }),
      })
      const result = await res.json()
      setAnalyticsData({ kpis: result, chartData: [] })
    } catch (error) {
      console.error('Failed to load analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const kpis = analyticsData?.kpis || {
    totalRevenue: 0,
    totalCost: 0,
    netProfit: 0,
    totalKm: 0,
    fleetCpk: null,
    fleetRpk: null,
    vehicleCount: 0,
    activeVehicleCount: 0,
    activeDriverCount: 0,
  }

  const chartData = analyticsData?.chartData || []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">Fleet performance and P&L insights</p>
        </div>
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
          <div className="w-48">
            <Select value={selectedWorkshopId} onValueChange={setSelectedWorkshopId}>
              <SelectTrigger>
                <SelectValue placeholder="All Workshops" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Workshops</SelectItem>
                {workshops.map((workshop) => (
                  <SelectItem key={workshop.id} value={workshop.id}>
                    {workshop.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleCalculate} disabled={loading}>
            {loading ? 'Loading...' : 'Load'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <p className="text-sm text-muted-foreground">Total Revenue</p>
          <p className="text-2xl font-bold">{formatCurrency(kpis.totalRevenue)}</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-muted-foreground">Total Cost</p>
          <p className="text-2xl font-bold">{formatCurrency(kpis.totalCost)}</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-muted-foreground">Net Profit</p>
          <p className={`text-2xl font-bold ${kpis.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(kpis.netProfit)}
          </p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-muted-foreground">Total KM</p>
          <p className="text-2xl font-bold">{formatNumber(kpis.totalKm, 0)} km</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Revenue vs Cost</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#2563eb" name="Revenue" />
              <Line type="monotone" dataKey="cost" stroke="#dc2626" name="Cost" />
              <Line type="monotone" dataKey="profit" stroke="#16a34a" name="Profit" />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Fleet Metrics</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground">Fleet CPK</p>
                <p className="text-xl font-bold">
                  {kpis.fleetCpk !== null ? formatCurrency(kpis.fleetCpk) : 'N/A'}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground">Fleet RPK</p>
                <p className="text-xl font-bold">
                  {kpis.fleetRpk !== null ? formatCurrency(kpis.fleetRpk) : 'N/A'}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground">Active Vehicles</p>
                <p className="text-xl font-bold">
                  {kpis.activeVehicleCount} / {kpis.vehicleCount}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground">Active Drivers</p>
                <p className="text-xl font-bold">{kpis.activeDriverCount}</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="flex gap-4">
        <Link href="/analytics/fleet-pnl">
          <Button>Fleet P&L Report</Button>
        </Link>
      </div>
    </div>
  )
}
