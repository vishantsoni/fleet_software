import prisma from '@/lib/prisma'
import {
  getFleetPnL,
  getVehiclePnL,
  getKPIs,
  getRevenueByPeriod,
} from '@/server/actions/analytics'
import {
  calculatePnL,
  calculateCPK,
  calculateRPK,
} from '@/server/utils/calculations'

export class AnalyticsService {
  static async getFleetPnL(startDate: Date, endDate: Date) {
    return getFleetPnL(startDate, endDate)
  }

  static async getVehiclePnL(vehicleId: string, startDate: Date, endDate: Date) {
    return getVehiclePnL(vehicleId, startDate, endDate)
  }

  static async getKPIs() {
    return getKPIs()
  }

  static async getRevenueByPeriod(startDate: Date, endDate: Date) {
    return getRevenueByPeriod(startDate, endDate)
  }

  static async getTopVehiclesByRevenue(startDate: Date, endDate: Date) {
    const data = await getFleetPnL(startDate, endDate)
    return data.vehicles
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, 10)
  }

  static async getTopVehiclesByCost(startDate: Date, endDate: Date) {
    const data = await getFleetPnL(startDate, endDate)
    return data.vehicles
      .sort((a, b) => b.totalCost - a.totalCost)
      .slice(0, 10)
  }
}
