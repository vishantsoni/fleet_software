import prisma from '@/lib/prisma'
import {
  createVehicleDocument,
  createDriverDocument,
  updateDocument,
  renewDocument,
  listVehicleDocuments,
  listDriverDocuments,
  getExpiryAlerts,
  recalculateAlerts,
} from '@/server/actions/compliance'

export class ComplianceService {
  static async createVehicleDocument(
    vehicleId: string,
    data: Parameters<typeof createVehicleDocument>[1]
  ) {
    return createVehicleDocument(vehicleId, data)
  }

  static async createDriverDocument(
    driverId: string,
    data: Parameters<typeof createDriverDocument>[1]
  ) {
    return createDriverDocument(driverId, data)
  }

  static async updateDocument(
    id: string,
    entityType: 'VEHICLE' | 'DRIVER',
    data: Parameters<typeof updateDocument>[2]
  ) {
    return updateDocument(id, entityType, data)
  }

  static async renewDocument(
    id: string,
    entityType: 'VEHICLE' | 'DRIVER',
    newExpiryDate: Date
  ) {
    return renewDocument(id, entityType, newExpiryDate)
  }

  static async findVehicleDocuments(filters: Parameters<typeof listVehicleDocuments>[0]) {
    return listVehicleDocuments(filters)
  }

  static async findDriverDocuments(filters: Parameters<typeof listDriverDocuments>[0]) {
    return listDriverDocuments(filters)
  }

  static async getExpiryAlerts() {
    return getExpiryAlerts()
  }

  static async recalculateAlerts() {
    return recalculateAlerts()
  }
}
