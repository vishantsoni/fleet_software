import { Suspense } from 'react'
import { listTyres } from '@/server/actions/tyres'
import { TyreTable } from './_components/tyre-table'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'

export default function TyresPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tyre Management</h1>
          <p className="text-muted-foreground">Track tyre lifecycle and cost per KM</p>
        </div>
        <Link href="/tyres/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Fit Tyre
          </Button>
        </Link>
      </div>

      <Suspense fallback={<div>Loading tyres...</div>}>
        <TyresContent />
      </Suspense>
    </div>
  )
}

async function TyresContent() {
  const result = await listTyres({ limit: 50 })
  const tyres = (result.tyres || []).map((tyre: any) => ({
    ...tyre,
    purchaseCost: Number(tyre.purchaseCost),
    costPerKm: tyre.costPerKm == null ? undefined : Number(tyre.costPerKm),
    removalOdometer: tyre.removalOdometer ?? undefined,
    vehicle: tyre.vehicle
      ? { id: tyre.vehicle.id, vehicleNo: tyre.vehicle.vehicleNo }
      : undefined,
  }))

  return <TyreTable tyres={tyres} />
}