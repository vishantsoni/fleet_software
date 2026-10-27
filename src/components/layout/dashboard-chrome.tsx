'use client'

import { usePathname } from 'next/navigation'
import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'

interface DashboardChromeProps {
  children: React.ReactNode
}

const authRoutes = ['/login']
const landingRoutes = ['/']

export function DashboardChrome({ children }: DashboardChromeProps) {
  const pathname = usePathname()
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route))
  const isLandingRoute = landingRoutes.includes(pathname)
  const showChrome = !isAuthRoute && !isLandingRoute

  if (!showChrome) {
    return <>{children}</>
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto">
          <div className="p-4 sm:p-6 max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
