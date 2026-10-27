'use server'

import { DriverService } from '@/server/services/driver.service'
import { UpdateDocumentSchema } from '@/types/driver'
import { calculateDaysToExpiry, calculateAlertStatus } from '@/server/utils/calculations'

export async function updateDriverDocumentAction(input: unknown & { id: string }) {
  try {
    const validated = UpdateDocumentSchema.parse(input)
    const { id, ...data } = validated

    let updateData = { ...data }
    if (data.expiryDate) {
      const daysToExpiry = calculateDaysToExpiry(data.expiryDate)
      const alertStatus = calculateAlertStatus(daysToExpiry)
      updateData = { ...updateData, daysToExpiry, alertStatus }
    }

    const document = await DriverService.updateDocument(id, updateData)
    return { success: true, data: document }
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: 'An unknown error occurred' }
  }
}