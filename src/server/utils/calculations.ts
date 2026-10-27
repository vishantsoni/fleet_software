export function calculateKmSinceLastFill(
  currentOdometer: number,
  previousOdometer: number
): number {
  return Math.max(0, currentOdometer - previousOdometer)
}

export function calculateFuelEconomy(
  kmSinceLastFill: number,
  litres: number
): number | null {
  if (litres <= 0) return null
  return kmSinceLastFill / litres
}

export function calculateTyreCostPerKm(
  purchaseCost: number,
  fittedOdometer: number,
  removalOdometer: number | null
): number | null {
  if (removalOdometer === null || removalOdometer <= fittedOdometer) return null
  const kmRun = removalOdometer - fittedOdometer
  if (kmRun <= 0) return null
  return purchaseCost / kmRun
}

export function calculateTotalCost(
  partsCost: number,
  labourCost: number
): number {
  return partsCost + labourCost
}

export function calculateDaysToExpiry(expiryDate: Date): number {
  const now = new Date()
  const expiry = new Date(expiryDate)
  const diffTime = expiry.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
}

export function calculateAlertStatus(daysToExpiry: number): 'GREEN' | 'AMBER' | 'RED' {
  if (daysToExpiry < 0) return 'RED'
  if (daysToExpiry <= 30) return 'AMBER'
  return 'GREEN'
}

export function calculatePnL(
  revenue: number,
  fuelCost: number,
  maintenanceCost: number,
  tyreCost: number,
  overheads: number
): {
  netProfit: number
  profitMargin: number
  totalCost: number
} {
  const totalCost = fuelCost + maintenanceCost + tyreCost + overheads
  const netProfit = revenue - totalCost
  const profitMargin = revenue > 0 ? (netProfit / revenue) * 100 : 0

  return {
    netProfit,
    profitMargin,
    totalCost,
  }
}

export function calculateCPK(totalCost: number, totalKm: number): number | null {
  if (totalKm <= 0) return null
  return totalCost / totalKm
}

export function calculateRPK(revenue: number, totalKm: number): number | null {
  if (totalKm <= 0) return null
  return revenue / totalKm
}
