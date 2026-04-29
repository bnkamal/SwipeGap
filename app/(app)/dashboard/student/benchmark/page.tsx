import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function BenchmarkPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { data: profile } = await supabase.from('student_profiles').select('*').eq('user_id', user.id).single()
  const { data: xpRows } = await supabase.from('xp_log').select('points').eq('student_id', user.id)
  const totalXP = xpRows?.reduce((s, r) => s + r.points, 0) || 0
  const { data: badges } = await supabase.from('badges').select('*').eq('student_id', user.id)
  const { data: resolved } = await supabase.from('learning_plans').select('id').eq('student_id', user.id).eq('status', 'resolved')
  const gapsClosed = resolved?.length || 0

  const BADGE_EMOJI: Record<string, string> = {
    first_swipe:'👆','7_day_streak':'🔥','30_day_streak':'💎',
    top_10_percent:'🏆',five_gaps_closed:'✅',ten_sessions_booked:'📚',
    cheatsheet_buyer:'📄',knowledge_challenge_winner:'🎯',gap_closed:'🎉',
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <a href="/dashboard/student" className="p-2 rounded-lg hover:bg-gray-100 text-gray-600">←</a>
          <div>
            <h1 className="text-xl font-bold text-gray-900">My Rankings & Badges</h1>
            <p className="text-sm text-gray-500">{profile?.grade} · {profile?.country === 'AU' ? '🇦🇺' : '🇮🇳'}</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total XP', value: totalXP.toLocaleString(), icon: '⚡', color: 'text-yellow-500' },
            { label: 'Gaps closed', value: gapsClosed, icon: '✅', color: 'text-green-500' },
            { label: 'Badges', value: badges?.length || 0, icon: '🏅', color: 'text-orange-500' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-4 text-center">
              <div className="text-2xl mb-1">{s.icon}</div>
              <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-xs text-gray-500">{s.label}</div>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">My Badges</h2>
          {!badges || badges.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <div className="text-3xl mb-2">🎖️</div>
              <p className="text-sm">No badges yet — start swiping to earn them!</p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-3">
              {badges.map((b: any) => (
                <div key={b.badge_type} className="flex flex-col items-center gap-1 bg-gradient-to-b from-yellow-50 to-orange-50 border border-orange-200 rounded-xl p-3 w-24 text-center">
                  <span className="text-2xl">{BADGE_EMOJI[b.badge_type] || '⭐'}</span>
                  <span className="text-xs font-medium text-gray-700 leading-tight">{b.badge_type.replace(/_/g,' ')}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="bg-gradient-to-r from-brand-blue to-brand-teal rounded-2xl p-5 text-white text-center">
          <h3 className="font-bold mb-1">Unlock full leaderboards</h3>
          <p className="text-sm opacity-80 mb-3">National and global rankings available on Basic plan</p>
          <a href="/dashboard/student/billing" className="inline-block bg-white text-brand-blue font-semibold px-5 py-2 rounded-xl text-sm">Upgrade now →</a>
        </div>
      </div>
    </div>
  )
}
