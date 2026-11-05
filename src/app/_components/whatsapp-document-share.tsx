'use client'

import { MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface WhatsAppDocumentShareProps {
  fileUrl: string
  documentName: string
}

export function WhatsAppDocumentShare({ fileUrl, documentName }: WhatsAppDocumentShareProps) {
  const shareDocument = () => {
    const documentUrl = new URL(fileUrl, window.location.origin).toString()
    const message = `${documentName}\n${documentUrl}`
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer')
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="absolute right-4 top-4"
      onClick={shareDocument}
    >
      <MessageCircle className="mr-2 h-4 w-4" />
      WhatsApp
    </Button>
  )
}
