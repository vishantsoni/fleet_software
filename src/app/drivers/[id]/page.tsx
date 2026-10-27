import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { getDriverAction } from '@/server/actions/drivers'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft, FileText, AlertTriangle, CheckCircle, XCircle } from 'lucide-react'

interface DriverDetailPageProps {
  params: Promise<{ id: string }>
}

async function DriverDetail({ id }: { id: string }) {
  const result = await getDriverAction(id)

  if (!result.success || !result.data) {
    notFound()
  }

  const driver = result.data

  const getAlertIcon = (status: string) => {
    switch (status) {
      case 'GREEN':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'AMBER':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      case 'RED':
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return <FileText className="h-4 w-4 text-gray-600" />
    }
  }

  const getAlertBadgeVariant = (status: string) => {
    switch (status) {
      case 'GREEN':
        return 'success' as const
      case 'AMBER':
        return 'warning' as const
      case 'RED':
        return 'danger' as const
      default:
        return 'outline' as const
    }
  }

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/drivers">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{driver.fullName}</h1>
          <p className="text-muted-foreground">License: {driver.licenseNumber}</p>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="documents">
            Documents ({driver.driverDocuments?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="trips">Trips ({driver.trips?.length || 0})</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Driver Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Full Name</p>
                  <p className="text-lg font-semibold">{driver.fullName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">License Number</p>
                  <p className="text-lg font-semibold">{driver.licenseNumber}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">License Expiry</p>
                  <p className="text-lg font-semibold">{formatDate(driver.licenseExpiry)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Phone</p>
                  <p className="text-lg font-semibold">{driver.phone || '-'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Aadhar Number</p>
                  <p className="text-lg font-semibold">{driver.aadharNumber || '-'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Base Salary</p>
                  <p className="text-lg font-semibold">₹{driver.baseSalary.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <Badge variant={driver.status === 'ACTIVE' ? 'default' : 'secondary'}>
                    {driver.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Address</p>
                  <p className="text-lg font-semibold">{driver.address || '-'}</p>
                </div>
                <div className="md:col-span-2 lg:col-span-3">
                  <p className="text-sm font-medium text-muted-foreground">Created At</p>
                  <p className="text-lg font-semibold">{formatDate(driver.createdAt)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Driver Documents</CardTitle>
              <Button asChild variant="outline" size="sm">
                <Link href={`/drivers/${driver.id}/documents/new`}>
                  <FileText className="mr-2 h-4 w-4" />
                  Add Document
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {driver.driverDocuments && driver.driverDocuments.length > 0 ? (
                <div className="space-y-3">
                  {driver.driverDocuments.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <FileText className="h-6 w-6 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{doc.documentType}</p>
                          <p className="text-sm text-muted-foreground">
                            {doc.documentNumber ? `No: ${doc.documentNumber}` : 'No document number'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-right">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Issued</p>
                          <p className="font-medium">{formatDate(doc.issueDate)}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Expires</p>
                          <p className="font-medium">{formatDate(doc.expiryDate)}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Days Left</p>
                          <p className="font-medium">
                            {doc.daysToExpiry !== null ? `${doc.daysToExpiry} days` : 'N/A'}
                          </p>
                        </div>
                        <Badge variant={getAlertBadgeVariant(doc.alertStatus)}>
                          {getAlertIcon(doc.alertStatus)}
                          <span className="ml-1">{doc.alertStatus}</span>
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                  <p className="mt-4 text-muted-foreground">No documents found.</p>
                  <Button asChild className="mt-4" variant="outline">
                    <Link href={`/drivers/${driver.id}/documents/new`}>Add Document</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trips">
          <Card>
            <CardHeader>
              <CardTitle>Recent Trips</CardTitle>
            </CardHeader>
            <CardContent>
              {driver.trips && driver.trips.length > 0 ? (
                <div className="space-y-2">
                  {driver.trips.map((trip) => (
                    <div key={trip.id} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <p className="font-medium">{trip.origin} → {trip.destination}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(trip.tripDate)} - {trip.status}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{trip.totalKm} km</p>
                        <p className="text-sm text-muted-foreground">₹{trip.freightAmount.toLocaleString()}</p>
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
      </Tabs>
    </div>
  )
}

export default async function DriverDetailPage({ params }: DriverDetailPageProps) {
  const { id } = await params

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DriverDetail id={id} />
    </Suspense>
  )
}