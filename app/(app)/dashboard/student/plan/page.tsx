'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type PlanStatus = 'pending' | 'in_progress' | 'resolved'
type Priority = 'High' | 'Medium' | 'Low'
interface PlanItem {
  id: string; topic_id: string; status: PlanStatus; priority: number
  priority_level?: Priority; priority_reason?: string
  topic: { id: string; title: string; subject: string; exam_tag: string; grade: string }
}

export default function LearningPlanPage() {
  const router = useRouter()
  const supabase = createClient()
  const [items, setItems] = useState<PlanItem[]>([])
  const [loading, setLoading] = useState(true)
  const [prioritising, setPrioritising] = useState(false)
  const [aiMsg, setAiMsg] = useState('')
  const [filter, setFilter] = useState<'all'|PlanStatus>('all')
  const [profile, setProfile] = useState<any>(null)

  const loadPlan = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data: prof } = await supabase.from('student_profiles').select('*').eq('user_id', user.id).single()
    setProfile(prof)
    const { data: planItems } = await supabase.from('learning_plans').select('*, topic:topics(*)').eq('student_id', user.id).order('priority', { ascending: false })
    if (planItems) {
      setItems(planItems.map(item => ({
        ...item,
        priority_level: (item.priority >= 70 ? 'High' : item.priority >= 40 ? 'Medium' : 'Low') as Priority
      })))
    }
    setLoading(false)
  }, [])

  useEffect(() => { loadPlan() }, [loadPlan])

  useEffect(() => {
    const channel = supabase.channel('plan-rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'learning_plans' }, () => loadPlan())
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [loadPlan])

  async function updateStatus(itemId: string, newStatus: PlanStatus) {
    await supabase.from('learning_plans').update({ status: newStatus }).eq('id', itemId)
    setItems(prev => prev.map(i => i.id === itemId ? { ...i, status: newStatus } : i))
    if (newStatus === 'resolved') {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) await supabase.from('xp_log').insert({ student_id: user.id, action: 'gap_closed', points: 50 })
    }
  }

  async function runAI() {
    setPrioritising(true)
    setAiMsg('Asking Claude to prioritise your topics...')
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || items.length === 0) { setAiMsg('No topics to prioritise'); setPrioritising(false); return }
      const res = await fetch('/api/ai/prioritise-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topics: items.map(i => ({ id: i.topic_id, title: i.topic.title, subject: i.topic.subject, exam_tag: i.topic.exam_tag })),
          grade: profile?.grade,
          examTargets: profile?.exam_targets,
        })
      })
      const { priorities } = await res.json()
      if (priorities && priorities.length > 0) {
        for (const p of priorities) {
          await supabase.from('learning_plans').update({ priority: p.score }).eq('topic_id', p.id).eq('student_id', user.id)
        }
        setItems(prev => prev.map(item => {
          const p = priorities.find((x: any) => x.id === item.topic_id)
          if (!p) return item
          return { ...item, priority: p.score, priority_level: p.level as Priority, priority_reason: p.reason }
        }).sort((a, b) => b.priority - a.priority))
        setAiMsg('Topics prioritised by Claude!')
        setTimeout(() => setAiMsg(''), 3000)
      } else {
        setAiMsg('AI unavailable - check ANTHROPIC_API_KEY in .env.local')
        setTimeout(() => setAiMsg(''), 5000)
      }
    } catch(e) {
      setAiMsg('AI error - check your Anthropic API key in .env.local')
      setTimeout(() => setAiMsg(''), 5000)
    }
    setPrioritising(false)
  }

  const filtered = filter === 'all' ? items : items.filter(i => i.status === filter)
  const counts = {
    pending: items.filter(i => i.status === 'pending').length,
    in_progress: items.filter(i => i.status === 'in_progress').length,
    resolved: items.filter(i => i.status === 'resolved').length,
  }
  const PRIORITY_BG: Record<string, string> = {
    High: 'bg-red-100 text-red-700',
    Medium: 'bg-amber-100 text-amber-700',
    Low: 'bg-blue-100 text-blue-700'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100 sticky top-0 z-30">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/dashboard/student')} className="p-2 rounded-lg hover:bg-gray-100 text-gray-600">←</button>
            <div>
              <h1 className="text-lg font-bold text-gray-900">My Learning Plan</h1>
              <p className="text-xs text-gray-500">{items.length} topics to study</p>
            </div>
          </div>
          <button onClick={runAI} disabled={prioritising} className="bg-brand-teal text-white text-sm px-4 py-2 rounded-xl hover:bg-teal-700 disabled:opacity-50 font-medium">
            {prioritising ? 'Asking AI...' : 'AI prioritise'}
          </button>
        </div>
        {aiMsg && (
          <div className="max-w-3xl mx-auto px-4 pb-2">
            <div className="bg-teal-50 border border-teal-200 rounded-lg px-3 py-2 text-sm text-teal-700">{aiMsg}</div>
          </div>
        )}
      </div>
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-5">
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-gray-50 rounded-xl p-3 text-center"><div className="text-xl font-bold text-gray-700">{counts.pending}</div><div className="text-xs text-gray-500">To study</div></div>
          <div className="bg-amber-50 rounded-xl p-3 text-center"><div className="text-xl font-bold text-amber-600">{counts.in_progress}</div><div className="text-xs text-gray-500">In progress</div></div>
          <div className="bg-green-50 rounded-xl p-3 text-center"><div className="text-xl font-bold text-green-600">{counts.resolved}</div><div className="text-xs text-gray-500">Resolved</div></div>
        </div>
        <div className="flex gap-2 flex-wrap">
          {(['all','pending','in_progress','resolved'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${filter===f?'bg-brand-blue text-white':'bg-white border border-gray-200 text-gray-600'}`}>
              {f==='all'?'All':f==='in_progress'?'In progress':f.charAt(0).toUpperCase()+f.slice(1)}
            </button>
          ))}
        </div>
        {loading ? (
          <div className="space-y-3">{[1,2,3].map(i=><div key={i} className="h-24 bg-gray-200 animate-pulse rounded-xl"/>)}</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
            <div className="text-4xl mb-3">📋</div>
            <h3 className="font-medium text-gray-700 mb-1">{items.length===0?'No gaps yet':'No items match'}</h3>
            <p className="text-sm text-gray-400 mb-4">{items.length===0?'Swipe topics to build your plan':'Try a different filter'}</p>
            {items.length===0&&<button onClick={()=>router.push('/swipe')} className="bg-brand-blue text-white px-4 py-2 rounded-xl text-sm">Start swiping</button>}
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(item => (
              <div key={item.id} className={`bg-white rounded-xl border-2 p-4 transition-all ${item.status==='resolved'?'border-green-200 opacity-75':item.status==='in_progress'?'border-amber-300':'border-gray-100'}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-sm">{item.status==='resolved'?'✅':item.status==='in_progress'?'⏳':'📌'}</span>
                      <h3 className={`font-semibold text-sm ${item.status==='resolved'?'line-through text-gray-400':'text-gray-900'}`}>{item.topic.title}</h3>
                      {item.priority_level&&<span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PRIORITY_BG[item.priority_level]}`}>{item.priority_level}</span>}
                    </div>
                    <div className="flex flex-wrap gap-1.5 text-xs">
                      <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{item.topic.subject}</span>
                      <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded">{item.topic.exam_tag}</span>
                    </div>
                    {item.priority_reason&&<p className="text-xs text-gray-400 italic mt-1">{item.priority_reason}</p>}
                  </div>
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    {item.status==='pending'&&(
                      <button onClick={()=>updateStatus(item.id,'in_progress')} className="text-xs px-3 py-1.5 rounded-lg font-medium border-2 border-amber-400 text-amber-600 hover:bg-amber-50 whitespace-nowrap">
                        Start studying
                      </button>
                    )}
                    {item.status==='in_progress'&&(
                      <button onClick={()=>updateStatus(item.id,'resolved')} className="text-xs px-3 py-1.5 rounded-lg font-medium border-2 border-green-500 text-green-600 hover:bg-green-50 whitespace-nowrap">
                        Mark resolved
                      </button>
                    )}
                    {item.status==='resolved'&&(
                      <button onClick={()=>updateStatus(item.id,'pending')} className="text-xs px-3 py-1.5 rounded-lg font-medium border border-gray-300 text-gray-500 hover:bg-gray-50 whitespace-nowrap">
                        Re-open
                      </button>
                    )}
                    {item.status!=='resolved'&&(
                      <button onClick={()=>router.push('/mentors?subject='+encodeURIComponent(item.topic.subject)+'&topic='+encodeURIComponent(item.topic.title))} className="text-xs px-3 py-1.5 rounded-lg font-medium bg-brand-blue text-white hover:bg-blue-800 whitespace-nowrap">
                        Find mentor
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
