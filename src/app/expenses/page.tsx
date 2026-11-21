import { PageShell } from '@/components/layout/page-shell'
import { listBankAccountsAction, listExpensesAction } from '@/server/actions/finance'
import { listDriversAction } from '@/server/actions/drivers'
import { listVehiclesAction } from '@/server/actions/vehicles'
import { ExpenseForm, type ExpenseOption } from './_components/expense-form'
import { ExpenseTable } from './_components/expense-table'
import { ExpensesClient } from './_components/expenses-client'

export const dynamic = 'force-dynamic'

export default async function ExpensesPage() {
  const [expenses, bankAccounts, vehiclesResult, driversResult] = await Promise.all([
    listExpensesAction(),
    listBankAccountsAction(),
    listVehiclesAction(1, 1000, undefined, undefined, 'ACTIVE'),
    listDriversAction(1, 1000, undefined, 'ACTIVE'),
  ])
  const vehicles: ExpenseOption[] = vehiclesResult.success && 'vehicles' in vehiclesResult
    ? vehiclesResult.vehicles.map(({ id, vehicleNo }: any) => ({ id, label: vehicleNo }))
    : []
  const drivers: ExpenseOption[] = driversResult.success && 'drivers' in driversResult
    ? driversResult.drivers.map(({ id, fullName }: any) => ({ id, label: fullName }))
    : []

  return (
    <PageShell>
      <div className="space-y-6">
        
        <ExpensesClient bankAccounts={bankAccounts} vehicles={vehicles} drivers={drivers} expenses={expenses} />
      </div>
    </PageShell>
  )
}
