import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function ParentDashboard({ searchParams }: { searchParams: { error?: string, linked?: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: parentProfile } = await supabase
    .from('users').select('*').eq('id', user.id).single()

  const { data: links } = await supabase
    .from('parent_links').select('student_user_id').eq('parent_user_id', user.id)
  const childIds = links?.map((l: any) => l.student_user_id) || []

  const { data: children } = childIds.length > 0
    ? await supabase.from('student_profiles').select('*').in('user_id', childIds)
    : { data: [] }

  // Fetch stats for each child
  const childStats: Record<string, any> = {}
  for (const child of (children || [])) {
    const [xpRes, streakRes, gapsRes, closedRes] = await Promise.all([
      supabase.from('xp_log').select('points').eq('student_id', child.user_id),
      supabase.from('streaks').select('current_streak').eq('student_id', child.user_id).single(),
      supabase.from('swipe_events').select('id').eq('student_id', child.user_id).eq('direction', 'left'),
      supabase.from('swipe_events').select('id').eq('student_id', child.user_id).eq('direction', 'right'),
    ])
    childStats[child.user_id] = {
      xp: (xpRes.data || []).reduce((s: number, r: any) => s + r.points, 0),
      streak: streakRes.data?.current_streak || 0,
      gaps: gapsRes.data?.length || 0,
      closed: closedRes.data?.length || 0,
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <img src="/logo.png" alt="SwipeGap" style={{width:"140px", height:"auto"}} />
          <div className="flex items-center gap-4">
            <span className="text-xs text-gray-500 hidden sm:block">Parent Portal</span>
            <a href="/api/auth/signout" className="text-sm text-gray-400 hover:text-gray-600">Sign out →</a>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">

        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-brand-blue to-brand-teal rounded-2xl p-5 text-white">
          <p className="text-sm opacity-75">Welcome back 👋</p>
          <h1 className="text-xl font-bold mt-1">Parent Dashboard</h1>
          <p className="text-sm opacity-75 mt-1">{user.email}</p>
        </div>

        {/* Error/Success Messages */}
        {searchParams?.error === 'not_found' && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3">
            <span className="text-2xl">❌</span>
            <div>
              <p className="font-semibold text-red-800">Code not found</p>
              <p className="text-sm text-red-600">Double-check the 8-character code from your child's dashboard.</p>
            </div>
          </div>
        )}
        {searchParams?.error === 'invalid_code' && (
          <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 flex items-center gap-3">
            <span className="text-2xl">⚠️</span>
            <p className="text-sm text-orange-700">Please enter a valid invite code (at least 6 characters).</p>
          </div>
        )}
        {searchParams?.linked === 'true' && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center gap-3">
            <span className="text-2xl">✅</span>
            <div>
              <p className="font-semibold text-green-800">Successfully linked!</p>
              <p className="text-sm text-green-600">You can now view your child's progress below.</p>
            </div>
          </div>
        )}

        {!children || children.length === 0 ? (
          /* No children linked yet */
          <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
            <div className="text-5xl mb-4">👨‍👩‍👧</div>
            <h2 className="font-bold text-gray-900 text-lg mb-2">Link your child's account</h2>
            <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
              Ask your child to share their invite code from their SwipeGap student dashboard settings.
            </p>
            <form action="/api/parent/link-child" method="POST" className="max-w-sm mx-auto">
              <div className="flex gap-2">
                <input name="invite_code" placeholder="e.g. A1B2C3D4"
                  className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-blue uppercase tracking-widest text-center font-bold" />
                <button type="submit" className="bg-brand-blue text-white px-4 py-2.5 rounded-xl text-sm font-medium">Link</button>
              </div>
              <p className="text-xs text-gray-400 mt-2 text-center">Ask your child to open their dashboard and share their 8-character code</p>
            </form>
            <div className="mt-8 grid grid-cols-3 gap-4 text-center">
              {[
                { icon: "📊", title: "Track Progress", desc: "See your child's learning journey" },
                { icon: "🗺️", title: "Knowledge Map", desc: "View their topic heatmap" },
                { icon: "📧", title: "Weekly Reports", desc: "Get emailed every Sunday" },
              ].map(f => (
                <div key={f.title} className="bg-gray-50 rounded-xl p-3">
                  <div className="text-2xl mb-1">{f.icon}</div>
                  <p className="text-xs font-semibold text-gray-700">{f.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Children linked - show each child's dashboard */
          (children || []).map((child: any) => {
            const stats = childStats[child.user_id] || {}
            return (
              <div key={child.user_id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                {/* Child Header */}
                <div className="bg-gradient-to-r from-teal-500 to-teal-700 p-5 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold">{child.name || "Your Child"}</h2>
                      <p className="text-sm opacity-75 mt-0.5">{child.grade} · {child.subjects?.join(", ")}</p>
                    </div>
                    <div className="text-3xl">🎓</div>
                  </div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-4 divide-x divide-gray-100 border-b border-gray-100">
                  {[
                    { label: "Total XP", value: stats.xp || 0, icon: "⚡" },
                    { label: "Day Streak", value: stats.streak || 0, icon: "🔥" },
                    { label: "Gaps Open", value: stats.gaps || 0, icon: "📌" },
                    { label: "Gaps Closed", value: stats.closed || 0, icon: "✅" },
                  ].map(s => (
                    <div key={s.label} className="p-4 text-center">
                      <div className="text-lg">{s.icon}</div>
                      <div className="text-xl font-bold text-gray-900 mt-1">{s.value}</div>
                      <div className="text-xs text-gray-500">{s.label}</div>
                    </div>
                  ))}
                </div>

                {/* Quick Actions */}
                <div className="p-5">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">View Child's Activity</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <a href={"/parent/child/" + child.user_id + "/heatmap"}
                      className="flex items-center gap-2 bg-blue-50 text-brand-blue px-4 py-3 rounded-xl text-sm font-medium hover:bg-blue-100 transition-colors">
                      🗺️ Knowledge Map
                    </a>
                    <a href={"/parent/child/" + child.user_id + "/plan"}
                      className="flex items-center gap-2 bg-teal-50 text-teal-700 px-4 py-3 rounded-xl text-sm font-medium hover:bg-teal-100 transition-colors">
                      📋 Learning Plan
                    </a>
                    <a href={"/parent/child/" + child.user_id + "/progress"}
                      className="flex items-center gap-2 bg-orange-50 text-orange-700 px-4 py-3 rounded-xl text-sm font-medium hover:bg-orange-100 transition-colors">
                      📈 Progress Report
                    </a>
                    <a href={"/parent/child/" + child.user_id + "/gaps"}
                      className="flex items-center gap-2 bg-red-50 text-red-700 px-4 py-3 rounded-xl text-sm font-medium hover:bg-red-100 transition-colors">
                      📌 Gap Analysis
                    </a>
                    <a href={"/parent/child/" + child.user_id + "/benchmark"}
                      className="flex items-center gap-2 bg-purple-50 text-purple-700 px-4 py-3 rounded-xl text-sm font-medium hover:bg-purple-100 transition-colors">
                      🏆 Rankings
                    </a>
                    <a href={"/parent/child/" + child.user_id + "/sessions"}
                      className="flex items-center gap-2 bg-green-50 text-green-700 px-4 py-3 rounded-xl text-sm font-medium hover:bg-green-100 transition-colors">
                      👨‍🏫 Sessions
                    </a>
                  </div>
                </div>

                {/* Subjects */}
                {child.subjects && child.subjects.length > 0 && (
                  <div className="px-5 pb-5">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Enrolled Subjects</p>
                    <div className="flex flex-wrap gap-2">
                      {child.subjects.map((s: string) => (
                        <span key={s} className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full">{s}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })
        )}

        {/* Weekly Report Card */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl">📧</span>
            <div>
              <p className="font-semibold text-blue-900 text-sm">Weekly Progress Reports</p>
              <p className="text-xs text-blue-700 mt-0.5">Sent every Sunday to {user.email} with full activity summary for all linked children.</p>
            </div>
          </div>
        </div>

        {/* Tips for Parents */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-900 mb-3">💡 Tips for Supporting Your Child</h3>
          <div className="space-y-2">
            {[
              "Encourage 10–15 minutes of SwipeGap daily for best results",
              "Review the heatmap together to identify weak areas",
              "Celebrate when gaps are closed — every ✅ counts!",
              "Book a mentor session for topics with persistent gaps",
            ].map(tip => (
              <div key={tip} className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <p className="text-sm text-gray-600">{tip}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
