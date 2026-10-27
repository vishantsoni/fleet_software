'use client'

import { useSession, signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { LogOut, User } from 'lucide-react'
import { PWAInstallButton } from '@/components/pwa-install-prompt'
import { MobileNav } from '@/components/layout/sidebar'

export function Header() {
  const { data: session } = useSession()

  return (
    <header className="h-16 border-b bg-card flex items-center justify-between px-3 sm:px-4 lg:px-6 flex-shrink-0">
      <div className="flex items-center gap-2">
        <MobileNav />
        <div>
          <h2 className="text-lg font-semibold hidden sm:block">
            Fleet Management
          </h2>
        </div>
      </div>

      <div className="flex items-center gap-1 sm:gap-2">
        <PWAInstallButton />
        {session?.user && (
          <div className="flex items-center gap-1 sm:gap-2">
            <div className="hidden sm:flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="text-sm">{session.user.email}</span>
              <span className="text-xs text-muted-foreground uppercase">
                {session.user.role}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => signOut({ callbackUrl: '/login' })}
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:ml-2 sm:inline">Logout</span>
            </Button>
          </div>
        )}
      </div>
    </header>
  )
}
