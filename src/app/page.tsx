import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="max-w-4xl w-full space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">
            Fleet Management System
          </h1>
          <p className="text-xl text-muted-foreground">
            Advanced Transport Fleet Management Platform
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link href="/vehicles">
            <div className="p-6 border rounded-lg hover:border-primary transition-colors">
              <h2 className="text-xl font-semibold mb-2">Vehicles</h2>
              <p className="text-muted-foreground">Manage your fleet vehicles</p>
            </div>
          </Link>

          <Link href="/drivers">
            <div className="p-6 border rounded-lg hover:border-primary transition-colors">
              <h2 className="text-xl font-semibold mb-2">Drivers</h2>
              <p className="text-muted-foreground">Driver master and payroll</p>
            </div>
          </Link>

          <Link href="/trips">
            <div className="p-6 border rounded-lg hover:border-primary transition-colors">
              <h2 className="text-xl font-semibold mb-2">Trips</h2>
              <p className="text-muted-foreground">Trip and revenue register</p>
            </div>
          </Link>

          <Link href="/fuel">
            <div className="p-6 border rounded-lg hover:border-primary transition-colors">
              <h2 className="text-xl font-semibold mb-2">Fuel</h2>
              <p className="text-muted-foreground">Fuel register and economy</p>
            </div>
          </Link>

          <Link href="/maintenance">
            <div className="p-6 border rounded-lg hover:border-primary transition-colors">
              <h2 className="text-xl font-semibold mb-2">Maintenance</h2>
              <p className="text-muted-foreground">Maintenance and repair log</p>
            </div>
          </Link>

          <Link href="/tyres">
            <div className="p-6 border rounded-lg hover:border-primary transition-colors">
              <h2 className="text-xl font-semibold mb-2">Tyres</h2>
              <p className="text-muted-foreground">Tyre management</p>
            </div>
          </Link>

          <Link href="/compliance">
            <div className="p-6 border rounded-lg hover:border-primary transition-colors">
              <h2 className="text-xl font-semibold mb-2">Compliance</h2>
              <p className="text-muted-foreground">Document expiry tracker</p>
            </div>
          </Link>

          <Link href="/analytics">
            <div className="p-6 border rounded-lg hover:border-primary transition-colors">
              <h2 className="text-xl font-semibold mb-2">Analytics</h2>
              <p className="text-muted-foreground">P&L and fleet metrics</p>
            </div>
          </Link>
        </div>

        <div className="text-center">
          <Link href="/login">
            <Button size="lg">Get Started</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
