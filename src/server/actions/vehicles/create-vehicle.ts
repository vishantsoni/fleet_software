'use server'

import { VehicleService } from '@/server/services/vehicle.service'
import { createVehicleSchema } from '@/types/vehicle'

export async function createVehicleAction(input: unknown) {
  try {
    const validated = createVehicleSchema.parse(input)
    const vehicle = await VehicleService.create(validated)
    return { success: true, data: vehicle }
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: 'An unknown error occurred' }
  }
}