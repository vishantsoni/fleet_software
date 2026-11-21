'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Banknote, CalendarDays, Wallet } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/toast'

interface SalaryPayment {
  id: string
  salaryYear: number
  salaryMonth: number
  baseSalary: number
  advanceDeducted: number
  absenceDeducted: number
  expenseReimbursed: number
  netSalary: number
  paidAt: string
}

interface AttendanceEntry {
  id: string
  attendanceDate: string
  status: 'PRESENT' | 'ABSENT'
}

interface VehicleExpense {
  id: string
  amount: number
  expenseDate: string
  notes: string | null
}

interface Advance {
  id: string
  amount: number
  advanceDate: string
  notes: string | null
}

interface SalarySummary {
  month: string
  monthAdvanceTotal: number
  outstandingAdvances: number
  advanceDeduction: number
  attendance: AttendanceEntry[]
  absentDays: number
  absenceDeduction: number
  expenses: VehicleExpense[]
  expenseReimbursement: number
  netSalary: number
  salaryPayment: SalaryPayment | null
  advances: Advance[]
  recentPayments: SalaryPayment[]
}

interface DriverSalaryManagerProps {
  driverId: string
  driverName: string
  baseSalary: number
}

const money = (amount: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(amount)

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })

const monthLabel = (month: string) => {
  const [year, value] = month.split('-').map(Number)
  return new Date(year, value - 1, 1).toLocaleDateString('en-IN', { year: 'numeric', month: 'long' })
}

export function DriverSalaryManager({ driverId, driverName, baseSalary }: DriverSalaryManagerProps) {
  const { toast } = useToast()
  const [month, setMonth] = useState(() => new Date().toISOString().slice(0, 7))
  const [advanceDate, setAdvanceDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [attendanceDate, setAttendanceDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [attendanceStatus, setAttendanceStatus] = useState<'PRESENT' | 'ABSENT'>('PRESENT')
  const [expenseDate, setExpenseDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [amount, setAmount] = useState('')
  const [notes, setNotes] = useState('')
  const [expenseAmount, setExpenseAmount] = useState('')
  const [expenseNotes, setExpenseNotes] = useState('')
  const [summary, setSummary] = useState<SalarySummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const loadSummary = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const response = await fetch(`/api/drivers/${driverId}/salary?month=${encodeURIComponent(month)}`)
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Could not load salary details.')
      setSummary(result)
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Could not load salary details.')
      setSummary(null)
    } finally {
      setLoading(false)
    }
  }, [driverId, month])

  useEffect(() => {
    loadSummary()
  }, [loadSummary])

  const submitAction = async (payload: Record<string, unknown>, successTitle: string) => {
    setSubmitting(true)
    try {
      const response = await fetch(`/api/drivers/${driverId}/salary`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, month }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Could not save salary details.')
      toast({ title: successTitle })
      await loadSummary()
      return true
    } catch (submitError) {
      toast({
        title: 'Error',
        description: submitError instanceof Error ? submitError.message : 'Could not save salary details.',
        variant: 'destructive',
      })
      return false
    } finally {
      setSubmitting(false)
    }
  }

  const addAdvance = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const saved = await submitAction(
      { action: 'add-advance', amount: Number(amount), advanceDate, notes: notes.trim() || null },
      'Advance recorded'
    )
    if (saved) {
      setAmount('')
      setNotes('')
    }
  }

  const settleSalary = async () => {
    await submitAction({ action: 'settle-salary' }, 'Salary marked as paid')
  }

  const saveAttendance = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    await submitAction(
      { action: 'save-attendance', attendanceDate, status: attendanceStatus },
      'Attendance saved'
    )
  }

  const addVehicleExpense = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const saved = await submitAction(
      {
        action: 'add-vehicle-expense',
        expenseDate,
        amount: Number(expenseAmount),
        notes: expenseNotes.trim() || null,
      },
      'Vehicle expense recorded'
    )
    if (saved) {
      setExpenseAmount('')
      setExpenseNotes('')
    }
  }

  const currentMonth = new Date().toISOString().slice(0, 7)

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/drivers/${driverId}`} aria-label="Back to driver">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Salary & Advances</h1>
          <p className="text-muted-foreground">{driverName}</p>
        </div>
      </div>

      <div className="max-w-xs space-y-2">
        <Label htmlFor="salaryMonth">Salary month</Label>
        <Input
          id="salaryMonth"
          type="month"
          value={month}
          max={currentMonth}
          onChange={(event) => {
            const selectedMonth = event.target.value
            if (!selectedMonth) return
            setMonth(selectedMonth)
            const isDateInMonth = (date: string) => date.startsWith(`${selectedMonth}-`)
            if (!isDateInMonth(advanceDate)) setAdvanceDate(`${selectedMonth}-01`)
            if (!isDateInMonth(attendanceDate)) setAttendanceDate(`${selectedMonth}-01`)
            if (!isDateInMonth(expenseDate)) setExpenseDate(`${selectedMonth}-01`)
          }}
        />
      </div>

      {error && <p role="alert" className="rounded-md border border-destructive p-3 text-sm text-destructive">{error}</p>}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly salary</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><p className="text-2xl font-bold">{money(baseSalary)}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Advances this month</CardTitle>
            <Banknote className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><p className="text-2xl font-bold">{money(summary?.monthAdvanceTotal || 0)}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Advance deduction</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{money(summary?.advanceDeduction || 0)}</p>
            <p className="text-xs text-muted-foreground">Outstanding advances: {money(summary?.outstandingAdvances || 0)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Absent days</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{summary?.absentDays || 0}</p>
            <p className="text-xs text-muted-foreground">Only marked absent dates are counted</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Absence deduction</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><p className="text-2xl font-bold">{money(summary?.absenceDeduction || 0)}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Driver-paid expenses</CardTitle>
            <Banknote className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{money(summary?.expenseReimbursement || 0)}</p>
            <p className="text-xs text-muted-foreground">Added as reimbursement</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net payable</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{money(summary?.netSalary || 0)}</p>
            {summary?.salaryPayment && <Badge variant="success">Paid {formatDate(summary.salaryPayment.paidAt)}</Badge>}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(320px,0.8fr)]">
        <Card>
          <CardHeader>
            <CardTitle>Advance payments - {monthLabel(month)}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading salary details...</p>
            ) : summary?.advances.length ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="p-2 font-medium">Date</th>
                      <th className="p-2 font-medium">Reason / Note</th>
                      <th className="p-2 text-right font-medium">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summary.advances.map((advance) => (
                      <tr key={advance.id} className="border-b last:border-0">
                        <td className="p-2">{formatDate(advance.advanceDate)}</td>
                        <td className="p-2">{advance.notes || '—'}</td>
                        <td className="p-2 text-right">{money(advance.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No advances recorded for this month.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Record an advance</CardTitle></CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={addAdvance}>
              <div className="space-y-2">
                <Label htmlFor="advanceAmount">Amount (₹)</Label>
                <Input
                  id="advanceAmount"
                  type="number"
                  min="0.01"
                  step="0.01"
                  required
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                  disabled={submitting || !!summary?.salaryPayment}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="advanceDate">Date</Label>
                <Input
                  id="advanceDate"
                  type="date"
                  required
                  value={advanceDate}
                  max={new Date().toISOString().slice(0, 10)}
                  onChange={(event) => setAdvanceDate(event.target.value)}
                  disabled={submitting || !!summary?.salaryPayment}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="advanceNotes">Note (optional)</Label>
                <Input
                  id="advanceNotes"
                  maxLength={500}
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="Reason for advance"
                  disabled={submitting || !!summary?.salaryPayment}
                />
              </div>
              <Button type="submit" className="w-full" disabled={submitting || !!summary?.salaryPayment || loading}>
                {submitting ? 'Saving...' : 'Add advance'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Daily attendance - {monthLabel(month)}</CardTitle>
            <p className="text-sm text-muted-foreground">
              Only dates marked Absent reduce salary. Unmarked dates have no deduction.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <form className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]" onSubmit={saveAttendance}>
              <div className="space-y-2">
                <Label htmlFor="attendanceDate">Date</Label>
                <Input
                  id="attendanceDate"
                  type="date"
                  required
                  value={attendanceDate}
                  max={new Date().toISOString().slice(0, 10)}
                  onChange={(event) => setAttendanceDate(event.target.value)}
                  disabled={submitting || !!summary?.salaryPayment}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="attendanceStatus">Status</Label>
                <select
                  id="attendanceStatus"
                  value={attendanceStatus}
                  onChange={(event) => setAttendanceStatus(event.target.value as 'PRESENT' | 'ABSENT')}
                  disabled={submitting || !!summary?.salaryPayment}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="PRESENT">Present</option>
                  <option value="ABSENT">Absent</option>
                </select>
              </div>
              <div className="flex items-end">
                <Button type="submit" disabled={submitting || !!summary?.salaryPayment || loading}>
                  Save attendance
                </Button>
              </div>
            </form>

            {summary?.attendance.length ? (
              <div className="max-h-64 overflow-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="p-2 font-medium">Date</th>
                      <th className="p-2 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summary.attendance.map((entry) => (
                      <tr key={entry.id} className="border-b last:border-0">
                        <td className="p-2">{formatDate(entry.attendanceDate)}</td>
                        <td className="p-2">
                          <Badge variant={entry.status === 'ABSENT' ? 'destructive' : 'success'}>
                            {entry.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No attendance entries recorded for this month.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Vehicle expenses paid by driver - {monthLabel(month)}</CardTitle>
            <p className="text-sm text-muted-foreground">
              Recorded expenses are added to the driver&apos;s net salary as reimbursement.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <form className="space-y-3" onSubmit={addVehicleExpense}>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="expenseDate">Date</Label>
                  <Input
                    id="expenseDate"
                    type="date"
                    required
                    value={expenseDate}
                    max={new Date().toISOString().slice(0, 10)}
                    onChange={(event) => setExpenseDate(event.target.value)}
                    disabled={submitting || !!summary?.salaryPayment}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expenseAmount">Amount (₹)</Label>
                  <Input
                    id="expenseAmount"
                    type="number"
                    min="0.01"
                    step="0.01"
                    required
                    value={expenseAmount}
                    onChange={(event) => setExpenseAmount(event.target.value)}
                    disabled={submitting || !!summary?.salaryPayment}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="expenseNotes">Expense details</Label>
                <Input
                  id="expenseNotes"
                  maxLength={500}
                  value={expenseNotes}
                  onChange={(event) => setExpenseNotes(event.target.value)}
                  placeholder="Fuel, toll, repair..."
                  disabled={submitting || !!summary?.salaryPayment}
                />
              </div>
              <Button type="submit" disabled={submitting || !!summary?.salaryPayment || loading}>
                {submitting ? 'Saving...' : 'Add vehicle expense'}
              </Button>
            </form>

            {summary?.expenses.length ? (
              <div className="max-h-64 overflow-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="p-2 font-medium">Date</th>
                      <th className="p-2 font-medium">Details</th>
                      <th className="p-2 text-right font-medium">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summary.expenses.map((expense) => (
                      <tr key={expense.id} className="border-b last:border-0">
                        <td className="p-2">{formatDate(expense.expenseDate)}</td>
                        <td className="p-2">{expense.notes || '—'}</td>
                        <td className="p-2 text-right">{money(expense.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No driver-paid expenses recorded for this month.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Salary settlement</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Net payable = salary − absent deduction − advance deduction + driver-paid expense reimbursement.
              Absent days are prorated across the month&apos;s calendar days.
            </p>
          </div>
          <Button
            onClick={settleSalary}
            disabled={loading || submitting || !!summary?.salaryPayment || !summary}
          >
            {summary?.salaryPayment ? 'Salary paid' : submitting ? 'Saving...' : `Mark ${money(summary?.netSalary || 0)} as paid`}
          </Button>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader><CardTitle>Recent salary payments</CardTitle></CardHeader>
        <CardContent>
          {summary?.recentPayments.length ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="p-2 font-medium">Month</th>
                    <th className="p-2 text-right font-medium">Salary</th>
                    <th className="p-2 text-right font-medium">Absent deduction</th>
                    <th className="p-2 text-right font-medium">Advance deducted</th>
                    <th className="p-2 text-right font-medium">Expense reimbursed</th>
                    <th className="p-2 text-right font-medium">Paid</th>
                    <th className="p-2 text-right font-medium">Paid on</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.recentPayments.map((payment) => (
                    <tr key={payment.id} className="border-b last:border-0">
                      <td className="p-2">{monthLabel(`${payment.salaryYear}-${String(payment.salaryMonth).padStart(2, '0')}`)}</td>
                      <td className="p-2 text-right">{money(payment.baseSalary)}</td>
                      <td className="p-2 text-right">{money(payment.absenceDeducted)}</td>
                      <td className="p-2 text-right">{money(payment.advanceDeducted)}</td>
                      <td className="p-2 text-right">{money(payment.expenseReimbursed)}</td>
                      <td className="p-2 text-right">{money(payment.netSalary)}</td>
                      <td className="p-2 text-right">{formatDate(payment.paidAt)}</td>
                      <td className="p-2 text-right"><a href={`/api/drivers/${driverId}/salary/pdf?month=${payment.salaryYear}-${String(payment.salaryMonth).padStart(2,'0')}`} target="_blank" rel="noreferrer">Print</a></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No salary payments recorded yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
