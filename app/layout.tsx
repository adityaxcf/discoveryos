import type { Metadata } from 'next'
import './globals.css'
import Sidebar from '@/components/layout/Sidebar'
import { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'DiscoveryOS - Product Discovery & User Research Intelligence',
  description: 'AI-powered product discovery and user research analysis',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-slate-50">
        <div className="flex h-screen">
          <Sidebar />
          <main className="flex-1 overflow-auto">{children}</main>
        </div>
      </body>
    </html>
  )
}
