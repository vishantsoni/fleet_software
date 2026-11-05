import { VehicleDocumentForm } from '@/app/vehicles/_components/vehicle-document-form'

interface NewVehicleDocumentPageProps {
  params: Promise<{ id: string }>
}

export default async function NewVehicleDocumentPage({ params }: NewVehicleDocumentPageProps) {
  const { id } = await params
  return <VehicleDocumentForm vehicleId={id} />
}
