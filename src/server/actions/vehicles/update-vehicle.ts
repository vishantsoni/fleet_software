'use server'

import { VehicleService } from '@/server/services/vehicle.service'
import { createVehicleSchema } from '@/types/vehicle'

export async function updateVehicleAction(input: unknown & { id: string }) {
  try {
    const validated = createVehicleSchema.partial().parse(input)
    const { id, ...data } = validated
    const vehicle = await VehicleService.update(id, data as { vehicleNo: string })
    return { success: true, data: vehicle }
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: 'An unknown error occurred' }
  }
}