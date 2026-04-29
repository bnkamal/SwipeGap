'use client'
import { cn } from '@/lib/utils'

// ── Card ──────────────────────────────────────────────────────────────────
export function Card({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('bg-white rounded-2xl border border-gray-100 shadow-sm', className)} {...props}>
      {children}
    </div>
  )
}

// ── Badge ─────────────────────────────────────────────────────────────────
type BadgeVariant = 'blue' | 'teal' | 'orange' | 'red' | 'green' | 'amber' | 'gray' | 'purple'

export function Badge({ children, variant = 'blue', className }: { children: React.ReactNode; variant?: BadgeVariant; className?: string }) {
  const variants: Record<BadgeVariant, string> = {
    blue:   'bg-blue-100 text-blue-800',
    teal:   'bg-teal-100 text-teal-800',
    orange: 'bg-orange-100 text-orange-800',
    red:    'bg-red-100 text-red-800',
    green:  'bg-green-100 text-green-800',
    amber:  'bg-amber-100 text-amber-800',
    gray:   'bg-gray-100 text-gray-700',
    purple: 'bg-purple-100 text-purple-800',
  }
  return (
    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', variants[variant], className)}>
      {children}
    </span>
  )
}

// ── Avatar ────────────────────────────────────────────────────────────────
export function Avatar({ src, name, size = 'md', className }: { src?: string; name?: string; size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const sizes = { sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-14 h-14 text-lg' }
  const initials = name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?'
  return src ? (
    <img src={src} alt={name} className={cn('rounded-full object-cover', sizes[size], className)} />
  ) : (
    <div className={cn('rounded-full bg-brand-blue text-white flex items-center justify-center font-semibold', sizes[size], className)}>
      {initials}
    </div>
  )
}

// ── ProgressBar ───────────────────────────────────────────────────────────
export function ProgressBar({ value, max = 100, color = 'blue', label, className }: {
  value: number; max?: number; color?: 'blue' | 'teal' | 'orange' | 'green'; label?: string; className?: string
}) {
  const pct = Math.min(100, Math.round((value / max) * 100))
  const colors = { blue: 'bg-brand-blue', teal: 'bg-brand-teal', orange: 'bg-brand-orange', green: 'bg-green-500' }
  return (
    <div className={cn('w-full', className)}>
      {label && <div className="flex justify-between text-xs text-gray-500 mb-1"><span>{label}</span><span>{pct}%</span></div>}
      <div className="w-full bg-gray-100 rounded-full h-2">
        <div className={cn('h-2 rounded-full transition-all duration-500', colors[color])} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

// ── Skeleton ──────────────────────────────────────────────────────────────
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse bg-gray-200 rounded-lg', className)} />
}

export function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
      <Skeleton className="h-3 w-full" />
    </div>
  )
}
