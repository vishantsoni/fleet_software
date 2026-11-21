'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/components/ui/toast'
import { updateExpenseAction } from '@/server/actions/finance'

export interface ExpenseOption {
  id: string
  label: string
}

interface ExpenseEditFormProps {
  expense: {
    id: string
    expenseDate: Date
    vehicleId: string | null
    driverId: string | null
    bankAccountId: string | null
    description: string
    amount: number
    paidBy: string | null
    paymentMode: string | null
    paymentTime: string | null
    remark: string | null
    cngRate: number | null
    quantityKg: number | null
  }
  bankAccounts: { id: string; bankName: string; accountNumber: string }[]
  vehicles: ExpenseOption[]
  drivers: ExpenseOption[]
}

export function ExpenseEditForm({ expense, bankAccounts, vehicles, drivers }: ExpenseEditFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [saving, setSaving] = useState(false)
  const [expenseDate, setExpenseDate] = useState(new Date(expense.expenseDate).toISOString().slice(0, 10))
  const [vehicleId, setVehicleId] = useState(expense.vehicleId || 'none')
  const [driverId, setDriverId] = useState(expense.driverId || 'none')
  const [bankAccountId, setBankAccountId] = useState(expense.bankAccountId || 'none')
  const [description, setDescription] = useState(expense.description)
  const [amount, setAmount] = useState(String(expense.amount))
  const [paidBy, setPaidBy] = useState(expense.paidBy || '')
  const [paymentMode, setPaymentMode] = useState(expense.paymentMode || '')
  const [paymentTime, setPaymentTime] = useState(expense.paymentTime || '')
  const [remark, setRemark] = useState(expense.remark || '')
  const [cngRate, setCngRate] = useState(expense.cngRate == null ? '' : String(expense.cngRate))
  const [quantityKg, setQuantityKg] = useState(expense.quantityKg == null ? '' : String(expense.quantityKg))

  const submitExpense = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSaving(true)
    try {
      const result = await updateExpenseAction(expense.id, {
        expenseDate: new Date(`${expenseDate}T00:00:00Z`),
        vehicleId: vehicleId === 'none' ? null : vehicleId,
        driverId: driverId === 'none' ? null : driverId,
        bankAccountId: bankAccountId === 'none' ? null : bankAccountId,
        description,
        amount: Number(amount),
        paidBy: paidBy || null,
        paymentMode: paymentMode || null,
        paymentTime: paymentTime || null,
        remark: remark || null,
        cngRate: cngRate === '' || cngRate == null ? null : Number(cngRate),
        quantityKg: quantityKg === '' || quantityKg == null ? null : Number(quantityKg),
      })
      if (!result.success) {
        toast({ title: 'Could not update expense', description: result.error, variant: 'destructive' })
        return
      }
      toast({ title: 'Expense updated' })
      router.push('/expenses')
      router.refresh()
    } catch (error) {
      toast({
        title: 'Could not update expense',
        description: error instanceof Error ? error.message : 'Unexpected error while updating expense.',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={submitExpense} className="space-y-4 rounded-lg border bg-card p-6">
      <h2 className="text-lg font-semibold">Edit expense</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="expenseDate">Date</Label>
          <Input id="expenseDate" type="date" value={expenseDate} onChange={(event) => setExpenseDate(event.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="vehicleId">Vehicle</Label>
          <Select value={vehicleId} onValueChange={setVehicleId}>
            <SelectTrigger id="vehicleId"><SelectValue placeholder="Select vehicle" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Not selected</SelectItem>
              {vehicles.map((vehicle) => <SelectItem key={vehicle.id} value={vehicle.id}>{vehicle.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="driverId">Driver</Label>
          <Select value={driverId} onValueChange={setDriverId}>
            <SelectTrigger id="driverId"><SelectValue placeholder="Select driver" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Not selected</SelectItem>
              {drivers.map((driver) => <SelectItem key={driver.id} value={driver.id}>{driver.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Input id="description" value={description} onChange={(event) => setDescription(event.target.value)} maxLength={200} required placeholder="e.g. CNG, conveyance, maintenance" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="amount">Amount (INR)</Label>
          <Input id="amount" value={amount} onChange={(event) => setAmount(event.target.value)} type="number" min="0.01" step="0.01" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="bankAccountId">Paid from bank account</Label>
          <Select value={bankAccountId} onValueChange={setBankAccountId}>
            <SelectTrigger id="bankAccountId"><SelectValue placeholder="Select account" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Not selected</SelectItem>
              {bankAccounts.map((account) => (
                <SelectItem key={account.id} value={account.id}>{account.bankName} - {account.accountNumber}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="paidBy">Paid by</Label>
          <Input id="paidBy" value={paidBy} onChange={(event) => setPaidBy(event.target.value)} maxLength={100} placeholder="e.g. ACCOUNT, Gogi Bhai" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="paymentMode">Mode of payment</Label>
          <Input id="paymentMode" value={paymentMode} onChange={(event) => setPaymentMode(event.target.value)} maxLength={50} placeholder="e.g. NEFT, Paytm, Cash" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="paymentTime">Time</Label>
          <Input id="paymentTime" value={paymentTime} onChange={(event) => setPaymentTime(event.target.value)} type="time" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="cngRate">CNG rate (INR/kg)</Label>
          <Input id="cngRate" value={cngRate} onChange={(event) => setCngRate(event.target.value)} type="number" min="0.01" step="0.01" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="quantityKg">Quantity (kg)</Label>
          <Input id="quantityKg" value={quantityKg} onChange={(event) => setQuantityKg(event.target.value)} type="number" min="0.01" step="0.01" />
        </div>
        <div className="space-y-2 sm:col-span-2 lg:col-span-1">
          <Label htmlFor="remark">Remark</Label>
          <Input id="remark" value={remark} onChange={(event) => setRemark(event.target.value)} maxLength={500} />
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
        <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Update expense'}</Button>
      </div>
    </form>
  )
}
