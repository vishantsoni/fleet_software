'use client'

import { Trip } from '@/types/trip'
import { formatCurrency, formatDate } from '@/server/utils/formatters'
import { Card } from '@/components/ui/card'
import { ArrowRight, Route } from 'lucide-react'

interface RecentTripsProps {
  trips?: Trip[]
}

export function RecentTrips({ trips }: RecentTripsProps) {
  return (
    <Card className="overflow-hidden border-sky-200/80 bg-gradient-to-br from-sky-50/80 to-white p-6 dark:border-sky-900 dark:from-sky-950/30 dark:to-card">
      <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
        <span className="rounded-lg bg-sky-100 p-2 text-sky-700 dark:bg-sky-900/70 dark:text-sky-300">
          <Route className="h-4 w-4" />
        </span>
        Recent Trips
      </h3>
      {!trips || trips.length === 0 ? (
        <p className="text-muted-foreground">No recent trips</p>
      ) : (
        <div className="space-y-3">
          {trips.slice(0, 5).map((trip) => (
            <div key={trip.id} className="flex items-center justify-between gap-3 rounded-lg border border-sky-100 bg-white/70 px-3 py-3 last:border-sky-100 dark:border-sky-900/70 dark:bg-slate-950/30">
              <div className="min-w-0">
                <p className="flex items-center gap-2 font-medium">
                  <span className="truncate">{trip.origin}</span>
                  <ArrowRight className="h-3.5 w-3.5 shrink-0 text-sky-600" />
                  <span className="truncate">{trip.destination}</span>
                </p>
                <p className="text-sm text-muted-foreground">{formatDate(trip.tripDate)}</p>
              </div>
              <div className="shrink-0 text-right">
                <p className="font-semibold text-sky-700 dark:text-sky-300">{formatCurrency(trip.revenue)}</p>
                <p className="text-sm text-muted-foreground">{trip.totalKm} km</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
