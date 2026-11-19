export interface Trip {
  id: string
  tripType: 'POINT_TO_POINT' | 'PACKAGE'
  tripDate: Date
  vehicleId: string
  driverId: string
  bankAccountId?: string | null
  customerId?: string | null
  partyName?: string | null
  podStatus: 'PENDING' | 'SENT' | 'RECEIVED'
  socketNo?: string | null
  origin: string
  destination: string
  totalKm: number
  freightAmount: number
  revenue: number
  advance: number
  commissionDeduct: number
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
  narration?: string | null
  notes?: string | null
  createdById?: string | null
  createdAt: Date
  updatedAt: Date

  // Package fields
  rentalDays?: number | null
  includedKm?: number | null
  baseAmount?: number | null
  perKmRate?: number | null
  startOdometer?: number | null
  endOdometer?: number | null
  startDateTime?: Date | null
  endDateTime?: Date | null
}

export interface CreateTripInput {
  tripType?: 'POINT_TO_POINT' | 'PACKAGE'
  tripDate: Date
  vehicleId: string
  driverId: string
  bankAccountId?: string | null
  customerId?: string
  partyName?: string
  podStatus?: 'PENDING' | 'SENT' | 'RECEIVED'
  socketNo?: string
  origin: string
  destination: string
  totalKm: number
  freightAmount?: number
  revenue?: number
  narration?: string | null
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
    licenseNumber?: string
    phone?: string | null
  }
  customer?: {
    id: string
    name: string
  }
  bankAccount?: {
    id: string
    bankName: string
    accountNumber: string
  } | null
}
