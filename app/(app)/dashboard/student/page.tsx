import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Card } from '@/components/ui/Elements'
import { Badge } from '@/components/ui/Elements'

export default async function StudentDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('student_profiles').select('*').eq('user_id', user.id).single()
  const { data: sub } = await supabase.from('subscriptions').select('plan').eq('user_id', user.id).single()
  const { data: streak } = await supabase.from('streaks').select('*').eq('student_id', user.id).single()
  const { data: xpTotal } = await supabase.from('xp_log').select('points').eq('student_id', user.id)
  const { data: leftSwipes } = await supabase.from('swipe_events').select('id').eq('student_id', user.id).eq('direction', 'left')
  const { data: resolvedPlans } = await supabase.from('learning_plans').select('id').eq('student_id', user.id).eq('status', 'resolved')

  const totalXP = xpTotal?.reduce((sum, r) => sum + r.points, 0) ?? 0
  const gapsOpen = leftSwipes?.length ?? 0
  const gapsClosed = resolvedPlans?.length ?? 0
  const plan = (sub?.plan ?? 'free') as string
  const planColors: Record<string, 'gray' | 'blue' | 'teal' | 'orange'> = { free: 'gray', basic: 'blue', pro: 'teal', premium: 'orange' }

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">

        {/* Header with logo + signout */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <img src="/logo.png" alt="SwipeGap" style={{width:"160px", height:"auto"}} />
          </div>
          <a href="/api/auth/signout" className="text-sm text-gray-400 hover:text-gray-600 flex items-center gap-1">
            Sign out →
          </a>
        </div>

        {/* Welcome banner */}
        <div className="bg-gradient-to-r from-brand-blue to-brand-teal rounded-2xl p-6 text-white">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <p className="text-blue-100 text-sm">Welcome back 👋</p>
              <h1 className="text-2xl font-bold mt-1">{profile?.name || 'Student'}</h1>
              <p className="text-blue-100 text-sm mt-1">{profile?.grade} · {profile?.country === 'AU' ? '🇦🇺 Australia' : '🇮🇳 India'}</p>
            </div>
            <Badge variant={planColors[plan]} className="capitalize">{plan} plan</Badge>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total XP', value: totalXP.toLocaleString(), icon: '⚡', color: 'text-yellow-500' },
            { label: 'Day streak', value: streak?.current_streak ?? 0, icon: '🔥', color: 'text-orange-500' },
            { label: 'Gaps open', value: gapsOpen, icon: '📌', color: 'text-red-500' },
            { label: 'Gaps closed', value: gapsClosed, icon: '✅', color: 'text-green-500' },
          ].map(s => (
            <Card key={s.label} className="p-4 text-center">
              <div className="text-2xl mb-1">{s.icon}</div>
              <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
            </Card>
          ))}
        </div>

        {/* Quick actions */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Quick actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { href: '/swipe', emoji: '👆', label: 'Start swiping', desc: 'Discover your gaps', color: 'bg-blue-50 border-blue-200 hover:bg-blue-100' },
              { href: '/dashboard/student/heatmap', emoji: '🗺️', label: 'My heatmap', desc: 'View knowledge map', color: 'bg-teal-50 border-teal-200 hover:bg-teal-100' },
              { href: '/dashboard/student/plan', emoji: '📋', label: 'Learning plan', desc: `${gapsOpen} topics to study`, color: 'bg-orange-50 border-orange-200 hover:bg-orange-100' },
              { href: '/mentors', emoji: '🧑‍🏫', label: 'Find mentor', desc: 'Book a session', color: 'bg-purple-50 border-purple-200 hover:bg-purple-100' },
              { href: '/marketplace', emoji: '📄', label: 'Cheatsheets', desc: 'Study materials', color: 'bg-yellow-50 border-yellow-200 hover:bg-yellow-100' },
              { href: '/dashboard/student/benchmark', emoji: '🏆', label: 'My ranking', desc: 'See where you stand', color: 'bg-green-50 border-green-200 hover:bg-green-100' },
            ].map(a => (
              <Link key={a.href} href={a.href}
                className={`rounded-2xl border-2 p-4 transition-all ${a.color}`}>
                <div className="text-3xl mb-2">{a.emoji}</div>
                <p className="font-semibold text-sm text-gray-900">{a.label}</p>
                <p className="text-xs text-gray-500">{a.desc}</p>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
