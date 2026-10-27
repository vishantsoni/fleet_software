import { z } from 'zod'

export const WorkshopSchema = z.object({
  name: z.string().min(1, 'Workshop name is required').max(100),
  address: z.string().max(500).optional().nullable(),
  phone: z.string().max(20).optional().nullable(),
  contactPerson: z.string().max(100).optional().nullable(),
  email: z.string().email('Invalid email').optional().nullable(),
})

export type CreateWorkshopInput = z.infer<typeof WorkshopSchema>

export type Workshop = {
  id: string
  name: string
  address: string | null
  phone: string | null
  contactPerson: string | null
  email: string | null
  createdAt: Date
  updatedAt: Date
}

export type WorkshopOption = {
  id: string
  name: string
}