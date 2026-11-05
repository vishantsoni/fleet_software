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
  'GPS_PAPER',
  'CYLINDER',
  'SPEED',
  'FIVE_YEAR_PERMIT',
  'POLLUTION_CERTIFICATE',
  'DRIVER_LICENSE',
  'VEHICLE_REGISTRATION',
  'OTHER',
])

export const AlertStatus = z.enum(['GREEN', 'AMBER', 'RED'])

const DocumentSchema = z.object({
  driverId: z.string(),
  documentType: DocumentType,
  customType: z.string().trim().max(100).optional().nullable(),
  documentNumber: z.string().max(100).optional().nullable(),
  issueDate: z.coerce.date(),
  expiryDate: z.coerce.date(),
  renewalCost: z.coerce.number().nonnegative().default(0),
  fileUrl: z
    .string()
    .max(2048)
    .refine((value) => {
      if (/^\/api\/vehicle-documents\/[a-f0-9-]+\.(pdf|jpg|png|webp)$/i.test(value)) {
        return true
      }

      try {
        return ['http:', 'https:'].includes(new URL(value).protocol)
      } catch {
        return false
      }
    }, 'Enter a valid document URL')
    .optional()
    .nullable(),
})

export const CreateDocumentSchema = DocumentSchema.superRefine((document, context) => {
  if (document.documentType === 'OTHER' && !document.customType?.trim()) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['customType'],
      message: 'Please enter the document type',
    })
  }
})

export type CreateDriverDocumentInput = z.infer<typeof CreateDocumentSchema>

export const UpdateDocumentSchema = DocumentSchema.partial()
  .extend({ id: z.string().min(1) })
  .superRefine((document, context) => {
    if (document.documentType === 'OTHER' && !document.customType?.trim()) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['customType'],
        message: 'Please enter the document type',
      })
    }
  })

export type UpdateDriverDocumentInput = z.infer<typeof UpdateDocumentSchema>

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
    customType: string | null
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
  customType: string | null
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