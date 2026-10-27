'use server'

import { FuelService } from '@/server/services/fuel.service'

export async function deleteFuelEntryAction(id: string) {
  try {
    if (!id) {
      return { success: false, error: 'Fuel entry ID is required' }
    }

    await FuelService.delete(id)
    return { success: true }
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: 'An unknown error occurred' }
  }
}