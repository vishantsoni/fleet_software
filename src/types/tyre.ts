export interface Tyre {
  id: string
  vehicleId: string
  axlePosition: string
  brand: string
  size: string
  purchaseDate: Date
  purchaseCost: number
  fittedOdometer: number
  removalOdometer?: number
  costPerKm?: number
  status: 'FITTED' | 'REMOVED' | 'SCRAPPED'
  createdAt: Date
  updatedAt: Date
  vehicle?: {
    id: string
    vehicleNo: string
    makeModel: string
  }
}

export interface CreateTyreInput {
  vehicleId: string
  axlePosition: string
  brand: string
  size: string
  purchaseDate: Date
  purchaseCost: number
  fittedOdometer: number
  removalOdometer?: number
  status?: 'FITTED' | 'REMOVED' | 'SCRAPPED'
}

export interface UpdateTyreInput extends Partial<CreateTyreInput> {
  id: string
}
