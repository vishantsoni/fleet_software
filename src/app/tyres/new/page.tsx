'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { TyreForm } from '@/app/tyres/_components/tyre-form'
import { PageShell } from '@/components/layout/page-shell'

export default function NewTyrePage() {
  const router = useRouter()

  const handleSuccess = () => {
    router.push('/tyres')
    router.refresh()
  }

  return (
    <PageShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Fit New Tyre</h1>
          <p className="text-muted-foreground">Register a new tyre for a vehicle</p>
        </div>

        <TyreForm onClose={() => router.back()} onSuccess={handleSuccess} />
      </div>
    </PageShell>
  )
}
