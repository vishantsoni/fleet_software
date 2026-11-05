import { notFound } from 'next/navigation'
import { getDriverAction } from '@/server/actions/drivers'
import { DriverSalaryManager } from './_components/driver-salary-manager'

interface DriverSalaryPageProps {
  params: Promise<{ id: string }>
}

export default async function DriverSalaryPage({ params }: DriverSalaryPageProps) {
  const { id } = await params
  const result = await getDriverAction(id)
  if (!result.success || !result.data) notFound()

  return (
    <DriverSalaryManager
      driverId={id}
      driverName={result.data.fullName}
      baseSalary={Number(result.data.baseSalary)}
    />
  )
}
