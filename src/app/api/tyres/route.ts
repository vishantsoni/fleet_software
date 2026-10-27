import { NextRequest, NextResponse } from 'next/server'
import { fitTyre, listTyres } from '@/server/actions/tyres'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const vehicleId = searchParams.get('vehicleId') || undefined
    const status = searchParams.get('status') || undefined
    const brand = searchParams.get('brand') || undefined

    const result = await listTyres({ page, limit, vehicleId, status, brand })
    return NextResponse.json(result)
  } catch (error) {
    console.error('Failed to fetch tyres:', error)
    return NextResponse.json({ error: 'Failed to fetch tyres' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const tyre = await fitTyre(body)
    return NextResponse.json(tyre)
  } catch (error) {
    console.error('Failed to create tyre:', error)
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to create tyre' }, { status: 500 })
  }
}