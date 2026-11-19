import { formatCurrency, formatDate } from '@/server/utils/formatters'

interface ExpenseRow {
  id: string
  expenseDate: Date
  vehicle: { vehicleNo: string } | null
  driver: { fullName: string } | null
  description: string
  amount: number
  bankAccount: { bankName: string; accountNumber: string } | null
  paidBy: string | null
  paymentMode: string | null
  paymentTime: string | null
  remark: string | null
  cngRate: number | null
  quantityKg: number | null
}

export function ExpenseTable({ expenses }: { expenses: ExpenseRow[] }) {
  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold">Expenses</h2>
      <div className="overflow-x-auto rounded-md border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50 text-left">
              <th className="p-3 font-medium">Date</th>
              <th className="p-3 font-medium">Vehicle</th>
              <th className="p-3 font-medium">Driver</th>
              <th className="p-3 font-medium">Description</th>
              <th className="p-3 text-right font-medium">Amount</th>
              <th className="p-3 font-medium">Bank name / account</th>
              <th className="p-3 font-medium">Paid by</th>
              <th className="p-3 font-medium">Mode</th>
              <th className="p-3 font-medium">Time</th>
              <th className="p-3 font-medium">Remark</th>
              <th className="p-3 text-right font-medium">CNG rate</th>
              <th className="p-3 text-right font-medium">KG</th>
            </tr>
          </thead>
          <tbody>
            {expenses.length === 0 ? (
              <tr><td colSpan={12} className="p-6 text-center text-muted-foreground">No expenses recorded.</td></tr>
            ) : expenses.map((expense) => (
              <tr key={expense.id} className="border-b last:border-0">
                <td className="whitespace-nowrap p-3">
                  {formatDate(`${expense.expenseDate.toISOString().slice(0, 10)}T12:00:00Z`)}
                </td>
                <td className="p-3">{expense.vehicle?.vehicleNo || '-'}</td>
                <td className="p-3">{expense.driver?.fullName || '-'}</td>
                <td className="p-3">{expense.description}</td>
                <td className="whitespace-nowrap p-3 text-right">{formatCurrency(expense.amount)}</td>
                <td className="p-3">{expense.bankAccount ? `${expense.bankAccount.bankName} - ${expense.bankAccount.accountNumber}` : '-'}</td>
                <td className="p-3">{expense.paidBy || '-'}</td>
                <td className="p-3">{expense.paymentMode || '-'}</td>
                <td className="p-3">{expense.paymentTime || '-'}</td>
                <td className="p-3">{expense.remark || '-'}</td>
                <td className="p-3 text-right">{expense.cngRate == null ? '-' : formatCurrency(expense.cngRate)}</td>
                <td className="p-3 text-right">{expense.quantityKg ?? '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {expenses.length === 500 && <p className="text-sm text-muted-foreground">Showing the 500 most recent expenses.</p>}
    </div>
  )
}
