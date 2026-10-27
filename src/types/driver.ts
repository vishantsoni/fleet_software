import { z } from 'zod'

export const CreateDriverSchema = z.object({
  fullName: z.string().min(1, 'Full name is required').max(100),
  licenseNumber: z.string().min(1, 'License number is required').max(50),
  licenseExpiry: z.coerce.date(),
  phone: z.string().max(20).optional().nullable(),
  address: z.string().max(500).optional().nullable(),
  baseSalary: z.coerce.number().nonnegative('Base salary must be 0 or greater').default(0),
  aadharNumber: z.string().max(20).optional().nullable(),
})

export type CreateDriverInput = z.infer<typeof CreateDriverSchema>

export const UpdateDriverSchema = CreateDriverSchema.partial()

export type UpdateDriverInput = z.infer<typeof UpdateDriverSchema> & { id: string }

export const DocumentType = z.enum([
  'INSURANCE',
  'FITNESS',
  'ROAD_TAX',
  'NATIONAL_PERMIT',
  'POLLUTION_CERTIFICATE',
  'DRIVER_LICENSE',
  'VEHICLE_REGISTRATION',
])

export const AlertStatus = z.enum(['GREEN', 'AMBER', 'RED'])

export const CreateDocumentSchema = z.object({
  driverId: z.string(),
  documentType: DocumentType,
  documentNumber: z.string().max(100).optional().nullable(),
  issueDate: z.coerce.date(),
  expiryDate: z.coerce.date(),
  renewalCost: z.coerce.number().nonnegative().default(0),
  fileUrl: z.string().url().optional().nullable(),
})

export type CreateDriverDocumentInput = z.infer<typeof CreateDocumentSchema>

export const UpdateDocumentSchema = CreateDocumentSchema.partial()

export type UpdateDriverDocumentInput = z.infer<typeof UpdateDocumentSchema> & { id: string }

export type Driver = {
  id: string
  fullName: string
  licenseNumber: string
  licenseExpiry: Date
  phone: string | null
  address: string | null
  baseSalary: number
  aadharNumber: string | null
  status: string
  createdAt: Date
  updatedAt: Date
}

export type DriverWithRelations = Driver & {
  trips: {
    id: string
    tripDate: Date
    vehicleId: string
    driverId: string
    customerId: string | null
    origin: string
    destination: string
    totalKm: number
    freightAmount: number
    revenue: number
    status: string
    notes: string | null
    createdById: string | null
    createdAt: Date
    updatedAt: Date
  }[]
  driverDocuments: {
    id: string
    driverId: string
    documentType: string
    documentNumber: string | null
    issueDate: Date
    expiryDate: Date
    renewalCost: number
    alertStatus: 'GREEN' | 'AMBER' | 'RED'
    daysToExpiry: number | null
    fileUrl: string | null
    createdAt: Date
    updatedAt: Date
  }[]
}

export type DriverDocument = {
  id: string
  driverId: string
  documentType: string
  documentNumber: string | null
  issueDate: Date
  expiryDate: Date
  renewalCost: number
  alertStatus: 'GREEN' | 'AMBER' | 'RED'
  daysToExpiry: number | null
  fileUrl: string | null
  createdAt: Date
  updatedAt: Date
}