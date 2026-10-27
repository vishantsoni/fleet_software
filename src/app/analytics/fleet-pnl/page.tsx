import { Suspense } from 'react'
import { FleetPnLContent } from './_components/fleet-pnl-content'

export default function FleetPnLPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Fleet P&L</h1>
        <p className="text-muted-foreground">Fleet-wide profit and loss analysis</p>
      </div>

      <Suspense fallback={<div>Loading P&L...</div>}>
        <FleetPnLContent />
      </Suspense>
    </div>
  )
}
