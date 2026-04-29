import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Topic } from '@/lib/supabase/types'

interface PageProps { params: Promise<{ token: string }> }

type CellStatus = 'confident' | 'needs-help' | 'mixed' | 'unswiped'
const STATUS_COLORS: Record<CellStatus, string> = {
  'confident':  'bg-green-500',
  'needs-help': 'bg-red-500',
  'mixed':      'bg-amber-400',
  'unswiped':   'bg-gray-200',
}

export default async function SharedHeatmapPage({ params }: PageProps) {
  const { token } = await params

  // Decode and validate token
  let studentId: string
  try {
    const decoded = JSON.parse(Buffer.from(token, 'base64url').toString())
    if (decoded.expires < Date.now()) notFound()
    studentId = decoded.student_id
  } catch {
    notFound()
  }

  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('student_profiles').select('name, grade, subjects').eq('user_id', studentId).single()

  if (!profile) notFound()

  const { data: allTopics } = await supabase
    .from('topics').select('*').eq('grade', profile.grade)
    .in('subject', profile.subjects ?? []).order('subject')

  const { data: swipeEvents } = await supabase
    .from('swipe_events').select('topic_id, direction, created_at')
    .eq('student_id', studentId).order('created_at', { ascending: false })

  const swipeMap = (swipeEvents || []).reduce((acc: Record<string, {direction:string; created_at:string}[]>, e) => {
    if (!acc[e.topic_id]) acc[e.topic_id] = []
    acc[e.topic_id].push(e)
    return acc
  }, {})

  function getStatus(topicId: string): CellStatus {
    const swipes = swipeMap[topicId] || []
    if (!swipes.length) return 'unswiped'
    const days = Math.floor((Date.now() - new Date(swipes[0].created_at).getTime()) / 86400000)
    if (days > 14) return 'mixed'
    const rights = swipes.filter(s => s.direction === 'right').length
    const lefts  = swipes.filter(s => s.direction === 'left').length
    if (lefts > 0 && rights > 0) return 'mixed'
    if (lefts > 0) return 'needs-help'
    return 'confident'
  }

  const bySubject = (allTopics || []).reduce((acc: Record<string, Topic[]>, t) => {
    if (!acc[t.subject]) acc[t.subject] = []
    acc[t.subject].push(t)
    return acc
  }, {})

  const total     = (allTopics || []).length
  const confident = (allTopics || []).filter(t => getStatus(t.id) === 'confident').length
  const needsHelp = (allTopics || []).filter(t => getStatus(t.id) === 'needs-help').length

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-brand-blue rounded-xl flex items-center justify-center text-white font-bold text-lg">
              {profile.name?.charAt(0)}
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{profile.name}'s Knowledge Heatmap</h1>
              <p className="text-sm text-gray-500">{profile.grade} · Shared read-only view</p>
            </div>
          </div>
          <div className="flex gap-4 text-sm">
            <span className="text-green-600 font-medium">{confident} confident</span>
            <span className="text-red-600 font-medium">{needsHelp} need study</span>
            <span className="text-gray-400">{total - confident - needsHelp} other</span>
          </div>
        </div>

        {Object.entries(bySubject).map(([subject, subjectTopics]) => (
          <div key={subject} className="bg-white rounded-2xl border border-gray-100 p-5 mb-4">
            <h2 className="font-semibold text-gray-900 mb-3">{subject}</h2>
            <div className="grid grid-cols-8 md:grid-cols-12 gap-1.5">
              {subjectTopics.map(topic => (
                <div key={topic.id} title={topic.title}
                  className={`aspect-square rounded-md ${STATUS_COLORS[getStatus(topic.id)]}`} />
              ))}
            </div>
          </div>
        ))}

        <div className="flex gap-4 justify-center mt-4 text-xs text-gray-400">
          {[
            { color: 'bg-green-500',  label: 'Confident' },
            { color: 'bg-red-500',    label: 'Needs study' },
            { color: 'bg-amber-400',  label: 'Mixed' },
            { color: 'bg-gray-200',   label: 'Unswiped' },
          ].map(i => (
            <div key={i.label} className="flex items-center gap-1.5">
              <div className={`w-3 h-3 rounded-sm ${i.color}`} />
              {i.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
