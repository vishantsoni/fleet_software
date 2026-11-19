'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Car,
  Users,
  ClipboardList,
  Fuel,
  Wrench,
  CircleDot,
  Zap,
  FileCheck,
  BarChart3,
  Wallet,
  Landmark,
  LayoutDashboard,
  Menu,
  X,
  ShieldCheck,
  UserCog,
} from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, permission: 'dashboard' },
  { href: '/vehicles', label: 'Vehicles', icon: Car, permission: 'vehicles' },
  { href: '/drivers', label: 'Drivers', icon: Users, permission: 'drivers' },
  { href: '/trips', label: 'Trips', icon: ClipboardList, permission: 'trips' },
  { href: '/expenses', label: 'Expenses', icon: Wallet, permission: 'expenses' },
  { href: '/bank-accounts', label: 'Bank Accounts', icon: Landmark, permission: 'bank_accounts' },
  { href: '/fuel', label: 'Fuel', icon: Fuel, permission: 'fuel' },
  { href: '/maintenance', label: 'Maintenance', icon: Wrench, permission: 'maintenance' },
  { href: '/tyres', label: 'Tyres', icon: CircleDot, permission: 'tyres' },
  { href: '/batteries', label: 'Batteries', icon: Zap, permission: 'batteries' },
  { href: '/compliance', label: 'Compliance', icon: FileCheck, permission: 'compliance' },
  { href: '/analytics', label: 'Analytics', icon: BarChart3, permission: 'analytics' },
  { href: '/roles', label: 'Roles', icon: ShieldCheck, permission: 'roles', adminOnly: true },
  { href: '/staff', label: 'Staff', icon: UserCog, permission: 'staff', adminOnly: true },
]

interface NavListProps {
  className?: string
  onItemClick?: () => void
}

export function NavList({ className, onItemClick }: NavListProps) {
  const pathname = usePathname()
  const { data: session } = useSession()

  return (
    <nav className={cn('flex flex-col space-y-1', className)}>
      {navItems.map((item) => {
        if ('adminOnly' in item && item.adminOnly && session?.user?.role !== 'ADMIN') return null
        const permissions = session?.user?.permissions || []
        if (session?.user?.role !== 'ADMIN' && !permissions.includes('*') && !permissions.includes(item.permission)) return null
        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
        return (
          <Link key={item.href} href={item.href} onClick={onItemClick}>
            <Button
              variant={isActive ? 'secondary' : 'ghost'}
              className={cn(
                'w-full justify-start gap-3 h-11',
                isActive && 'bg-secondary font-medium'
              )}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {item.label}
            </Button>
          </Link>
        )
      })}
    </nav>
  )
}

export function Sidebar() {
  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:border-r lg:bg-muted/10 lg:h-screen">
      <div className="p-4 border-b">
        <h1 className="text-xl font-bold">Fleet MS</h1>
        <p className="text-xs text-muted-foreground">Management System</p>
      </div>
      <div className="flex-1 overflow-y-auto py-4">
        <NavList />
      </div>
      <div className="p-4 border-t">
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} <a href="https://gtsol.in" target="_blank" rel="noopener noreferrer">Fleet Software</a>
        </p>
      </div>
    </aside>
  )
}

export function MobileNav() {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[260px] p-0 flex flex-col h-full">
        <div className="p-4 border-b flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Fleet MS</h1>
            <p className="text-xs text-muted-foreground">Management System</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setOpen(false)}
            aria-label="Close navigation menu"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto py-4">
          <NavList onItemClick={() => setOpen(false)} />
        </div>
        <div className="p-4 border-t">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} <a href="https://gtsol.in" target="_blank" rel="noopener noreferrer">Fleet Software</a>
          </p>
        </div>
      </SheetContent>
    </Sheet>
  )
}
