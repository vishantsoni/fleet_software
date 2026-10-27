'use client'

import { useState } from 'react'
import { AnalyticsContent } from './_components/analytics-content'

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      {/* <div>
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">Fleet performance and P&L insights</p>
      </div> */}

      <AnalyticsContent />
    </div>
  )
}
