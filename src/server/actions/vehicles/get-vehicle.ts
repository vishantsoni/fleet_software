'use server'

import { VehicleService } from '@/server/services/vehicle.service'

export async function getVehicleAction(id: string) {
  try {
    const vehicle = await VehicleService.findById(id)
    if (!vehicle) {
      return { success: false, error: 'Vehicle not found' }
    }
    return { success: true, data: vehicle }
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: 'An unknown error occurred' }
  }
}