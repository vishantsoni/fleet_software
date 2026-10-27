import { z } from 'zod'

// Helper for dynamic "not in future" date check
const isNotInFuture = (d: Date) => {
  // Allow any timestamp up to the end of the current day
  const endOfToday = new Date()
  endOfToday.setHours(23, 59, 59, 999)
  return d <= endOfToday
}

export const VehicleSchema = z.object({
  vehicleNo: z.string().min(3).max(50).regex(/^[A-Z0-9-]+$/),
  registrationDate: z.coerce
    .date()
    .refine(isNotInFuture, { message: 'Registration date cannot be in the future' }),
  makeModel: z.string().min(1).max(100),
  year: z
    .number()
    .int()
    .min(1900)
    .refine((y) => y <= new Date().getFullYear() + 1, {
      message: 'Year cannot be more than 1 year in the future',
    }),
  capacityTonnage: z.number().nonnegative().multipleOf(0.01),
  ownerType: z.enum(['OWNED', 'MARKET']),
  engineRef: z.string().max(100).optional().nullable(),
  chassisRef: z.string().max(100).optional().nullable(),
  currentOdometer: z.number().int().nonnegative(),
})

export const CreateVehicleSchema = VehicleSchema.omit({ currentOdometer: true })
export const UpdateVehicleSchema = VehicleSchema.partial()

export const DriverSchema = z.object({
  fullName: z.string().min(1).max(100),
  licenseNumber: z.string().min(1).max(50),
  licenseExpiry: z.coerce.date(),
  phone: z.string().max(20).optional().nullable(),
  address: z.string().max(500).optional().nullable(),
  baseSalary: z.number().nonnegative().default(0),
  aadharNumber: z.string().max(20).optional().nullable(),
})

export const CreateDriverSchema = DriverSchema
export const UpdateDriverSchema = DriverSchema.partial()

export const TripSchema = z.object({
  tripType: z.enum(['POINT_TO_POINT', 'PACKAGE']).default('POINT_TO_POINT'),
  tripDate: z.coerce
    .date()
    .refine(isNotInFuture, { message: 'Trip date cannot be in the future' }),
  vehicleId: z.string(),
  driverId: z.string(),
  customerId: z.string().optional().nullable(),
  origin: z.string().min(1).max(200),
  destination: z.string().min(1).max(200),
  totalKm: z.number().nonnegative().multipleOf(0.01),
  freightAmount: z.number().nonnegative().default(0),
  revenue: z.number().nonnegative().default(0),
  // Package fields
  rentalDays: z.number().int().nonnegative().optional().nullable(),
  includedKm: z.number().nonnegative().multipleOf(0.01).optional().nullable(),
  baseAmount: z.number().nonnegative().multipleOf(0.01).optional().nullable(),
  perKmRate: z.number().nonnegative().multipleOf(0.01).optional().nullable(),
  startOdometer: z.number().int().nonnegative().optional().nullable(),
  endOdometer: z.number().int().nonnegative().optional().nullable(),
  startDateTime: z.coerce.date().optional().nullable(),
  endDateTime: z.coerce.date().optional().nullable(),
  notes: z.string().max(1000).optional().nullable(),
})

export const CreateTripSchema = TripSchema
export const UpdateTripSchema = TripSchema.partial()

export const FuelEntrySchema = z.object({
  entryDate: z.coerce
    .date()
    .refine(isNotInFuture, { message: 'Entry date cannot be in the future' }),
  vehicleId: z.string(),
  station: z.string().min(1).max(200),
  fuelType: z.enum(['DIESEL', 'PETROL', 'CNG', 'ELECTRIC']),
  litres: z.number().positive().multipleOf(0.01),
  ratePerLitre: z.number().positive().multipleOf(0.01),
  totalAmount: z.number().nonnegative().optional(),
  odometerReading: z.number().int().nonnegative(),
})

export const CreateFuelEntrySchema = FuelEntrySchema
export const UpdateFuelEntrySchema = FuelEntrySchema.partial()

export const MaintenanceJobSchema = z.object({
  jobDate: z.coerce
    .date()
    .refine(isNotInFuture, { message: 'Job date cannot be in the future' }),
  vehicleId: z.string(),
  odometerAtService: z.number().int().nonnegative(),
  jobType: z.enum(['PREVENTATIVE', 'BREAKDOWN']),
  workshopId: z.string().optional().nullable(),
  partsCost: z.number().nonnegative().default(0),
  labourCost: z.number().nonnegative().default(0),
  totalCost: z.number().nonnegative().optional(),
  description: z.string().max(1000).optional().nullable(),
})

export const CreateMaintenanceJobSchema = MaintenanceJobSchema
export const UpdateMaintenanceJobSchema = MaintenanceJobSchema.partial()

export const TyreSchema = z.object({
  vehicleId: z.string(),
  axlePosition: z.string().min(1).max(50),
  brand: z.string().min(1).max(100),
  size: z.string().min(1).max(50),
  purchaseDate: z.coerce
    .date()
    .refine(isNotInFuture, { message: 'Purchase date cannot be in the future' }),
  purchaseCost: z.number().positive().multipleOf(0.01),
  fittedOdometer: z.number().int().nonnegative(),
  removalOdometer: z.number().int().nonnegative().optional().nullable(),
  status: z.enum(['FITTED', 'REMOVED', 'SCRAPPED']).default('FITTED'),
})

export const CreateTyreSchema = TyreSchema
export const UpdateTyreSchema = TyreSchema.partial()

export const DocumentSchema = z.object({
  documentType: z.enum([
    'INSURANCE',
    'FITNESS',
    'ROAD_TAX',
    'NATIONAL_PERMIT',
    'POLLUTION_CERTIFICATE',
    'DRIVER_LICENSE',
    'VEHICLE_REGISTRATION',
  ]),
  documentNumber: z.string().max(100).optional().nullable(),
  issueDate: z.coerce.date(),
  expiryDate: z.coerce.date(),
  renewalCost: z.number().nonnegative().default(0),
})

export const CreateDocumentSchema = DocumentSchema
export const UpdateDocumentSchema = DocumentSchema.partial()