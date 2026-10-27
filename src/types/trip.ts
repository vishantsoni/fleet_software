export interface Trip {
  id: string
  tripType: 'POINT_TO_POINT' | 'PACKAGE'
  tripDate: Date
  vehicleId: string
  driverId: string
  customerId?: string
  origin: string
  destination: string
  totalKm: number
  freightAmount: number
  revenue: number
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
  notes?: string
  createdById?: string
  createdAt: Date
  updatedAt: Date

  // Package fields
  rentalDays?: number
  includedKm?: number
  baseAmount?: number
  perKmRate?: number
  startOdometer?: number
  endOdometer?: number
  startDateTime?: Date
  endDateTime?: Date
}

export interface CreateTripInput {
  tripType?: 'POINT_TO_POINT' | 'PACKAGE'
  tripDate: Date
  vehicleId: string
  driverId: string
  customerId?: string
  origin: string
  destination: string
  totalKm: number
  freightAmount?: number
  revenue?: number
  // Package fields
  rentalDays?: number
  includedKm?: number
  baseAmount?: number
  perKmRate?: number
  startOdometer?: number
  endOdometer?: number
  startDateTime?: Date
  endDateTime?: Date
  notes?: string
}

export interface UpdateTripInput extends Partial<CreateTripInput> {
  id: string
}

export interface TripWithRelations extends Trip {
  vehicle: {
    id: string
    vehicleNo: string
    makeModel: string
  }
  driver: {
    id: string
    fullName: string
  }
  customer?: {
    id: string
    name: string
  }
}
