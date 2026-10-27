import { Suspense } from 'react'
import { KPICards } from './_components/kpi-cards'
import { RecentTrips } from './_components/recent-trips'
import { ComplianceAlerts } from './_components/compliance-alerts'
import { getKPIs } from '@/server/actions/analytics'
import { listTrips } from '@/server/actions/trips'
import { getExpiryAlerts } from '@/server/actions/compliance'

export default async function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Fleet overview and key metrics
        </p>
      </div>

      <Suspense fallback={<div>Loading KPIs...</div>}>
        <DashboardKPIs />
      </Suspense>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Suspense fallback={<div>Loading recent trips...</div>}>
          <RecentTripsWrapper />
        </Suspense>

        <Suspense fallback={<div>Loading compliance alerts...</div>}>
          <ComplianceAlertsWrapper />
        </Suspense>
      </div>
    </div>
  )
}

async function DashboardKPIs() {
  const kpis = await getKPIs()
  return <KPICards data={kpis} />
}

async function RecentTripsWrapper() {
  const result = await listTrips({ limit: 5 })
  const trips = (result.trips || []).map((trip: any) => ({
    ...trip,
    customerId: trip.customerId ?? undefined,
  }))
  return <RecentTrips trips={trips} />
}

async function ComplianceAlertsWrapper() {
  const alerts = await getExpiryAlerts()
  return <ComplianceAlerts alerts={alerts} />
}
