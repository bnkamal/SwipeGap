import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function ParentChildProgress({ params }: { params: { childId: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: link } = await supabase.from('parent_links').select('id')
    .eq('parent_user_id', user.id).eq('student_user_id', params.childId).single()
  if (!link) redirect('/dashboard/parent')

  const { data: child } = await supabase.from('student_profiles').select('*').eq('user_id', params.childId).single()
  const { data: xpLog } = await supabase.from('xp_log').select('points').eq('student_id', params.childId)
  const { data: streak } = await supabase.from('streaks').select('*').eq('student_id', params.childId).single()
  const { data: leftSwipes } = await supabase.from('swipe_events').select('id').eq('student_id', params.childId).eq('direction', 'left')
  const { data: rightSwipes } = await supabase.from('swipe_events').select('id').eq('student_id', params.childId).eq('direction', 'right')
  const totalXP = (xpLog || []).reduce((s: number, r: any) => s + r.points, 0)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100 px-4 py-4 mb-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <a href="/dashboard/parent" className="text-gray-400 hover:text-gray-600 text-sm">← Parent Dashboard</a>
          <img src="/logo.png" alt="SwipeGap" style={{width:"120px", height:"auto"}} />
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-4 pb-8 space-y-6">
        <div className="bg-gradient-to-r from-brand-blue to-brand-teal rounded-2xl p-5 text-white">
          <h1 className="text-xl font-bold">{child?.name}'s Progress Report</h1>
          <p className="text-sm opacity-75 mt-1">{child?.grade} · {child?.subjects?.join(', ')}</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: '⚡', label: 'Total XP', value: totalXP },
            { icon: '🔥', label: 'Day Streak', value: streak?.current_streak || 0 },
            { icon: '📌', label: 'Gaps Open', value: leftSwipes?.length || 0 },
            { icon: '✅', label: 'Confident', value: rightSwipes?.length || 0 },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-5 text-center">
              <div className="text-3xl mb-2">{s.icon}</div>
              <div className="text-2xl font-bold text-gray-900">{s.value}</div>
              <div className="text-xs text-gray-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-900 mb-3">📚 Subjects</h3>
          <div className="flex flex-wrap gap-2">
            {child?.subjects?.map((s: string) => (
              <span key={s} className="bg-blue-50 text-brand-blue px-4 py-2 rounded-xl text-sm">{s}</span>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-900 mb-3">🎯 Exam Targets</h3>
          <div className="flex flex-wrap gap-2">
            {child?.exam_targets?.map((e: string) => (
              <span key={e} className="bg-orange-50 text-orange-700 px-4 py-2 rounded-xl text-sm">{e}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
