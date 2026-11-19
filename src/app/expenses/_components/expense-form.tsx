'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/components/ui/toast'
import { createExpenseAction } from '@/server/actions/finance'

export interface ExpenseOption {
  id: string
  label: string
}

interface ExpenseFormProps {
  bankAccounts: { id: string; bankName: string; accountNumber: string }[]
  vehicles: ExpenseOption[]
  drivers: ExpenseOption[]
}

export function ExpenseForm({ bankAccounts, vehicles, drivers }: ExpenseFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [saving, setSaving] = useState(false)
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().slice(0, 10))
  const [vehicleId, setVehicleId] = useState('none')
  const [driverId, setDriverId] = useState('none')
  const [bankAccountId, setBankAccountId] = useState('none')

  const submitExpense = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSaving(true)
    const form = event.currentTarget
    const formData = new FormData(form)
    try {
      const result = await createExpenseAction({
        expenseDate: new Date(`${expenseDate}T00:00:00Z`),
        vehicleId: vehicleId === 'none' ? null : vehicleId,
        driverId: driverId === 'none' ? null : driverId,
        bankAccountId: bankAccountId === 'none' ? null : bankAccountId,
        description: formData.get('description'),
        amount: Number(formData.get('amount')),
        paidBy: formData.get('paidBy') || null,
        paymentMode: formData.get('paymentMode') || null,
        paymentTime: formData.get('paymentTime') || null,
        remark: formData.get('remark') || null,
        cngRate: formData.get('cngRate') || null,
        quantityKg: formData.get('quantityKg') || null,
      })
      if (!result.success) {
        toast({ title: 'Could not save expense', description: result.error, variant: 'destructive' })
        return
      }
      form.reset()
      setExpenseDate(new Date().toISOString().slice(0, 10))
      setVehicleId('none')
      setDriverId('none')
      setBankAccountId('none')
      toast({ title: 'Expense recorded' })
      router.refresh()
    } catch (error) {
      toast({
        title: 'Could not save expense',
        description: error instanceof Error ? error.message : 'Unexpected error while saving expense.',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={submitExpense} className="space-y-4 rounded-lg border bg-card p-6">
      <h2 className="text-lg font-semibold">Add expense</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="expenseDate">Date</Label>
          <Input id="expenseDate" type="date" value={expenseDate} onChange={(event) => setExpenseDate(event.target.value)} max={new Date().toISOString().slice(0, 10)} required />
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
          <Input id="description" name="description" maxLength={200} required placeholder="e.g. CNG, conveyance, maintenance" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="amount">Amount (INR)</Label>
          <Input id="amount" name="amount" type="number" min="0.01" step="0.01" required />
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
          <Input id="paidBy" name="paidBy" maxLength={100} placeholder="e.g. ACCOUNT, Gogi Bhai" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="paymentMode">Mode of payment</Label>
          <Input id="paymentMode" name="paymentMode" maxLength={50} placeholder="e.g. NEFT, Paytm, Cash" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="paymentTime">Time</Label>
          <Input id="paymentTime" name="paymentTime" type="time" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="cngRate">CNG rate (INR/kg)</Label>
          <Input id="cngRate" name="cngRate" type="number" min="0.01" step="0.01" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="quantityKg">Quantity (kg)</Label>
          <Input id="quantityKg" name="quantityKg" type="number" min="0.01" step="0.01" />
        </div>
        <div className="space-y-2 sm:col-span-2 lg:col-span-1">
          <Label htmlFor="remark">Remark</Label>
          <Input id="remark" name="remark" maxLength={500} />
        </div>
      </div>
      <div className="flex justify-end">
        <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save expense'}</Button>
      </div>
    </form>
  )
}
