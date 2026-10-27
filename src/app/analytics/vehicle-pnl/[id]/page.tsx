import { Suspense } from 'react'
import { VehiclePnLContent } from './_components/vehicle-pnl-content'

export default function VehiclePnLPage({
  params,
}: {
  params: { id: string }
}) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Vehicle P&L</h1>
        <p className="text-muted-foreground">Profit and loss analysis for a specific vehicle</p>
      </div>

      <Suspense fallback={<div>Loading vehicle P&L...</div>}>
        <VehiclePnLContent data={[]} />
      </Suspense>
    </div>
  )
}
