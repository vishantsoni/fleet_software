'use server'

import { DriverService } from '@/server/services/driver.service'

export async function deleteDriverAction(id: string) {
  try {
    await DriverService.delete(id)
    return { success: true }
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: 'An unknown error occurred' }
  }
}