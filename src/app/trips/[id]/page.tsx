import { notFound } from 'next/navigation'
import { getTrip } from '@/server/actions/trips/get-trip'
import { TripWithRelations } from '@/types/trip'
import { TripDetails } from '../_components/trip-details'

interface TripDetailsPageProps {
  params: Promise<{ id: string }>
}

export default async function TripDetailsPage({ params }: TripDetailsPageProps) {
  const { id } = await params
  let trip

  try {
    trip = await getTrip(id)
  } catch (error) {
    if (error instanceof Error && error.message === 'Trip not found') {
      notFound()
    }
    throw error
  }

  const tripDetails: TripWithRelations = {
    ...trip,
    totalKm: Number(trip.totalKm),
    freightAmount: Number(trip.freightAmount),
    revenue: Number(trip.revenue),
    advance: Number(trip.advance),
    commissionDeduct: Number(trip.commissionDeduct),
    includedKm:
      trip.includedKm === null || trip.includedKm === undefined
        ? null
        : Number(trip.includedKm),
    baseAmount:
      trip.baseAmount === null || trip.baseAmount === undefined
        ? null
        : Number(trip.baseAmount),
    perKmRate:
      trip.perKmRate === null || trip.perKmRate === undefined
        ? null
        : Number(trip.perKmRate),
    customer: trip.customer || undefined,
  }

  return <TripDetails trip={tripDetails} />
}
