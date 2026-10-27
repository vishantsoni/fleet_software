'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { TripForm } from '@/app/trips/_components/trip-form'
import { PageShell } from '@/components/layout/page-shell'

export default function NewTripPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleSuccess = () => {
    router.push('/trips')
    router.refresh()
  }

  return (
    <PageShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">New Trip</h1>
          <p className="text-muted-foreground">Create a new trip entry</p>
        </div>

        <div className="max-w-2xl rounded-lg border bg-card p-6">
          <TripForm onClose={() => router.back()} onSuccess={handleSuccess} />
        </div>
      </div>
    </PageShell>
  )
}
