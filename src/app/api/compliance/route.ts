import { NextRequest, NextResponse } from 'next/server'
import {
  listVehicleDocuments,
  listDriverDocuments,
  getExpiryAlerts,
  createVehicleDocument,
  createDriverDocument,
  updateDocument,
  renewDocument,
  recalculateAlerts,
} from '@/server/actions/compliance'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const type = searchParams.get('type') || 'alerts'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const vehicleId = searchParams.get('vehicleId') || undefined
    const driverId = searchParams.get('driverId') || undefined
    const documentType = searchParams.get('documentType') || undefined
    const alertStatus = searchParams.get('alertStatus') || undefined

    switch (type) {
      case 'vehicle-documents': {
        const result = await listVehicleDocuments({
          vehicleId,
          documentType,
          alertStatus,
          page,
          limit,
        })
        return NextResponse.json(result)
      }
      case 'driver-documents': {
        const result = await listDriverDocuments({
          driverId,
          documentType,
          alertStatus,
          page,
          limit,
        })
        return NextResponse.json(result)
      }
      case 'alerts':
      default: {
        const alerts = await getExpiryAlerts()
        return NextResponse.json({ alerts })
      }
    }
  } catch (error) {
    console.error('Compliance GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch compliance data' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, ...data } = body

    switch (action) {
      case 'create-vehicle-document': {
        const document = await createVehicleDocument(data.vehicleId, data)
        return NextResponse.json(document)
      }
      case 'create-driver-document': {
        const document = await createDriverDocument(data.driverId, data)
        return NextResponse.json(document)
      }
      case 'update-document': {
        const document = await updateDocument(data.id, data.entityType, data)
        return NextResponse.json(document)
      }
      case 'renew-document': {
        const document = await renewDocument(data.id, data.entityType, new Date(data.newExpiryDate))
        return NextResponse.json(document)
      }
      case 'recalculate-alerts': {
        const result = await recalculateAlerts()
        return NextResponse.json(result)
      }
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Compliance POST error:', error)
    return NextResponse.json({ error: 'Failed to process compliance request' }, { status: 500 })
  }
}