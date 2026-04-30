import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function MentorDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('mentor_profiles').select('*').eq('user_id', user.id).single()
  if (!profile) redirect('/onboarding/mentor')

  const isVerified = profile.verified === true

  const { data: upcomingSessions } = await supabase
    .from('sessions')
    .select('*, topic:topics(title, subject)')
    .eq('mentor_id', user.id)
    .in('status', ['scheduled', 'active'])
    .order('scheduled_at', { ascending: true })
    .limit(5)

  const { data: completedSessions } = await supabase
    .from('sessions').select('price').eq('mentor_id', user.id).eq('status', 'completed')
  const totalEarned = (completedSessions || []).reduce((sum: number, s: any) => sum + (s.price * 0.85), 0)

  const { data: gapFeed } = await supabase
    .from('swipe_events')
    .select('topic_id, topics(title, subject, grade, exam_tag)')
    .eq('direction', 'left').limit(30)

  const topicCounts: Record<string, any> = {}
  ;(gapFeed || []).forEach((e: any) => {
    const key = e.topic_id
    if (!topicCounts[key]) topicCounts[key] = { ...e.topics, count: 0, topic_id: key }
    topicCounts[key].count++
  })

  const topGaps = Object.values(topicCounts)
    .filter((t: any) => profile.subjects?.includes(t.subject))
    .sort((a: any, b: any) => b.count - a.count)
    .slice(0, 8)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">

        <div className="flex items-center justify-between mb-2">
          <img src="/logo.png" alt="SwipeGap" style={{width:"160px", height:"auto"}} />
          <a href="/api/auth/signout" className="text-sm text-gray-400 hover:text-gray-600">Sign out →</a>
        </div>

        <div className={`rounded-2xl p-6 text-white ${isVerified ? 'bg-gradient-to-r from-teal-600 to-teal-800' : 'bg-gradient-to-r from-gray-600 to-gray-800'}`}>
          <p className="text-sm opacity-75 mb-1">Welcome back 👋</p>
          <h1 className="text-2xl font-bold">{profile.name}</h1>
          <p className="text-sm opacity-75 mt-1">{profile.subjects?.join(' · ')}</p>
          <span className={`inline-block mt-3 text-xs font-bold px-3 py-1 rounded-full ${isVerified ? 'bg-green-400 text-green-900' : 'bg-amber-400 text-amber-900'}`}>
            {isVerified ? '✓ Verified Mentor' : '⏳ Pending Verification'}
          </span>
        </div>

        {!isVerified && (
          <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-5">
            <h3 className="font-semibold text-amber-900 mb-1">Profile under review</h3>
            <p className="text-sm text-amber-700">Usually 24–48 hours. You will be notified at <strong>{user.email}</strong></p>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Sessions done',    value: completedSessions?.length || 0, icon: '📚', color: 'text-brand-blue' },
            { label: 'Total earned',     value: `$${totalEarned.toFixed(0)}`,   icon: '💰', color: 'text-brand-teal' },
            { label: 'Upcoming',         value: upcomingSessions?.length || 0,  icon: '📅', color: 'text-brand-orange' },
            { label: 'Topics in demand', value: topGaps.length,                 icon: '🔥', color: 'text-red-500' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-4 text-center shadow-sm">
              <div className="text-2xl mb-1">{s.icon}</div>
              <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {isVerified && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">Student gap feed</h2>
              <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">Anonymised</span>
            </div>
            {topGaps.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <div className="text-3xl mb-2">🔍</div>
                <p className="text-sm">No gaps in your subjects yet. Students need to swipe first.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {topGaps.map((gap: any) => (
                  <div key={gap.topic_id} className="border border-gray-100 rounded-xl p-3">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-medium text-sm text-gray-900">{gap.title}</h4>
                      <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full ml-2">
                        {gap.count} student{gap.count !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className="flex gap-1.5 text-xs text-gray-500">
                      <span className="bg-gray-100 px-1.5 py-0.5 rounded">{gap.subject}</span>
                      <span className="bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded">{gap.exam_tag}</span>
                      <span>{gap.grade}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Upcoming sessions</h2>
          {!upcomingSessions || upcomingSessions.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">No upcoming sessions yet.</p>
          ) : (
            <div className="space-y-3">
              {upcomingSessions.map((s: any) => (
                <div key={s.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div>
                    <p className="font-medium text-sm">{s.topic?.title || 'General session'}</p>
                    <p className="text-xs text-gray-500">{s.topic?.subject} · {new Date(s.scheduled_at).toLocaleDateString()}</p>
                  </div>
                  <span className="text-sm font-medium text-brand-teal">${(s.price * 0.85).toFixed(0)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-900 mb-3">Your profile</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between py-2 border-b border-gray-100"><span className="text-gray-500">Name</span><span className="font-medium">{profile.name}</span></div>
            <div className="flex justify-between py-2 border-b border-gray-100"><span className="text-gray-500">Subjects</span><span className="font-medium">{profile.subjects?.join(', ')}</span></div>
            <div className="flex justify-between py-2 border-b border-gray-100"><span className="text-gray-500">Qualification</span><span className="font-medium">{profile.qualifications}</span></div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-500">Status</span>
              <span className={isVerified ? 'text-green-600 font-medium' : 'text-amber-600 font-medium'}>
                {isVerified ? '✓ Verified' : 'Pending verification'}
              </span>
            </div>
            <div className="pt-1"><p className="text-gray-500 mb-1">Bio</p><p className="text-gray-700">{profile.bio}</p></div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h2 className="font-semibold text-gray-900 mb-3">Quick actions</h2>
          <div className="flex flex-wrap gap-3">
            <a href="/dashboard/mentor/cheatsheets" className="bg-brand-blue text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-800">📄 My Cheatsheets</a>
            <a href="/mentors" className="bg-brand-teal text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-teal-700">👥 View Marketplace</a>
            <a href="/dashboard/mentor/cheatsheets" className="bg-brand-orange text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-orange-600">⬆️ Upload Cheatsheet</a>
          </div>
        </div>
        <div className="text-center">
          <a href="/api/auth/signout" className="text-sm text-gray-400 hover:text-gray-600 underline">Sign out</a>
        </div>

      </div>
    </div>
  )
}
