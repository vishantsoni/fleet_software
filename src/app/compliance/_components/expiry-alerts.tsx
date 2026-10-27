'use client'

import { ExpiryAlert } from '@/types/compliance'
import { formatDate, getAlertColor, getAlertLabel } from '@/server/utils/formatters'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface ExpiryAlertsProps {
  alerts: ExpiryAlert[]
}

export function ExpiryAlerts({ alerts }: ExpiryAlertsProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Document Type</TableHead>
            <TableHead>Entity</TableHead>
            <TableHead>Entity Type</TableHead>
            <TableHead>Expiry Date</TableHead>
            <TableHead>Days Left</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {alerts.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground">
                No alerts
              </TableCell>
            </TableRow>
          ) : (
            alerts.map((alert) => (
              <TableRow key={alert.documentId}>
                <TableCell className="font-medium">
                  {alert.documentType.replace(/_/g, ' ')}
                </TableCell>
                <TableCell>{alert.entityName}</TableCell>
                <TableCell>
                  <Badge variant="outline">{alert.entityType}</Badge>
                </TableCell>
                <TableCell>{formatDate(alert.expiryDate)}</TableCell>
                <TableCell>
                  {alert.daysToExpiry > 0 ? `${alert.daysToExpiry} days` : 'Expired'}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      alert.alertStatus === 'RED'
                        ? 'danger'
                        : alert.alertStatus === 'AMBER'
                        ? 'warning'
                        : 'success'
                    }
                  >
                    {getAlertLabel(alert.alertStatus)}
                  </Badge>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
