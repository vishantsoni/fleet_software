import { NextRequest, NextResponse } from 'next/server'
import { getBattery, updateBattery } from '@/server/actions/batteries'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const battery = await getBattery(id)
    return NextResponse.json(battery)
  } catch (error) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const body = await request.json()
    const battery = await updateBattery(id, body)
    return NextResponse.json(battery)
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'P2025') {
      return NextResponse.json({ error: 'Battery not found' }, { status: 404 })
    }
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    console.error('Failed to update battery:', error)
    return NextResponse.json({ error: 'Failed to update battery' }, { status: 500 })
  }
}
