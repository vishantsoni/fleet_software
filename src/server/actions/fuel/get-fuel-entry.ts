'use server'

import { FuelService } from '@/server/services/fuel.service'

export async function getFuelEntryAction(id: string) {
  try {
    if (!id) {
      return { success: false, error: 'Fuel entry ID is required' }
    }

    const entry = await FuelService.findById(id)

    if (!entry) {
      return { success: false, error: 'Fuel entry not found' }
    }

    return { success: true, data: entry }
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: 'An unknown error occurred' }
  }
}