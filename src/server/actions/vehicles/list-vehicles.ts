'use server'

import { VehicleService } from '@/server/services/vehicle.service'

export async function listVehiclesAction(page = 1, limit = 10, search?: string, ownerType?: string, status?: string) {
  try {
    const result = await VehicleService.search(page, limit, search, ownerType, status)
    return { success: true, ...result }
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: 'An unknown error occurred' }
  }
}