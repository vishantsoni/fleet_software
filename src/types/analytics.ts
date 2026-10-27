export interface PnLData {
  vehicleId?: string
  vehicleNo?: string
  period: {
    start: Date
    end: Date
  }
  totalRevenue: number
  fuelCost: number
  maintenanceCost: number
  tyreCost: number
  overheads: number
  totalCost: number
  netProfit: number
  profitMargin: number
  totalKm: number
  cpk: number | null
  rpk: number | null
}

export interface FleetPnL extends PnLData {
  vehicles: PnLData[]
}

export interface KPIs {
  totalRevenue: number
  totalCost: number
  netProfit: number
  totalKm: number
  fleetCpk: number | null
  fleetRpk: number | null
  vehicleCount: number
  activeVehicleCount: number
  activeDriverCount: number
}

export interface RevenueByPeriod {
  date: string
  revenue: number
  cost: number
  profit: number
}
