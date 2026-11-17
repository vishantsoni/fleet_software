'use client'

import { useState } from 'react'
import { Download, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ExportExcelButtonProps {
  href: string
  filename: string
}

export function ExportExcelButton({ href, filename }: ExportExcelButtonProps) {
  const [exporting, setExporting] = useState(false)

  const exportExcel = async () => {
    setExporting(true)
    try {
      const response = await fetch(href)
      if (!response.ok) {
        const result = await response.json().catch(() => null)
        throw new Error(result?.error || 'Could not export the Excel file.')
      }

      const url = URL.createObjectURL(await response.blob())
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.setTimeout(() => URL.revokeObjectURL(url), 1000)
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Could not export the Excel file.')
    } finally {
      setExporting(false)
    }
  }

  return (
    <Button variant="outline" onClick={exportExcel} disabled={exporting}>
      {exporting ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Download className="mr-2 h-4 w-4" />
      )}
      {exporting ? 'Exporting...' : 'Export Excel'}
    </Button>
  )
}
