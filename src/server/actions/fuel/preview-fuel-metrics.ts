'use server'

import { z } from 'zod'
import { FuelService } from '@/server/services/fuel.service'

const FuelMetricsPreviewSchema = z.object({
  vehicleId: z.string().min(1),
  entryDate: z.coerce.date(),
  odometerReading: z.number().int().nonnegative(),
  litres: z.number().positive(),
  entryId: z.string().optional(),
})

export async function previewFuelMetricsAction(input: unknown) {
  try {
    const validated = FuelMetricsPreviewSchema.parse(input)
    const metrics = await FuelService.previewMetrics(validated)
    return { success: true as const, data: metrics }
  } catch (error) {
    if (error instanceof Error) {
      return { success: false as const, error: error.message }
    }
    return { success: false as const, error: 'Could not calculate fuel economy.' }
  }
}
