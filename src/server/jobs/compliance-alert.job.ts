import prisma from '@/lib/prisma'
import { complianceQueue } from './queue'
import { calculateDaysToExpiry, calculateAlertStatus } from '@/server/utils/calculations'

export async function processComplianceAlerts() {
  const documents = await prisma.vehicleDocument.findMany({
    include: { vehicle: true },
  })

  const driverDocuments = await prisma.driverDocument.findMany({
    include: { driver: true },
  })

  const allDocuments = [
    ...documents.map((d) => ({ ...d, entityType: 'VEHICLE' as const, entityName: d.vehicle.vehicleNo })),
    ...driverDocuments.map((d) => ({ ...d, entityType: 'DRIVER' as const, entityName: d.driver.fullName })),
  ]

  const updates = allDocuments.map((doc) => {
    const daysToExpiry = calculateDaysToExpiry(doc.expiryDate)
    const alertStatus = calculateAlertStatus(daysToExpiry)

    if (doc.entityType === 'VEHICLE') {
      return prisma.vehicleDocument.update({
        where: { id: doc.id },
        data: { daysToExpiry, alertStatus },
      })
    } else {
      return prisma.driverDocument.update({
        where: { id: doc.id },
        data: { daysToExpiry, alertStatus },
      })
    }
  })

  await prisma.$transaction(updates)

  const expiredDocuments = allDocuments.filter((d) => {
    const daysToExpiry = calculateDaysToExpiry(d.expiryDate)
    return daysToExpiry <= 30
  })

  for (const doc of expiredDocuments) {
    await complianceQueue.add(
      'compliance-alert',
      {
        documentId: doc.id,
        entityType: doc.entityType,
        entityName: doc.entityName,
        documentType: doc.documentType,
        expiryDate: doc.expiryDate,
        daysToExpiry: calculateDaysToExpiry(doc.expiryDate),
      },
      {
        jobId: `compliance-${doc.entityType}-${doc.id}`,
      }
    )
  }

  return { processed: allDocuments.length, alerts: expiredDocuments.length }
}
