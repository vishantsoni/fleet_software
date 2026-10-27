export interface FuelEntry {
  id: string
  entryDate: Date
  vehicleId: string
  station: string
  fuelType: 'DIESEL' | 'PETROL' | 'CNG' | 'ELECTRIC'
  litres: number
  ratePerLitre: number
  totalAmount: number
  odometerReading: number
  kmSinceLastFill: number
  fuelEconomy?: number
  createdById?: string
  createdAt: Date
  updatedAt: Date
}

export interface CreateFuelEntryInput {
  entryDate: Date
  vehicleId: string
  station: string
  fuelType: 'DIESEL' | 'PETROL' | 'CNG' | 'ELECTRIC'
  litres: number
  ratePerLitre: number
  totalAmount?: number
  odometerReading: number
}

export interface UpdateFuelEntryInput extends Partial<CreateFuelEntryInput> {
  id: string
}

export interface FuelEntryFilters {
  vehicleId?: string
  fuelType?: 'DIESEL' | 'PETROL' | 'CNG' | 'ELECTRIC'
  dateFrom?: Date
  dateTo?: Date
}

export interface PaginatedFuelEntries {
  entries: FuelEntry[]
  total: number
  page: number
  limit: number
}