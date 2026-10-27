import { NextRequest, NextResponse } from 'next/server'
import { fitBattery, listBatteries } from '@/server/actions/batteries'

export async function GET(request: NextRequest) {
  try {
    const sp = request.nextUrl.searchParams
    const page = parseInt(sp.get('page') || '1')
    const limit = parseInt(sp.get('limit') || '20')
    const vehicleId = sp.get('vehicleId') || undefined
    const status = sp.get('status') || undefined
    const brand = sp.get('brand') || undefined
    const result = await listBatteries({ page, limit, vehicleId, status, brand })
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch batteries' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const battery = await fitBattery(body)
    return NextResponse.json(battery)
  } catch (error) {
    if (error instanceof Error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ error: 'Failed to create battery' }, { status: 500 })
  }
}
