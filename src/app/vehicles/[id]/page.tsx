import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { getVehicleAction } from '@/server/actions/vehicles'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

interface VehicleDetailPageProps {
  params: Promise<{ id: string }>
}

async function VehicleDetail({ id }: { id: string }) {
  const result = await getVehicleAction(id)

  if (!result.success || !result.data) {
    notFound()
  }

  const vehicle = result.data

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/vehicles">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{vehicle.vehicleNo}</h1>
          <p className="text-muted-foreground">{vehicle.makeModel}</p>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="trips">Trips ({vehicle.trips?.length || 0})</TabsTrigger>
          <TabsTrigger value="fuel">Fuel ({vehicle.fuelEntries?.length || 0})</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance ({vehicle.maintenanceJobs?.length || 0})</TabsTrigger>
          <TabsTrigger value="tyres">Tyres ({vehicle.tyres?.length || 0})</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Vehicle Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Vehicle Number</p>
                  <p className="text-lg font-semibold">{vehicle.vehicleNo}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Make/Model</p>
                  <p className="text-lg font-semibold">{vehicle.makeModel}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Year</p>
                  <p className="text-lg font-semibold">{vehicle.year}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Capacity</p>
                  <p className="text-lg font-semibold">{vehicle.capacityTonnage} t</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Owner Type</p>
                  <Badge variant="outline">{vehicle.ownerType}</Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <Badge variant={vehicle.status === 'ACTIVE' ? 'default' : 'secondary'}>
                    {vehicle.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Current Odometer</p>
                  <p className="text-lg font-semibold">{vehicle.currentOdometer} km</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Registration Date</p>
                  <p className="text-lg font-semibold">
                    {new Date(vehicle.registrationDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Engine Ref</p>
                  <p className="text-lg font-semibold">{vehicle.engineRef || '-'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Chassis Ref</p>
                  <p className="text-lg font-semibold">{vehicle.chassisRef || '-'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trips">
          <Card>
            <CardHeader>
              <CardTitle>Recent Trips</CardTitle>
            </CardHeader>
            <CardContent>
              {vehicle.trips && vehicle.trips.length > 0 ? (
                <div className="space-y-2">
                  {vehicle.trips.map((trip) => (
                    <div key={trip.id} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <p className="font-medium">{trip.origin} → {trip.destination}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(trip.tripDate).toLocaleDateString()} - {trip.status}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{trip.totalKm} km</p>
                        <p className="text-sm text-muted-foreground">₹{trip.freightAmount}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No trips found.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fuel">
          <Card>
            <CardHeader>
              <CardTitle>Fuel Entries</CardTitle>
            </CardHeader>
            <CardContent>
              {vehicle.fuelEntries && vehicle.fuelEntries.length > 0 ? (
                <div className="space-y-2">
                  {vehicle.fuelEntries.map((entry) => (
                    <div key={entry.id} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <p className="font-medium">{entry.station}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(entry.entryDate).toLocaleDateString()} - {entry.fuelType}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{entry.litres} L @ ₹{entry.ratePerLitre}</p>
                        <p className="text-sm text-muted-foreground">₹{entry.totalAmount}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No fuel entries found.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="maintenance">
          <Card>
            <CardHeader>
              <CardTitle>Maintenance Jobs</CardTitle>
            </CardHeader>
            <CardContent>
              {vehicle.maintenanceJobs && vehicle.maintenanceJobs.length > 0 ? (
                <div className="space-y-2">
                  {vehicle.maintenanceJobs.map((job) => (
                    <div key={job.id} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <p className="font-medium">{job.jobType}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(job.jobDate).toLocaleDateString()} - {job.description || '-'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">₹{job.totalCost}</p>
                        <p className="text-sm text-muted-foreground">@ {job.odometerAtService} km</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No maintenance jobs found.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tyres">
          <Card>
            <CardHeader>
              <CardTitle>Tyres</CardTitle>
            </CardHeader>
            <CardContent>
              {vehicle.tyres && vehicle.tyres.length > 0 ? (
                <div className="space-y-2">
                  {vehicle.tyres.map((tyre) => (
                    <div key={tyre.id} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <p className="font-medium">{tyre.brand} - {tyre.size}</p>
                        <p className="text-sm text-muted-foreground">
                          {tyre.axlePosition} - {new Date(tyre.purchaseDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">₹{tyre.purchaseCost}</p>
                        <p className="text-sm text-muted-foreground">
                          {tyre.status} - Fitted at {tyre.fittedOdometer} km
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No tyres found.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default async function VehicleDetailPage({ params }: VehicleDetailPageProps) {
  const { id } = await params

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VehicleDetail id={id} />
    </Suspense>
  )
}
