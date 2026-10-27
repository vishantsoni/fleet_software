'use server'

import { FuelService } from '@/server/services/fuel.service'
import { UpdateFuelEntrySchema } from '@/server/utils/validators'

export async function updateFuelEntryAction(input: unknown) {
  try {
    const validated = UpdateFuelEntrySchema.parse(input)
    const { id, ...data } = validated

    if (!id) {
      return { success: false, error: 'Fuel entry ID is required' }
    }

    const entry = await FuelService.update(id, {
      ...data,
      litres: data.litres !== undefined ? Number(data.litres) : undefined,
      ratePerLitre: data.ratePerLitre !== undefined ? Number(data.ratePerLitre) : undefined,
      totalAmount: data.totalAmount !== undefined ? Number(data.totalAmount) : undefined,
      odometerReading: data.odometerReading,
    })

    return { success: true, data: entry }
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: 'An unknown error occurred' }
  }
}