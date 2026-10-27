'use server'

import { DriverService } from '@/server/services/driver.service'

export async function listDriversAction(
  page = 1,
  limit = 10,
  search?: string,
  status?: string
) {
  try {
    const result = await DriverService.search(page, limit, search, status)
    return { success: true, ...result }
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: 'An unknown error occurred' }
  }
}