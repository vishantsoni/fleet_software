import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { getDriverAction } from '@/server/actions/drivers'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft, FileText, CheckCircle, AlertTriangle, XCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface DriverDocumentsPageProps {
  params: Promise<{ id: string }>
}

async function DriverDocuments({ id }: { id: string }) {
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
          <Link href={`/drivers/${driver.id}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Documents</h1>
          <p className="text-muted-foreground">{driver.fullName} - {driver.licenseNumber}</p>
        </div>
      </div>

      <div className="flex justify-end">
        <Button asChild>
          <Link href={`/drivers/${driver.id}/documents/new`}>
            <FileText className="mr-2 h-4 w-4" />
            Add Document
          </Link>
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          {driver.driverDocuments && driver.driverDocuments.length > 0 ? (
            <div className="space-y-3">
              {driver.driverDocuments.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg">
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
    </div>
  )
}

export default async function DriverDocumentsPage({ params }: DriverDocumentsPageProps) {
  const { id } = await params

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DriverDocuments id={id} />
    </Suspense>
  )
}