'use server'

import { DriverService } from '@/server/services/driver.service'
import { CreateDocumentSchema } from '@/types/driver'
import { calculateDaysToExpiry, calculateAlertStatus } from '@/server/utils/calculations'

export async function createDriverDocumentAction(input: unknown) {
  try {
    const validated = CreateDocumentSchema.parse(input)
    const daysToExpiry = calculateDaysToExpiry(validated.expiryDate)
    const alertStatus = calculateAlertStatus(daysToExpiry)

    const document = await DriverService.createDocument({
      ...validated,
      daysToExpiry,
      alertStatus,
    })
    return { success: true, data: document }
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: 'An unknown error occurred' }
  }
}