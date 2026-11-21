import { notFound } from 'next/navigation'
import prisma from '@/lib/prisma'
import { StaffSalaryManager } from './_components/staff-salary-manager'

interface StaffSalaryPageProps {
  params: Promise<{ id: string }>
}

export default async function StaffSalaryPage({ params }: StaffSalaryPageProps) {
  const { id } = await params
  const user = await prisma.user.findUnique({ where: { id }, select: { id: true, name: true, baseSalary: true } })
  if (!user) notFound()
  return (
    <StaffSalaryManager
      staffId={id}
      staffName={user.name || id}
      baseSalary={Number(user.baseSalary)}
    />
  )
}
