'use client'

import { KPIs } from '@/types/analytics'
import { formatCurrency, formatNumber } from '@/server/utils/formatters'
import { Card } from '@/components/ui/card'

interface KPICardsProps {
  data?: KPIs
}

export function KPICards({ data }: KPICardsProps) {
  const defaultData: KPIs = {
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

  const kpis = data || defaultData

  return (
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
        <p className="text-2xl font-bold">{formatCurrency(kpis.netProfit)}</p>
      </Card>

      <Card className="p-6">
        <p className="text-sm text-muted-foreground">Total KM Run</p>
        <p className="text-2xl font-bold">{formatNumber(kpis.totalKm, 0)} km</p>
      </Card>

      <Card className="p-6">
        <p className="text-sm text-muted-foreground">Fleet CPK</p>
        <p className="text-2xl font-bold">
          {kpis.fleetCpk !== null ? formatCurrency(kpis.fleetCpk) + '/km' : 'N/A'}
        </p>
      </Card>

      <Card className="p-6">
        <p className="text-sm text-muted-foreground">Fleet RPK</p>
        <p className="text-2xl font-bold">
          {kpis.fleetRpk !== null ? formatCurrency(kpis.fleetRpk) + '/km' : 'N/A'}
        </p>
      </Card>

      <Card className="p-6">
        <p className="text-sm text-muted-foreground">Active Vehicles</p>
        <p className="text-2xl font-bold">
          {kpis.activeVehicleCount} / {kpis.vehicleCount}
        </p>
      </Card>

      <Card className="p-6">
        <p className="text-sm text-muted-foreground">Active Drivers</p>
        <p className="text-2xl font-bold">{kpis.activeDriverCount}</p>
      </Card>
    </div>
  )
}
