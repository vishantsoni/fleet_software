import { NextRequest, NextResponse } from 'next/server'
import {
  getFleetPnL,
  getVehiclePnL,
  getKPIs,
  getRevenueByPeriod,
} from '@/server/actions/analytics'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type = 'kpis', vehicleId, workshopId, period = 'month', startDate, endDate } = body

    switch (type) {
      case 'fleet-pnl': {
        const result = await getFleetPnL(new Date(startDate), new Date(endDate))
        return NextResponse.json(result)
      }
      case 'vehicle-pnl': {
        if (!vehicleId) {
          return NextResponse.json({ error: 'vehicleId required' }, { status: 400 })
        }
        const result = await getVehiclePnL(vehicleId, startDate ? new Date(startDate) : new Date(0), endDate ? new Date(endDate) : new Date())
        return NextResponse.json(result)
      }
      case 'revenue-by-period': {
        const result = await getRevenueByPeriod(startDate ? new Date(startDate) : new Date(0), endDate ? new Date(endDate) : new Date())
        return NextResponse.json(result)
      }
      case 'kpis':
      default: {
        const result = await getKPIs({ workshopId })
        return NextResponse.json(result)
      }
    }
  } catch (error) {
    console.error('Analytics POST error:', error)
    return NextResponse.json({ error: 'Failed to fetch analytics data' }, { status: 500 })
  }
}