import { NextRequest, NextResponse } from 'next/server'
import { getExpiryAlerts } from '@/server/actions/compliance'

export async function GET(request: NextRequest) {
  try {
    const alerts = await getExpiryAlerts()
    return NextResponse.json({ alerts })
  } catch (error) {
    console.error('Compliance alerts GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch compliance alerts' }, { status: 500 })
  }
}