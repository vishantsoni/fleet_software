import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { getExpenseAction, listBankAccountsAction } from '@/server/actions/finance'
import { listVehiclesAction } from '@/server/actions/vehicles'
import { listDriversAction } from '@/server/actions/drivers'
import { ExpenseEditForm } from '../../_components/expense-edit-form'
import type { ExpenseOption } from '../../_components/expense-form'

interface EditExpensePageProps {
  params: Promise<{ id: string }>
}

async function EditExpenseContent({ id }: { id: string }) {
  const [expenseResult, bankAccounts, vehiclesResult, driversResult] = await Promise.all([
    getExpenseAction(id),
    listBankAccountsAction(),
    listVehiclesAction(1, 1000, undefined, undefined, 'ACTIVE'),
    listDriversAction(1, 1000, undefined, 'ACTIVE'),
  ])

  if (!expenseResult.success || !expenseResult.data) {
    notFound()
  }

  const vehicles: ExpenseOption[] = vehiclesResult.success && 'vehicles' in vehiclesResult
    ? vehiclesResult.vehicles.map(({ id, vehicleNo }: any) => ({ id, label: vehicleNo }))
    : []
  const drivers: ExpenseOption[] = driversResult.success && 'drivers' in driversResult
    ? driversResult.drivers.map(({ id, fullName }: any) => ({ id, label: fullName }))
    : []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Expense</h1>
        <p className="text-muted-foreground">Update expense details</p>
      </div>

      <div className="max-w-2xl rounded-lg border bg-card p-6">
        <ExpenseEditForm
          expense={expenseResult.data}
          bankAccounts={bankAccounts}
          vehicles={vehicles}
          drivers={drivers}
        />
      </div>
    </div>
  )
}

export default async function EditExpensePage({ params }: EditExpensePageProps) {
  const { id } = await params

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <EditExpenseContent id={id} />
    </Suspense>
  )
}
