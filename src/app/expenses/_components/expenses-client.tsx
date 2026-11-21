'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Landmark } from 'lucide-react'
import { ExpenseForm, type ExpenseOption } from './expense-form'
import { ExpenseTable } from './expense-table'

export function ExpensesClient({ bankAccounts, vehicles, drivers, expenses }: {
  bankAccounts: any
  vehicles: ExpenseOption[]
  drivers: ExpenseOption[]
  expenses: any
}) {
  const [showForm, setShowForm] = useState(false)
  return (
    <>
      <div className="flex flex-wrap gap-2 items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Expense Register</h1>
          <p className="text-muted-foreground">Record vehicle, driver, and other fleet expenses.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="default" onClick={() => setShowForm((s) => !s)}>Add Expense</Button>
          <Button asChild variant="outline"><Link href="/bank-accounts"><Landmark className="mr-2 h-4 w-4" />Manage bank accounts</Link></Button>
          <Button asChild variant="outline"><a href="/api/exports/expenses">Export Excel</a></Button>
        </div>
      </div>
      {showForm && <ExpenseForm bankAccounts={bankAccounts} vehicles={vehicles} drivers={drivers} />}
      <ExpenseTable expenses={expenses} />
    </>
  )
}
