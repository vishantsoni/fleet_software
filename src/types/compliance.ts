export interface ComplianceDocument {
  id: string
  documentType: 'INSURANCE' | 'FITNESS' | 'ROAD_TAX' | 'NATIONAL_PERMIT' | 'POLLUTION_CERTIFICATE' | 'DRIVER_LICENSE' | 'VEHICLE_REGISTRATION'
  documentNumber?: string
  issueDate: Date
  expiryDate: Date
  renewalCost: number
  alertStatus: 'GREEN' | 'AMBER' | 'RED'
  daysToExpiry?: number
  fileUrl?: string
  createdAt: Date
  updatedAt: Date
}

export interface CreateComplianceDocumentInput {
  documentType: 'INSURANCE' | 'FITNESS' | 'ROAD_TAX' | 'NATIONAL_PERMIT' | 'POLLUTION_CERTIFICATE' | 'DRIVER_LICENSE' | 'VEHICLE_REGISTRATION'
  documentNumber?: string
  issueDate: Date
  expiryDate: Date
  renewalCost?: number
  fileUrl?: string
}

export interface UpdateComplianceDocumentInput extends Partial<CreateComplianceDocumentInput> {
  id: string
}

export interface ExpiryAlert {
  documentId: string
  documentType: string
  entityId: string
  entityType: 'VEHICLE' | 'DRIVER'
  entityName: string
  expiryDate: Date
  daysToExpiry: number
  alertStatus: 'GREEN' | 'AMBER' | 'RED'
}
