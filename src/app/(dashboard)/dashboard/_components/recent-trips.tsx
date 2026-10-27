'use client'

import { Trip } from '@/types/trip'
import { formatCurrency, formatDate } from '@/server/utils/formatters'
import { Card } from '@/components/ui/card'

interface RecentTripsProps {
  trips?: Trip[]
}

export function RecentTrips({ trips }: RecentTripsProps) {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Recent Trips</h3>
      {!trips || trips.length === 0 ? (
        <p className="text-muted-foreground">No recent trips</p>
      ) : (
        <div className="space-y-3">
          {trips.slice(0, 5).map((trip) => (
            <div key={trip.id} className="flex items-center justify-between py-2 border-b last:border-0">
              <div>
                <p className="font-medium">{trip.origin} → {trip.destination}</p>
                <p className="text-sm text-muted-foreground">{formatDate(trip.tripDate)}</p>
              </div>
              <div className="text-right">
                <p className="font-medium">{formatCurrency(trip.revenue)}</p>
                <p className="text-sm text-muted-foreground">{trip.totalKm} km</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
