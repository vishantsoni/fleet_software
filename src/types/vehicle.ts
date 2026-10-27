import { z } from 'zod'

export const OwnerType = z.enum(['OWNED', 'MARKET'])

export const createVehicleSchema = z.object({
  vehicleNo: z
    .string()
    .min(1, 'Vehicle number is required')
    .regex(/^[A-Z0-9-]+$/, 'Vehicle number must contain only uppercase letters, numbers, and hyphens'),
  registrationDate: z.coerce.date(),
  makeModel: z.string().min(1, 'Make/Model is required'),
  year: z.coerce
    .number()
    .int('Year must be a whole number')
    .min(1900, 'Year must be 1900 or later')
    .max(new Date().getFullYear() + 1, `Year cannot exceed ${new Date().getFullYear() + 1}`),
  capacityTonnage: z.coerce.number().nonnegative('Capacity must be 0 or greater'),
  ownerType: OwnerType.default('OWNED'),
  engineRef: z.string().optional().nullable(),
  chassisRef: z.string().optional().nullable(),
  currentOdometer: z.coerce.number().int().nonnegative('Odometer must be 0 or greater').default(0),
  status: z.string().default('ACTIVE'),
})

export type CreateVehicleInput = z.infer<typeof createVehicleSchema>

export type Vehicle = {
  id: string
  vehicleNo: string
  registrationDate: Date
  makeModel: string
  year: number
  capacityTonnage: number
  ownerType: 'OWNED' | 'MARKET'
  engineRef: string | null
  chassisRef: string | null
  currentOdometer: number
  status: string
  createdAt: Date
  updatedAt: Date
}

export type VehicleWithRelations = Vehicle & {
  trips: {
    id: string
    tripDate: Date
    vehicleId: string
    driverId: string
    customerId?: string
    origin: string
    destination: string
    totalKm: number
    freightAmount: number
    revenue: number
    status: string
    notes?: string
    createdById?: string
    createdAt: Date
    updatedAt: Date
  }[]
  fuelEntries: {
    id: string
    entryDate: Date
    vehicleId: string
    station: string
    fuelType: string
    litres: number
    ratePerLitre: number
    totalAmount: number
    odometerReading: number
    kmSinceLastFill: number
    fuelEconomy?: number
    createdById?: string
    createdAt: Date
    updatedAt: Date
  }[]
  maintenanceJobs: {
    id: string
    jobDate: Date
    vehicleId: string
    odometerAtService: number
    jobType: string
    workshopId?: string
    partsCost: number
    labourCost: number
    totalCost: number
    description?: string
    createdById?: string
    createdAt: Date
    updatedAt: Date
  }[]
  tyres: {
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
    status: string
    createdAt: Date
    updatedAt: Date
  }[]
}
