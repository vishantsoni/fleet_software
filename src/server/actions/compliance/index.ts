'use server'

import { z } from 'zod'
import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { CreateDocumentSchema, UpdateDocumentSchema } from '@/server/utils/validators'
import { calculateDaysToExpiry, calculateAlertStatus } from '@/server/utils/calculations'

export async function createVehicleDocument(
  vehicleId: string,
  input: z.infer<typeof CreateDocumentSchema>
) {
  const validated = CreateDocumentSchema.parse(input)

  const daysToExpiry = calculateDaysToExpiry(validated.expiryDate)
  const alertStatus = calculateAlertStatus(daysToExpiry)

  const document = await prisma.vehicleDocument.create({
    data: {
      ...validated,
      vehicleId,
      daysToExpiry,
      alertStatus,
    },
    include: {
      vehicle: true,
    },
  })

  revalidatePath('/compliance')
  revalidatePath(`/vehicles/${vehicleId}`)

  return document
}

export async function createDriverDocument(
  driverId: string,
  input: z.infer<typeof CreateDocumentSchema>
) {
  const validated = CreateDocumentSchema.parse(input)

  const daysToExpiry = calculateDaysToExpiry(validated.expiryDate)
  const alertStatus = calculateAlertStatus(daysToExpiry)

  const document = await prisma.driverDocument.create({
    data: {
      ...validated,
      driverId,
      daysToExpiry,
      alertStatus,
    },
    include: {
      driver: true,
    },
  })

  revalidatePath('/compliance')
  revalidatePath(`/drivers/${driverId}`)

  return document
}

export async function updateDocument(
  id: string,
  entityType: 'VEHICLE' | 'DRIVER',
  input: z.infer<typeof UpdateDocumentSchema>
) {
  const validated = UpdateDocumentSchema.parse(input)

  const daysToExpiry = calculateDaysToExpiry(validated.expiryDate)
  const alertStatus = calculateAlertStatus(daysToExpiry)

  const data: any = {
    ...validated,
    daysToExpiry,
    alertStatus,
  }

  if (entityType === 'VEHICLE') {
    const document = await prisma.vehicleDocument.update({
      where: { id },
      data,
      include: {
        vehicle: true,
      },
    })

    revalidatePath('/compliance')
    revalidatePath(`/vehicles/${document.vehicleId}`)

    return document
  } else {
    const document = await prisma.driverDocument.update({
      where: { id },
      data,
      include: {
        driver: true,
      },
    })

    revalidatePath('/compliance')
    revalidatePath(`/drivers/${document.driverId}`)

    return document
  }
}

export async function renewDocument(
  id: string,
  entityType: 'VEHICLE' | 'DRIVER',
  newExpiryDate: Date
) {
  const today = new Date()

  const daysToExpiry = calculateDaysToExpiry(newExpiryDate)
  const alertStatus = calculateAlertStatus(daysToExpiry)

  if (entityType === 'VEHICLE') {
    const document = await prisma.vehicleDocument.update({
      where: { id },
      data: {
        issueDate: today,
        expiryDate: newExpiryDate,
        daysToExpiry,
        alertStatus,
      },
      include: {
        vehicle: true,
      },
    })

    revalidatePath('/compliance')
    revalidatePath(`/vehicles/${document.vehicleId}`)

    return document
  } else {
    const document = await prisma.driverDocument.update({
      where: { id },
      data: {
        issueDate: today,
        expiryDate: newExpiryDate,
        daysToExpiry,
        alertStatus,
      },
      include: {
        driver: true,
      },
    })

    revalidatePath('/compliance')
    revalidatePath(`/drivers/${document.driverId}`)

    return document
  }
}

export async function listVehicleDocuments(filters: {
  vehicleId?: string
  documentType?: string
  alertStatus?: string
  page?: number
  limit?: number
}) {
  const { vehicleId, documentType, alertStatus, page = 1, limit = 20 } = filters

  const where: any = {}

  if (vehicleId) where.vehicleId = vehicleId
  if (documentType) where.documentType = documentType
  if (alertStatus) where.alertStatus = alertStatus

  const [documents, total] = await Promise.all([
    prisma.vehicleDocument.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { expiryDate: 'asc' },
      include: {
        vehicle: true,
      },
    }),
    prisma.vehicleDocument.count({ where }),
  ])

  return {
    documents,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  }
}

export async function listDriverDocuments(filters: {
  driverId?: string
  documentType?: string
  alertStatus?: string
  page?: number
  limit?: number
}) {
  const { driverId, documentType, alertStatus, page = 1, limit = 20 } = filters

  const where: any = {}

  if (driverId) where.driverId = driverId
  if (documentType) where.documentType = documentType
  if (alertStatus) where.alertStatus = alertStatus

  const [documents, total] = await Promise.all([
    prisma.driverDocument.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { expiryDate: 'asc' },
      include: {
        driver: true,
      },
    }),
    prisma.driverDocument.count({ where }),
  ])

  return {
    documents,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  }
}

export async function getExpiryAlerts() {
  const vehicleDocuments = await prisma.vehicleDocument.findMany({
    where: {
      alertStatus: { in: ['RED', 'AMBER'] },
    },
    include: {
      vehicle: true,
    },
  })

  const driverDocuments = await prisma.driverDocument.findMany({
    where: {
      alertStatus: { in: ['RED', 'AMBER'] },
    },
    include: {
      driver: true,
    },
  })

  const alerts = [
    ...vehicleDocuments.map((doc) => ({
      documentId: doc.id,
      documentType: doc.documentType,
      entityId: doc.vehicleId,
      entityType: 'VEHICLE' as const,
      entityName: doc.vehicle.vehicleNo,
      expiryDate: doc.expiryDate,
      daysToExpiry: doc.daysToExpiry ?? 0,
      alertStatus: doc.alertStatus,
    })),
    ...driverDocuments.map((doc) => ({
      documentId: doc.id,
      documentType: doc.documentType,
      entityId: doc.driverId,
      entityType: 'DRIVER' as const,
      entityName: doc.driver.fullName,
      expiryDate: doc.expiryDate,
      daysToExpiry: doc.daysToExpiry ?? 0,
      alertStatus: doc.alertStatus,
    })),
  ]

  alerts.sort((a, b) => a.daysToExpiry - b.daysToExpiry)

  return alerts
}

export async function recalculateAlerts() {
  const vehicleDocuments = await prisma.vehicleDocument.findMany()
  const driverDocuments = await prisma.driverDocument.findMany()

  const updates = [
    ...vehicleDocuments.map((doc) => {
      const daysToExpiry = calculateDaysToExpiry(doc.expiryDate)
      const alertStatus = calculateAlertStatus(daysToExpiry)
      return prisma.vehicleDocument.update({
        where: { id: doc.id },
        data: { daysToExpiry, alertStatus },
      })
    }),
    ...driverDocuments.map((doc) => {
      const daysToExpiry = calculateDaysToExpiry(doc.expiryDate)
      const alertStatus = calculateAlertStatus(daysToExpiry)
      return prisma.driverDocument.update({
        where: { id: doc.id },
        data: { daysToExpiry, alertStatus },
      })
    }),
  ]

  await prisma.$transaction(updates)

  revalidatePath('/compliance')
  revalidatePath('/dashboard')

  return { updated: updates.length }
}
