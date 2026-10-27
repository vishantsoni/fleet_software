export type JobType = 'PREVENTATIVE' | 'BREAKDOWN'

export interface MaintenanceJob {
  id: string
  jobDate: Date
  vehicleId: string
  odometerAtService: number
  jobType: JobType
  workshopId?: string | null
  partsCost: number
  labourCost: number
  totalCost: number
  description?: string | null
  createdById?: string | null
  createdAt: Date
  updatedAt: Date
}

export interface MaintenanceJobWithRelations extends MaintenanceJob {
  vehicle?: {
    id: string
    vehicleNo: string
    makeModel: string
  }
  workshop?: {
    id: string
    name: string
    address?: string | null
    phone?: string | null
  } | null
  createdBy?: {
    id: string
    name: string | null
    email: string
  } | null
}

export interface CreateMaintenanceJobInput {
  jobDate: Date
  vehicleId: string
  odometerAtService: number
  jobType: JobType
  workshopId?: string | null
  partsCost?: number
  labourCost?: number
  totalCost?: number
  description?: string | null
}

export interface UpdateMaintenanceJobInput extends Partial<CreateMaintenanceJobInput> {
  id: string
}
