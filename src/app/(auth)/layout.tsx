import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Login - Fleet Management',
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className={`${inter.className} min-h-screen flex items-center justify-center bg-muted/30`}>
      <div className="w-full max-w-md p-8">
        {children}
      </div>
    </div>
  )
}
