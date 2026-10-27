'use server'

import { FuelService } from '@/server/services/fuel.service'
import { CreateFuelEntrySchema } from '@/server/utils/validators'

export async function createFuelEntryAction(input: unknown) {
  try {
    const validated = CreateFuelEntrySchema.parse(input)
    const entry = await FuelService.create({
      ...validated,
      litres: Number(validated.litres),
      ratePerLitre: Number(validated.ratePerLitre),
      totalAmount: validated.totalAmount ? Number(validated.totalAmount) : undefined,
      odometerReading: validated.odometerReading,
    })
    return { success: true, data: entry }
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: 'An unknown error occurred' }
  }
}