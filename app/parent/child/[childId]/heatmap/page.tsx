import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function ParentChildHeatmap({ params }: { params: { childId: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: link } = await supabase.from('parent_links').select('id')
    .eq('parent_user_id', user.id).eq('student_user_id', params.childId).single()
  if (!link) redirect('/dashboard/parent')

  const { data: child } = await supabase.from('student_profiles').select('*').eq('user_id', params.childId).single()
  const { data: swipeEvents } = await supabase.from('swipe_events')
    .select('topic_id, direction').eq('student_id', params.childId)
  const swipedIds = Array.from(new Set((swipeEvents || []).map((e: any) => e.topic_id)))
  const { data: topics } = swipedIds.length > 0
    ? await supabase.from('topics').select('*').in('id', swipedIds)
    : { data: [] }

  const swipesByTopic: Record<string, any[]> = {}
  ;(swipeEvents || []).forEach((e: any) => {
    if (!swipesByTopic[e.topic_id]) swipesByTopic[e.topic_id] = []
    swipesByTopic[e.topic_id].push(e)
  })

  const enriched = (topics || []).map((t: any) => {
    const swipes = swipesByTopic[t.id] || []
    const rights = swipes.filter((s: any) => s.direction === 'right').length
    const lefts = swipes.filter((s: any) => s.direction === 'left').length
    const status = swipes.length === 0 ? 'unswiped' : lefts > 0 && rights > 0 ? 'mixed' : lefts > 0 ? 'needs-help' : 'confident'
    return { ...t, status }
  })

  const bySubject = enriched.reduce((acc: Record<string, any[]>, t: any) => {
    if (!acc[t.subject]) acc[t.subject] = []
    acc[t.subject].push(t)
    return acc
  }, {})

  const statusColor = (s: string) =>
    s === 'confident' ? 'bg-green-400' : s === 'needs-help' ? 'bg-red-400' : s === 'mixed' ? 'bg-yellow-400' : 'bg-gray-200'

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
          <h1 className="text-xl font-bold">{child?.name}'s Knowledge Map</h1>
          <p className="text-sm opacity-75 mt-1">{enriched.length} topics swiped · {enriched.filter((t: any) => t.status === 'confident').length} confident</p>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: 'Confident', count: enriched.filter((t: any) => t.status === 'confident').length, color: 'bg-green-50 text-green-700 border border-green-200' },
            { label: 'Needs Study', count: enriched.filter((t: any) => t.status === 'needs-help').length, color: 'bg-red-50 text-red-700 border border-red-200' },
            { label: 'Mixed', count: enriched.filter((t: any) => t.status === 'mixed').length, color: 'bg-yellow-50 text-yellow-700 border border-yellow-200' },
            { label: 'Unswiped', count: enriched.filter((t: any) => t.status === 'unswiped').length, color: 'bg-gray-50 text-gray-600 border border-gray-200' },
          ].map(s => (
            <div key={s.label} className={`rounded-2xl p-4 text-center ${s.color}`}>
              <div className="text-2xl font-bold">{s.count}</div>
              <div className="text-xs mt-1">{s.label}</div>
            </div>
          ))}
        </div>
        {Object.entries(bySubject).map(([subject, subTopics]: [string, any]) => (
          <div key={subject} className="bg-white rounded-2xl border border-gray-100 p-5">
            <h3 className="font-semibold text-gray-900 mb-3">
              {subject} <span className="text-xs text-gray-400 font-normal">({subTopics.filter((t: any) => t.status === 'confident').length}/{subTopics.length} confident)</span>
            </h3>
            <div className="grid grid-cols-8 sm:grid-cols-10 gap-1.5">
              {subTopics.map((t: any) => (
                <div key={t.id} title={t.title} className={`aspect-square rounded-lg ${statusColor(t.status)}`} />
              ))}
            </div>
          </div>
        ))}
        {enriched.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <div className="text-4xl mb-3">🗺️</div>
            <p>{child?.name} hasn't swiped any topics yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}
