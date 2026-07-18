'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  BarChart3,
  FileText,
  Search,
  Zap,
  Users,
  Brain,
  HelpCircle,
  BookOpen,
} from 'lucide-react'

const navItems = [
  { href: '/', label: 'Overview', icon: BarChart3 },
  { href: '/research-sources', label: 'Research Sources', icon: FileText },
  { href: '/analysis', label: 'AI Analysis', icon: Zap },
  { href: '/insights', label: 'Insights', icon: Search },
  { href: '/opportunities', label: 'Opportunities', icon: BookOpen },
  { href: '/segments', label: 'Segments', icon: Users },
  { href: '/ask', label: 'Ask DiscoveryOS', icon: Brain },
  { href: '/report', label: 'Problem Space Report', icon: HelpCircle },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center">
            <span className="text-white font-bold">DO</span>
          </div>
          <h1 className="font-bold text-lg text-slate-900">DiscoveryOS</h1>
        </div>
        <p className="text-xs text-slate-500">Product Discovery AI</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors text-sm font-medium ${
                isActive
                  ? 'bg-blue-50 text-blue-600 border border-blue-200'
                  : 'text-slate-600 hover:bg-slate-50 border border-transparent'
              }`}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-200">
        <div className="text-xs text-slate-500 text-center">
          <p>Powered by OpenAI</p>
          <p className="mt-1">v1.0</p>
        </div>
      </div>
    </aside>
  )
}
