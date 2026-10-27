'use server'

import { DriverService } from '@/server/services/driver.service'

export async function getDriverAction(id: string) {
  try {
    const driver = await DriverService.findById(id)
    if (!driver) {
      return { success: false, error: 'Driver not found' }
    }
    return { success: true, data: driver }
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: 'An unknown error occurred' }
  }
}