import Link from 'next/link'
import { PageShell } from '@/components/layout/page-shell'
import { Button } from '@/components/ui/button'
import { listBankAccountsAction, listExpensesAction } from '@/server/actions/finance'
import { listDriversAction } from '@/server/actions/drivers'
import { listVehiclesAction } from '@/server/actions/vehicles'
import { ExpenseForm, type ExpenseOption } from './_components/expense-form'
import { ExpenseTable } from './_components/expense-table'

export const dynamic = 'force-dynamic'

export default async function ExpensesPage() {
  const [expenses, bankAccounts, vehiclesResult, driversResult] = await Promise.all([
    listExpensesAction(),
    listBankAccountsAction(),
    listVehiclesAction(1, 1000, undefined, undefined, 'ACTIVE'),
    listDriversAction(1, 1000, undefined, 'ACTIVE'),
  ])
  const vehicles: ExpenseOption[] = vehiclesResult.success && 'vehicles' in vehiclesResult
    ? vehiclesResult.vehicles.map(({ id, vehicleNo }) => ({ id, label: vehicleNo }))
    : []
  const drivers: ExpenseOption[] = driversResult.success && 'drivers' in driversResult
    ? driversResult.drivers.map(({ id, fullName }) => ({ id, label: fullName }))
    : []

  return (
    <PageShell>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Expense Register</h1>
            <p className="text-muted-foreground">Record vehicle, driver, and other fleet expenses.</p>
          </div>
          <Button asChild variant="outline"><Link href="/bank-accounts">Manage bank accounts</Link></Button>
        </div>

        <ExpenseForm
          bankAccounts={bankAccounts}
          vehicles={vehicles}
          drivers={drivers}
        />
        <ExpenseTable expenses={expenses} />
      </div>
    </PageShell>
  )
}
