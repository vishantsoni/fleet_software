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
  netSalary: number
  paidAt: string
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
  const [amount, setAmount] = useState('')
  const [notes, setNotes] = useState('')
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
            setMonth(selectedMonth)
            const [year, monthValue] = selectedMonth.split('-').map(Number)
            const date = new Date(advanceDate)
            if (date.getFullYear() !== year || date.getMonth() + 1 !== monthValue) {
              setAdvanceDate(`${selectedMonth}-01`)
            }
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

      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Salary settlement</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Net payable = monthly salary minus outstanding advances. Any excess advances carry over.
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
                    <th className="p-2 text-right font-medium">Advance deducted</th>
                    <th className="p-2 text-right font-medium">Paid</th>
                    <th className="p-2 text-right font-medium">Paid on</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.recentPayments.map((payment) => (
                    <tr key={payment.id} className="border-b last:border-0">
                      <td className="p-2">{monthLabel(`${payment.salaryYear}-${String(payment.salaryMonth).padStart(2, '0')}`)}</td>
                      <td className="p-2 text-right">{money(payment.baseSalary)}</td>
                      <td className="p-2 text-right">{money(payment.advanceDeducted)}</td>
                      <td className="p-2 text-right">{money(payment.netSalary)}</td>
                      <td className="p-2 text-right">{formatDate(payment.paidAt)}</td>
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
