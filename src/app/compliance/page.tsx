import { Suspense } from 'react'
import { ComplianceDashboard } from './_components/compliance-dashboard'
import { ExpiryAlerts } from './_components/expiry-alerts'
import { Button } from '@/components/ui/button'
import { RefreshCw } from 'lucide-react'

export default function CompliancePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Compliance & Expiry Tracker</h1>
          <p className="text-muted-foreground">Monitor document expiry across fleet and drivers</p>
        </div>
        <form action="/api/compliance/recalculate" method="POST">
          <Button type="submit" variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Recalculate Alerts
          </Button>
        </form>
      </div>

      <Suspense fallback={<div>Loading compliance data...</div>}>
        <ComplianceContent />
      </Suspense>
    </div>
  )
}

async function ComplianceContent() {
  const res = await fetch(`${process.env.NEXTAUTH_URL}/api/compliance/alerts`, {
    cache: 'no-store',
  })
  const data = await res.json()
  const alerts = data.alerts || []

  return (
    <div className="space-y-6">
      <ComplianceDashboard alerts={alerts} />
      <ExpiryAlerts alerts={alerts} />
    </div>
  )
}
