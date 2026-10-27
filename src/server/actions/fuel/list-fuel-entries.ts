'use server'

import { FuelService } from '@/server/services/fuel.service'

export async function listFuelEntriesAction(
  page = 1,
  limit = 10,
  filters: {
    vehicleId?: string
    fuelType?: 'DIESEL' | 'PETROL' | 'CNG' | 'ELECTRIC'
    dateFrom?: string
    dateTo?: string
  } = {}
) {
  try {
    const result = await FuelService.search(page, limit, {
      vehicleId: filters.vehicleId,
      fuelType: filters.fuelType,
      dateFrom: filters.dateFrom ? new Date(filters.dateFrom) : undefined,
      dateTo: filters.dateTo ? new Date(filters.dateTo) : undefined,
    })

    return {
      success: true,
      entries: result.entries,
      total: result.total,
      page,
      limit,
    }
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: 'An unknown error occurred' }
  }
}