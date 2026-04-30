'use client'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Avatar } from './Elements'
import type { LucideIcon } from 'lucide-react'

interface NavItem {
  href: string
  label: string
  icon: LucideIcon
}

interface PageLayoutProps {
  children: React.ReactNode
  navItems: NavItem[]
  user: { name?: string; email?: string; avatar_url?: string }
  title?: string
}

export function PageLayout({ children, navItems, user, title }: PageLayoutProps) {
  const pathname = usePathname()
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 flex-col bg-white border-r border-gray-100 flex-shrink-0">
        {/* Logo */}
        <div className="flex items-center gap-2 px-6 py-5 border-b border-gray-100">
          <Image src="/logo.png" alt="SwipeGap" width={140} height={44} className="object-contain" />
        </div>
        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map(item => {
            const Icon = item.icon
            const active = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link key={item.href} href={item.href} className={cn('sidebar-link', active && 'active')}>
                <Icon size={18} />
                {item.label}
              </Link>
            )
          })}
        </nav>
        {/* User */}
        <div className="px-4 py-4 border-t border-gray-100">
          <div className="flex items-center gap-3">
            <Avatar src={user.avatar_url} name={user.name} size="sm" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-900 truncate">{user.name || 'User'}</p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {title && (
          <header className="bg-white border-b border-gray-100 px-6 py-4 flex-shrink-0">
            <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
          </header>
        )}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
