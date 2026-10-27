'use server'

import { WorkshopService } from '@/server/services/workshop.service'
import { WorkshopSchema } from '@/types/workshop'

export async function createWorkshopAction(input: unknown) {
  try {
    const validated = WorkshopSchema.parse(input)
    const workshop = await WorkshopService.create(validated)
    return { success: true, data: workshop }
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: 'An unknown error occurred' }
  }
}