'use client'

import { ExpiryAlert } from '@/types/compliance'
import { formatDate, getAlertColor, getAlertLabel } from '@/server/utils/formatters'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface ComplianceAlertsProps {
  alerts?: ExpiryAlert[]
}

export function ComplianceAlerts({ alerts }: ComplianceAlertsProps) {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Compliance Alerts</h3>
      {!alerts || alerts.length === 0 ? (
        <p className="text-muted-foreground">No alerts</p>
      ) : (
        <div className="space-y-3">
          {alerts.slice(0, 5).map((alert) => (
            <div key={alert.documentId} className="flex items-center justify-between py-2 border-b last:border-0">
              <div>
                <p className="font-medium">{alert.documentType.replace(/_/g, ' ')}</p>
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
