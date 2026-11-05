'use client'

import { ExpiryAlert } from '@/types/compliance'
import { getAlertLabel } from '@/server/utils/formatters'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ShieldAlert } from 'lucide-react'

interface ComplianceAlertsProps {
  alerts?: ExpiryAlert[]
}

export function ComplianceAlerts({ alerts }: ComplianceAlertsProps) {
  return (
    <Card className="overflow-hidden border-amber-200/80 bg-gradient-to-br from-amber-50/80 to-white p-6 dark:border-amber-900 dark:from-amber-950/30 dark:to-card">
      <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
        <span className="rounded-lg bg-amber-100 p-2 text-amber-700 dark:bg-amber-900/70 dark:text-amber-300">
          <ShieldAlert className="h-4 w-4" />
        </span>
        Compliance Alerts
      </h3>
      {!alerts || alerts.length === 0 ? (
        <p className="text-muted-foreground">No alerts</p>
      ) : (
        <div className="space-y-3">
          {alerts.slice(0, 5).map((alert) => (
            <div
              key={alert.documentId}
              className={`flex items-center justify-between gap-3 rounded-lg border px-3 py-3 ${
                alert.alertStatus === 'RED'
                  ? 'border-red-100 bg-red-50/80 dark:border-red-900/70 dark:bg-red-950/30'
                  : alert.alertStatus === 'AMBER'
                    ? 'border-amber-100 bg-amber-50/80 dark:border-amber-900/70 dark:bg-amber-950/30'
                    : 'border-emerald-100 bg-emerald-50/80 dark:border-emerald-900/70 dark:bg-emerald-950/30'
              }`}
            >
              <div>
                <p className="font-medium">{alert.documentType}</p>
                <p className="text-sm text-muted-foreground">
                  {alert.entityType}: {alert.entityName}
                </p>
              </div>
              <div className="text-right">
                <Badge variant={alert.alertStatus === 'RED' ? 'danger' : alert.alertStatus === 'AMBER' ? 'warning' : 'success'}>
                  {getAlertLabel(alert.alertStatus)}
                </Badge>
                <p className="text-sm text-muted-foreground">
                  {alert.daysToExpiry > 0 ? `${alert.daysToExpiry} days left` : 'Expired'}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
