import { PageShell } from '@/components/layout/page-shell'
import { listBankAccountsAction } from '@/server/actions/finance'
import { BankAccountsManager } from './_components/bank-accounts-manager'

export const dynamic = 'force-dynamic'

export default async function BankAccountsPage() {
  const accounts = await listBankAccountsAction(true)

  return (
    <PageShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bank Accounts</h1>
          <p className="text-muted-foreground">Manage accounts used to receive trip payments and pay expenses.</p>
        </div>
        <BankAccountsManager accounts={accounts} />
      </div>
    </PageShell>
  )
}
