import prisma from '@/lib/prisma'
import { listTrips } from '@/server/actions/trips/list-trips'
import { getTrip } from '@/server/actions/trips/get-trip'
import { createTrip } from '@/server/actions/trips/create-trip'
import { updateTrip } from '@/server/actions/trips/update-trip'
import { updateTripStatus } from '@/server/actions/trips/update-trip-status'
import { completeTrip } from '@/server/actions/trips/complete-trip'

export class TripService {
  static async findAll(filters: Parameters<typeof listTrips>[0]) {
    return listTrips(filters)
  }

  static async findById(id: string) {
    return getTrip(id)
  }

  static async create(data: Parameters<typeof createTrip>[0]) {
    return createTrip(data)
  }

  static async update(id: string, data: Parameters<typeof updateTrip>[1]) {
    return updateTrip(id, data)
  }

  static async updateStatus(id: string, status: Parameters<typeof updateTripStatus>[1]) {
    return updateTripStatus(id, status)
  }

  static async complete(id: string) {
    return completeTrip(id)
  }
}
