'use client'

import { KPIs } from '@/types/analytics'
import { formatCurrency, formatNumber } from '@/server/utils/formatters'
import { Card } from '@/components/ui/card'
import { BarChart3, Coins, Gauge, Map, TrendingUp, Truck, Users, Wallet } from 'lucide-react'

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

  const cards = [
    {
      label: 'Total Revenue',
      value: formatCurrency(kpis.totalRevenue),
      icon: Wallet,
      color: 'blue',
    },
    {
      label: 'Total Cost',
      value: formatCurrency(kpis.totalCost),
      icon: Coins,
      color: 'orange',
    },
    {
      label: 'Net Profit',
      value: formatCurrency(kpis.netProfit),
      icon: TrendingUp,
      color: 'emerald',
    },
    {
      label: 'Total KM Run',
      value: `${formatNumber(kpis.totalKm, 0)} km`,
      icon: Map,
      color: 'violet',
    },
    {
      label: 'Fleet CPK',
      value: kpis.fleetCpk !== null ? `${formatCurrency(kpis.fleetCpk)}/km` : 'N/A',
      icon: Gauge,
      color: 'cyan',
    },
    {
      label: 'Fleet RPK',
      value: kpis.fleetRpk !== null ? `${formatCurrency(kpis.fleetRpk)}/km` : 'N/A',
      icon: BarChart3,
      color: 'indigo',
    },
    {
      label: 'Active Vehicles',
      value: `${kpis.activeVehicleCount} / ${kpis.vehicleCount}`,
      icon: Truck,
      color: 'teal',
    },
    {
      label: 'Active Drivers',
      value: String(kpis.activeDriverCount),
      icon: Users,
      color: 'pink',
    },
  ]

  const colors: Record<string, { card: string; icon: string; label: string }> = {
    blue: { card: 'border-blue-200/80 bg-gradient-to-br from-blue-50 to-white dark:border-blue-900 dark:from-blue-950/50 dark:to-card', icon: 'bg-blue-100 text-blue-700 dark:bg-blue-900/70 dark:text-blue-300', label: 'text-blue-700 dark:text-blue-300' },
    orange: { card: 'border-orange-200/80 bg-gradient-to-br from-orange-50 to-white dark:border-orange-900 dark:from-orange-950/50 dark:to-card', icon: 'bg-orange-100 text-orange-700 dark:bg-orange-900/70 dark:text-orange-300', label: 'text-orange-700 dark:text-orange-300' },
    emerald: { card: 'border-emerald-200/80 bg-gradient-to-br from-emerald-50 to-white dark:border-emerald-900 dark:from-emerald-950/50 dark:to-card', icon: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/70 dark:text-emerald-300', label: 'text-emerald-700 dark:text-emerald-300' },
    violet: { card: 'border-violet-200/80 bg-gradient-to-br from-violet-50 to-white dark:border-violet-900 dark:from-violet-950/50 dark:to-card', icon: 'bg-violet-100 text-violet-700 dark:bg-violet-900/70 dark:text-violet-300', label: 'text-violet-700 dark:text-violet-300' },
    cyan: { card: 'border-cyan-200/80 bg-gradient-to-br from-cyan-50 to-white dark:border-cyan-900 dark:from-cyan-950/50 dark:to-card', icon: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/70 dark:text-cyan-300', label: 'text-cyan-700 dark:text-cyan-300' },
    indigo: { card: 'border-indigo-200/80 bg-gradient-to-br from-indigo-50 to-white dark:border-indigo-900 dark:from-indigo-950/50 dark:to-card', icon: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/70 dark:text-indigo-300', label: 'text-indigo-700 dark:text-indigo-300' },
    teal: { card: 'border-teal-200/80 bg-gradient-to-br from-teal-50 to-white dark:border-teal-900 dark:from-teal-950/50 dark:to-card', icon: 'bg-teal-100 text-teal-700 dark:bg-teal-900/70 dark:text-teal-300', label: 'text-teal-700 dark:text-teal-300' },
    pink: { card: 'border-pink-200/80 bg-gradient-to-br from-pink-50 to-white dark:border-pink-900 dark:from-pink-950/50 dark:to-card', icon: 'bg-pink-100 text-pink-700 dark:bg-pink-900/70 dark:text-pink-300', label: 'text-pink-700 dark:text-pink-300' },
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map(({ label, value, icon: Icon, color }) => (
        <Card key={label} className={`overflow-hidden p-5 shadow-sm transition-shadow hover:shadow-md ${colors[color].card}`}>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className={`text-sm font-medium ${colors[color].label}`}>{label}</p>
              <p className="mt-2 truncate text-2xl font-bold tracking-tight">{value}</p>
            </div>
            <div className={`rounded-xl p-3 ${colors[color].icon}`}>
              <Icon className="h-5 w-5" aria-hidden="true" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
