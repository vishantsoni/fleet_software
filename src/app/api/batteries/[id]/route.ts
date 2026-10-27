import { NextRequest, NextResponse } from 'next/server'
import { getBattery } from '@/server/actions/batteries'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const battery = await getBattery(params.id)
    return NextResponse.json(battery)
  } catch (error) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
}
