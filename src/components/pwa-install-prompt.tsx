'use client'

import { Download, Smartphone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { usePWAInstall } from '@/hooks/use-pwa-install'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useState } from 'react'

export function PWAInstallButton() {
  const { deferredPrompt, isInstalled, isIOS, install } = usePWAInstall()
  const [showIOSDialog, setShowIOSDialog] = useState(false)

  if (isInstalled) return null

  const showDesktopPrompt = deferredPrompt !== null && !isIOS

  return (
    <>
      {showDesktopPrompt && (
        <Button
          variant="ghost"
          size="sm"
          className="hidden sm:inline-flex items-center gap-2"
          onClick={async () => {
            await install()
          }}
        >
          <Download className="h-4 w-4" />
          Install App
        </Button>
      )}

      {!showDesktopPrompt && !isIOS && (
        <Button
          variant="ghost"
          size="sm"
          className="hidden sm:inline-flex items-center gap-2"
          onClick={() => {
            const url = navigator.userAgent
            alert('Press Ctrl/Cmd + S to save this page to your home screen.')
          }}
        >
          <Download className="h-4 w-4" />
          Add to Home
        </Button>
      )}

      {isIOS && (
        <Button
          variant="ghost"
          size="sm"
          className="hidden sm:inline-flex items-center gap-2"
          onClick={() => setShowIOSDialog(true)}
        >
          <Smartphone className="h-4 w-4" />
          iOS Install
        </Button>
      )}

      <Dialog open={showIOSDialog} onOpenChange={setShowIOSDialog}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Install FleetMS on iPhone</DialogTitle>
            <DialogDescription>
              To install this app on your device:
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <p className="text-sm">1. Open this website in Safari (not Chrome)</p>
            <p className="text-sm">2. Tap the Share button (square with arrow up)</p>
            <p className="text-sm">3. Select "Add to Home Screen"</p>
            <p className="text-sm">4. Tap "Add" to install</p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => setShowIOSDialog(false)}
            >
              Got it
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
