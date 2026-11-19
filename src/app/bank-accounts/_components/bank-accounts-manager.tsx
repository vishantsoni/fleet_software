'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/toast'
import { createBankAccountAction, setBankAccountActiveAction } from '@/server/actions/finance'

interface BankAccount {
  id: string
  bankName: string
  accountNumber: string
  isActive: boolean
}

export function BankAccountsManager({ accounts }: { accounts: BankAccount[] }) {
  const router = useRouter()
  const { toast } = useToast()
  const [bankName, setBankName] = useState('')
  const [accountNumber, setAccountNumber] = useState('')
  const [saving, setSaving] = useState(false)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const addAccount = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSaving(true)
    try {
      const result = await createBankAccountAction({ bankName, accountNumber })
      if (!result.success) {
        toast({ title: 'Could not add account', description: result.error, variant: 'destructive' })
        return
      }
      setBankName('')
      setAccountNumber('')
      toast({ title: 'Bank account added' })
      router.refresh()
    } catch (error) {
      toast({
        title: 'Could not add account',
        description: error instanceof Error ? error.message : 'Unexpected error while saving the bank account.',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const toggleAccount = async (account: BankAccount) => {
    setUpdatingId(account.id)
    try {
      const result = await setBankAccountActiveAction(account.id, !account.isActive)
      if (!result.success) {
        toast({ title: 'Could not update account', description: result.error, variant: 'destructive' })
        return
      }
      router.refresh()
    } catch (error) {
      toast({
        title: 'Could not update account',
        description: error instanceof Error ? error.message : 'Unexpected error while updating the bank account.',
        variant: 'destructive',
      })
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={addAccount} className="grid gap-4 rounded-lg border bg-card p-6 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <div className="space-y-2">
          <Label htmlFor="bankName">Bank name</Label>
          <Input id="bankName" value={bankName} onChange={(event) => setBankName(event.target.value)} maxLength={100} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="accountNumber">Account number</Label>
          <Input id="accountNumber" value={accountNumber} onChange={(event) => setAccountNumber(event.target.value)} maxLength={50} required />
        </div>
        <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Add account'}</Button>
      </form>

      <div className="overflow-x-auto rounded-md border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50 text-left">
              <th className="p-3 font-medium">Bank name</th>
              <th className="p-3 font-medium">Account number</th>
              <th className="p-3 font-medium">Status</th>
              <th className="p-3 text-right font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {accounts.length === 0 ? (
              <tr><td colSpan={4} className="p-6 text-center text-muted-foreground">No bank accounts added.</td></tr>
            ) : accounts.map((account) => (
              <tr key={account.id} className="border-b last:border-0">
                <td className="p-3">{account.bankName}</td>
                <td className="p-3">{account.accountNumber}</td>
                <td className="p-3">{account.isActive ? 'Active' : 'Inactive'}</td>
                <td className="p-3 text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={updatingId === account.id}
                    onClick={() => void toggleAccount(account)}
                  >
                    {account.isActive ? 'Deactivate' : 'Activate'}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
