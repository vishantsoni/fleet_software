'use server'

import { VehicleService } from '@/server/services/vehicle.service'

export async function deleteVehicleAction(id: string) {
  try {
    await VehicleService.delete(id)
    return { success: true }
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: 'An unknown error occurred' }
  }
}