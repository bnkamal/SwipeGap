import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function ParentChildGaps({ params }: { params: { childId: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: link } = await supabase.from('parent_links').select('id')
    .eq('parent_user_id', user.id).eq('student_user_id', params.childId).single()
  if (!link) redirect('/dashboard/parent')

  const { data: child } = await supabase.from('student_profiles').select('*').eq('user_id', params.childId).single()
  const { data: gaps } = await supabase.from('swipe_events')
    .select('topic_id, topics(title, subject, grade, exam_tag)')
    .eq('student_id', params.childId).eq('direction', 'left')
    .order('created_at', { ascending: false })

  const uniqueGaps = (gaps || []).filter((g: any, i: number, arr: any[]) =>
    arr.findIndex((x: any) => x.topic_id === g.topic_id) === i
  )

  const bySubject = uniqueGaps.reduce((acc: Record<string, any[]>, g: any) => {
    const subj = (g.topics as any)?.subject || 'Unknown'
    if (!acc[subj]) acc[subj] = []
    acc[subj].push(g)
    return acc
  }, {})

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100 px-4 py-4 mb-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <a href="/dashboard/parent" className="text-gray-400 hover:text-gray-600 text-sm">← Parent Dashboard</a>
          <img src="/logo.png" alt="SwipeGap" style={{width:"120px", height:"auto"}} />
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-4 pb-8 space-y-6">
        <div className="bg-gradient-to-r from-red-500 to-red-700 rounded-2xl p-5 text-white">
          <h1 className="text-xl font-bold">{child?.name}'s Gap Analysis</h1>
          <p className="text-sm opacity-75 mt-1">{uniqueGaps.length} knowledge gaps identified</p>
        </div>
        {uniqueGaps.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <div className="text-4xl mb-3">✅</div>
            <p>{child?.name} has no gaps yet — start swiping!</p>
          </div>
        ) : Object.entries(bySubject).map(([subject, items]: [string, any]) => (
          <div key={subject} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="px-5 py-3 bg-red-50 border-b border-red-100">
              <h3 className="font-semibold text-red-800">{subject} <span className="text-xs font-normal text-red-500">({items.length} gaps)</span></h3>
            </div>
            <div className="divide-y divide-gray-50">
              {items.map((g: any, i: number) => (
                <div key={i} className="px-5 py-3 flex items-center justify-between">
                  <p className="text-sm text-gray-800">{(g.topics as any)?.title}</p>
                  <span className="text-xs bg-red-50 text-red-600 px-2 py-1 rounded-lg">{(g.topics as any)?.exam_tag}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
