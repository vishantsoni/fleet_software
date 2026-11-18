'use server'

import { DriverService } from '@/server/services/driver.service'
import { UpdateDriverSchema, type UpdateDriverInput } from '@/types/driver'

export async function updateDriverAction(input: UpdateDriverInput) {
  try {
    const validated = UpdateDriverSchema.parse(input)
    const { id, ...data } = validated
    const driver = await DriverService.update(id, data)
    return { success: true, data: driver }
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: 'An unknown error occurred' }
  }
}