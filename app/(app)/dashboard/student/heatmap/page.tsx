'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { HeatmapCell } from '@/components/heatmap/HeatmapCell'
import { CoverageRing } from '@/components/heatmap/CoverageRing'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Elements'
import { Share2, ArrowLeft, Filter } from 'lucide-react'
import type { Topic } from '@/lib/supabase/types'

type CellStatus = 'confident' | 'needs-help' | 'mixed' | 'unswiped'

interface TopicWithStatus extends Topic {
  status: CellStatus
  lastSwiped?: string
}

interface SwipeEvent {
  topic_id: string
  direction: 'left' | 'right'
  created_at: string
}

export default function HeatmapPage() {
  const router = useRouter()
  const supabase = createClient()

  const [topics, setTopics] = useState<TopicWithStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [filterSubject, setFilterSubject] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [shareUrl, setShareUrl] = useState('')
  const [copied, setCopied] = useState(false)
  const [subjects, setSubjects] = useState<string[]>([])
  const [userId, setUserId] = useState<string>('')

  // Compute status from swipe history
  function computeStatus(swipes: SwipeEvent[]): { status: CellStatus; lastSwiped?: string } {
    if (!swipes || swipes.length === 0) return { status: 'unswiped' }

    const latest = swipes[0]
    const latestDate = new Date(latest.created_at)
    const daysSince = Math.floor((Date.now() - latestDate.getTime()) / 86400000)

    // If latest swipe is old (>14 days), mark amber regardless
    if (daysSince > 14) return { status: 'mixed', lastSwiped: latest.created_at }

    const rights = swipes.filter(s => s.direction === 'right').length
    const lefts  = swipes.filter(s => s.direction === 'left').length

    if (lefts > 0 && rights > 0) return { status: 'mixed',      lastSwiped: latest.created_at }
    if (lefts > 0)               return { status: 'needs-help', lastSwiped: latest.created_at }
    return                              { status: 'confident',   lastSwiped: latest.created_at }
  }

  const loadHeatmap = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    setUserId(user.id)

    const { data: profile } = await supabase
      .from('student_profiles').select('*').eq('user_id', user.id).single()
    if (!profile) return

    // Load all relevant topics
    const { data: allTopics } = await supabase
      .from('topics').select('*')
      .eq('grade', profile.grade)
      .in('subject', profile.subjects ?? [])
      .order('subject')

    if (!allTopics) { setLoading(false); return }

    // Load all swipe events for this student
    const { data: swipeEvents } = await supabase
      .from('swipe_events')
      .select('topic_id, direction, created_at')
      .eq('student_id', user.id)
      .order('created_at', { ascending: false })

    // Group swipes by topic_id
    const swipesByTopic = (swipeEvents || []).reduce((acc: Record<string, SwipeEvent[]>, e) => {
      if (!acc[e.topic_id]) acc[e.topic_id] = []
      acc[e.topic_id].push(e)
      return acc
    }, {})

    // Build topics with status
    const enriched: TopicWithStatus[] = allTopics.map(topic => {
      const topicSwipes = swipesByTopic[topic.id] || []
      const { status, lastSwiped } = computeStatus(topicSwipes)
      return { ...topic, status, lastSwiped }
    })

    setTopics(enriched)
    setSubjects(Array.from(new Set(allTopics.map(t => t.subject))))
    setLoading(false)
  }, [])

  useEffect(() => { loadHeatmap() }, [loadHeatmap])

  // ── REALTIME SUBSCRIPTION ──────────────────────────────────
  useEffect(() => {
    if (!userId) return

    const channel = supabase
      .channel('heatmap-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'swipe_events',
          filter: `student_id=eq.${userId}`,
        },
        (payload) => {
          // Update the specific topic's status in real time
          const { topic_id, direction, created_at } = payload.new as SwipeEvent

          setTopics(prev => prev.map(topic => {
            if (topic.id !== topic_id) return topic

            // Determine new status based on this swipe
            let newStatus: CellStatus
            if (topic.status === 'unswiped') {
              newStatus = direction === 'right' ? 'confident' : 'needs-help'
            } else if (topic.status === 'confident' && direction === 'left') {
              newStatus = 'mixed'
            } else if (topic.status === 'needs-help' && direction === 'right') {
              newStatus = 'mixed'
            } else {
              newStatus = topic.status
            }

            return { ...topic, status: newStatus, lastSwiped: created_at }
          }))
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [userId])

  async function handleShare() {
    try {
      const res = await fetch('/api/heatmap/share', { method: 'POST' })
      const { shareUrl: url } = await res.json()
      setShareUrl(url)
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 3000)
    } catch {
      console.error('Share failed')
    }
  }

  // Filter topics
  const filtered = topics.filter(t => {
    if (filterSubject !== 'all' && t.subject !== filterSubject) return false
    if (filterStatus !== 'all' && t.status !== filterStatus) return false
    return true
  })

  // Group by subject
  const bySubject = filtered.reduce((acc: Record<string, TopicWithStatus[]>, t) => {
    if (!acc[t.subject]) acc[t.subject] = []
    acc[t.subject].push(t)
    return acc
  }, {})

  // Stats for ring
  const stats = {
    confident: topics.filter(t => t.status === 'confident').length,
    needsHelp: topics.filter(t => t.status === 'needs-help').length,
    mixed:     topics.filter(t => t.status === 'mixed').length,
    unswiped:  topics.filter(t => t.status === 'unswiped').length,
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard/student')}>
              <ArrowLeft size={18} />
            </Button>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Knowledge Heatmap</h1>
              <p className="text-xs text-gray-500">{topics.length} topics · updates in real time</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={handleShare}>
            <Share2 size={16} className="mr-1.5" />
            {copied ? 'Copied!' : 'Share'}
          </Button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Coverage ring */}
        {!loading && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col md:flex-row items-center gap-6">
            <CoverageRing
              confident={stats.confident}
              needsHelp={stats.needsHelp}
              mixed={stats.mixed}
              unswiped={stats.unswiped}
            />
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-xl font-bold text-gray-900 mb-1">Your knowledge landscape</h2>
              <p className="text-gray-500 text-sm">
                {stats.confident > 0
                  ? `You're confident on ${stats.confident} topic${stats.confident !== 1 ? 's' : ''}.`
                  : 'Start swiping to build your map.'}
                {stats.needsHelp > 0 ? ` ${stats.needsHelp} need${stats.needsHelp !== 1 ? '' : 's'} work.` : ''}
                {stats.unswiped > 0 ? ` ${stats.unswiped} still unswiped.` : ''}
              </p>
              {stats.unswiped > 0 && (
                <Button variant="primary" size="sm" className="mt-3" onClick={() => router.push('/swipe')}>
                  Swipe {stats.unswiped} more topics →
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex items-center gap-1.5 text-sm text-gray-500">
              <Filter size={14} /> Filter:
            </div>
            <div className="flex flex-wrap gap-2">
              {['all', ...subjects].map(s => (
                <button key={s} onClick={() => setFilterSubject(s)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${filterSubject === s ? 'bg-brand-blue text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                  {s === 'all' ? 'All subjects' : s}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-2 ml-auto">
              {[
                { val: 'all',        label: 'All' },
                { val: 'confident',  label: '✓ Confident' },
                { val: 'needs-help', label: '📌 Needs study' },
                { val: 'mixed',      label: '⚡ Mixed' },
                { val: 'unswiped',   label: '○ Unswiped' },
              ].map(f => (
                <button key={f.val} onClick={() => setFilterStatus(f.val)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${filterStatus === f.val ? 'bg-brand-teal text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Heatmap grid — grouped by subject */}
        {loading ? (
          <div className="grid grid-cols-8 gap-2">
            {Array.from({ length: 32 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded-lg" />
            ))}
          </div>
        ) : Object.keys(bySubject).length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <div className="text-4xl mb-3">🗺️</div>
            <p className="font-medium">No topics match your filter</p>
            <p className="text-sm mt-1">Try changing the subject or status filter</p>
          </div>
        ) : (
          Object.entries(bySubject).map(([subject, subjectTopics]) => (
            <div key={subject} className="bg-white rounded-2xl border border-gray-100 p-5">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span>{subject}</span>
                <span className="text-xs text-gray-400 font-normal">
                  ({subjectTopics.filter(t => t.status === 'confident').length}/{subjectTopics.length} confident)
                </span>
              </h3>
              <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2">
                {subjectTopics.map(topic => (
                  <HeatmapCell
                    key={topic.id}
                    title={topic.title}
                    subject={topic.subject}
                    grade={topic.grade}
                    subtopics={topic.subtopics}
                    status={topic.status}
                    lastSwiped={topic.lastSwiped}
                    onClick={() => router.push(`/swipe?topic=${topic.id}`)}
                  />
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
