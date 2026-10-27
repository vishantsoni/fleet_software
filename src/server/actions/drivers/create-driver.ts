'use server'

import { DriverService } from '@/server/services/driver.service'
import { CreateDriverSchema } from '@/types/driver'

export async function createDriverAction(input: unknown) {
  try {
    const validated = CreateDriverSchema.parse(input)
    const driver = await DriverService.create(validated)
    return { success: true, data: driver }
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: 'An unknown error occurred' }
  }
}