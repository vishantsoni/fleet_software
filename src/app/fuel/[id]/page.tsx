import { Suspense } from 'react'
import { getFuelEntryAction } from '@/server/actions/fuel'
import { formatCurrency, formatNumber, formatDate } from '@/server/utils/formatters'

interface FuelDetailPageProps {
  params: Promise<{ id: string }>
}

async function FuelDetailContent({ params }: FuelDetailPageProps) {
  const { id } = await params
  const result = await getFuelEntryAction(id)

  if (!result.success || !result.data) {
    return <div className="text-red-600">{result.error || 'Fuel entry not found'}</div>
  }

  const entry = result.data

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Fuel Entry Details</h1>
          <p className="text-muted-foreground">View fuel entry information</p>
        </div>
        <a href={`/fuel/${id}/edit`}>
          <button className="btn btn-primary">Edit</button>
        </a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="rounded-lg border bg-card p-4">
          <h3 className="text-sm font-medium text-muted-foreground">Date</h3>
          <p className="text-lg font-semibold">{formatDate(entry.entryDate)}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <h3 className="text-sm font-medium text-muted-foreground">Vehicle</h3>
          <p className="text-lg font-semibold">
            {entry.vehicle?.vehicleNo} - {entry.vehicle?.makeModel}
          </p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <h3 className="text-sm font-medium text-muted-foreground">Station</h3>
          <p className="text-lg font-semibold">{entry.station}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <h3 className="text-sm font-medium text-muted-foreground">Fuel Type</h3>
          <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
            entry.fuelType === 'DIESEL' ? 'bg-blue-100 text-blue-800' :
            entry.fuelType === 'PETROL' ? 'bg-green-100 text-green-800' :
            entry.fuelType === 'CNG' ? 'bg-yellow-100 text-yellow-800' :
            'bg-purple-100 text-purple-800'
          }`}>
            {entry.fuelType}
          </span>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <h3 className="text-sm font-medium text-muted-foreground">Litres</h3>
          <p className="text-lg font-semibold">{formatNumber(entry.litres, 2)} L</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <h3 className="text-sm font-medium text-muted-foreground">Rate per Litre</h3>
          <p className="text-lg font-semibold">{formatCurrency(entry.ratePerLitre)}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <h3 className="text-sm font-medium text-muted-foreground">Total Amount</h3>
          <p className="text-lg font-semibold text-primary">{formatCurrency(entry.totalAmount)}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <h3 className="text-sm font-medium text-muted-foreground">Odometer Reading</h3>
          <p className="text-lg font-semibold">{formatNumber(entry.odometerReading, 0)} km</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <h3 className="text-sm font-medium text-muted-foreground">KM Since Last Fill</h3>
          <p className="text-lg font-semibold">{formatNumber(entry.kmSinceLastFill, 2)} km</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <h3 className="text-sm font-medium text-muted-foreground">Fuel Economy</h3>
          <p className="text-lg font-semibold">
            {entry.fuelEconomy !== undefined ? `${formatNumber(entry.fuelEconomy, 2)} km/L` : 'N/A'}
          </p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <h3 className="text-sm font-medium text-muted-foreground">Created At</h3>
          <p className="text-lg font-semibold">{formatDate(entry.createdAt)}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <h3 className="text-sm font-medium text-muted-foreground">Updated At</h3>
          <p className="text-lg font-semibold">{formatDate(entry.updatedAt)}</p>
        </div>
      </div>
    </div>
  )
}

export default async function FuelDetailPage({ params }: FuelDetailPageProps) {
  return (
    <div className="space-y-6">
      <Suspense fallback={<div className="text-center py-8">Loading...</div>}>
        <FuelDetailContent params={params} />
      </Suspense>
    </div>
  )
}