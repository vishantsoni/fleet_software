'use client'

import { ExpiryAlert } from '@/types/compliance'
import { formatCurrency, formatDate, getAlertColor, getAlertLabel } from '@/server/utils/formatters'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface ComplianceDashboardProps {
  alerts: ExpiryAlert[]
}

export function ComplianceDashboard({ alerts }: ComplianceDashboardProps) {
  const total = alerts.length
  const red = alerts.filter((a) => a.alertStatus === 'RED').length
  const amber = alerts.filter((a) => a.alertStatus === 'AMBER').length
  const green = alerts.filter((a) => a.alertStatus === 'GREEN').length

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card className="p-6">
        <p className="text-sm text-muted-foreground">Total Documents</p>
        <p className="text-2xl font-bold">{total}</p>
      </Card>
      <Card className="p-6">
        <p className="text-sm text-muted-foreground">Expired</p>
        <p className="text-2xl font-bold text-red-600">{red}</p>
      </Card>
      <Card className="p-6">
        <p className="text-sm text-muted-foreground">Expiring Soon</p>
        <p className="text-2xl font-bold text-yellow-600">{amber}</p>
      </Card>
      <Card className="p-6">
        <p className="text-sm text-muted-foreground">Valid</p>
        <p className="text-2xl font-bold text-green-600">{green}</p>
      </Card>
    </div>
  )
}
