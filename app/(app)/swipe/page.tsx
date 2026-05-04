'use client'
import { Suspense } from 'react'
import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { SwipeCard } from '@/components/swipe/SwipeCard'
import { MicroQuiz } from '@/components/swipe/MicroQuiz'
import { SessionSummary } from '@/components/swipe/SessionSummary'
import { Button } from '@/components/ui/Button'
import { ProgressBar } from '@/components/ui/Elements'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import type { Topic } from '@/lib/supabase/types'

type SessionMode = 'quick' | 'deep' | 'full'
type Phase = 'filter-select' | 'mode-select' | 'swiping' | 'quiz' | 'summary'

const MODE_LIMITS: Record<SessionMode, number> = { quick: 10, deep: 50, full: 9999 }

interface SwipeRecord { topic_id: string; direction: 'left' | 'right' }
interface QuizQuestion { id: string; question: string; options: string[]; correct: number; explanation: string }

function SwipePage() {
  const router = useRouter()
  const supabase = createClient()

  const [phase, setPhase] = useState<Phase>('filter-select')
  const [mode, setMode] = useState<SessionMode>('quick')
  const [allTopics, setAllTopics] = useState<Topic[]>([])
  const [topics, setTopics] = useState<Topic[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [swipeLog, setSwipeLog] = useState<SwipeRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [quizTopicId, setQuizTopicId] = useState<string | null>(null)
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([])
  const [quizFlips, setQuizFlips] = useState(0)
  const [currentStreak, setCurrentStreak] = useState(0)
  const [profile, setProfile] = useState<any>(null)

  // Filter state
  const [filterSubject, setFilterSubject] = useState('all')
  const [filterGrade, setFilterGrade] = useState('all')
  const [filterCurriculum, setFilterCurriculum] = useState('all')
  const [filterExam, setFilterExam] = useState('all')
  const [useProfileDefaults, setUseProfileDefaults] = useState(true)

  const rightSwipeCluster = useRef<Record<string, number>>({})

  // Keyboard support
  useEffect(() => {
    if (phase !== 'swiping') return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowLeft')  handleSwipe('left')
      if (e.key === 'ArrowRight') handleSwipe('right')
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [phase, currentIndex, topics])

  useEffect(() => { loadAllTopics() }, [])

  async function loadAllTopics() {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: prof } = await supabase.from('student_profiles').select('*').eq('user_id', user.id).single()
    if (!prof) { router.push('/onboarding/student'); return }
    setProfile(prof)

    // Load ALL topics (not filtered by profile)
    const { data: all } = await supabase.from('topics').select('*').order('subject').limit(500)
    setAllTopics(all || [])

    // Set default filters from profile
    if (prof.grade) setFilterGrade(prof.grade)
    if (prof.subjects?.length > 0) setFilterSubject(prof.subjects[0])

    setLoading(false)
  }

  // Derived filter options from ALL topics
  const subjects = ['all', ...Array.from(new Set(allTopics.map((t:any) => t.subject).filter(Boolean))).sort()]
  const grades = ['all', ...Array.from(new Set(allTopics.map((t:any) => t.grade).filter(Boolean))).sort()]
  const curriculums = ['all', ...Array.from(new Set(allTopics.map((t:any) => t.curriculum).filter(Boolean))).sort()]
  const exams = ['all', ...Array.from(new Set(allTopics.map((t:any) => t.exam_tag).filter(Boolean))).sort()]

  function getFilteredTopics() {
    return allTopics.filter((t: any) => {
      if (filterSubject !== 'all' && t.subject !== filterSubject) return false
      if (filterGrade !== 'all' && t.grade !== filterGrade) return false
      if (filterCurriculum !== 'all' && t.curriculum !== filterCurriculum) return false
      if (filterExam !== 'all' && t.exam_tag !== filterExam) return false
      return true
    })
  }

  function applyProfileDefaults() {
    if (profile?.grade) setFilterGrade(profile.grade)
    if (profile?.subjects?.length > 0) setFilterSubject(profile.subjects[0])
    setFilterCurriculum('all')
    setFilterExam('all')
  }

  function clearFilters() {
    setFilterSubject('all')
    setFilterGrade('all')
    setFilterCurriculum('all')
    setFilterExam('all')
  }

  async function proceedToModeSelect() {
    const filtered = getFilteredTopics()
    // AI personalise order
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data: recentSwipes } = await supabase
      .from('swipe_events')
      .select('topic_id, direction, topics(title)')
      .eq('student_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20)

    try {
      const res = await fetch('/api/ai/personalise-cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topics: filtered,
          studentProfile: profile,
          swipeHistory: recentSwipes?.map((s:any) => ({
            title: s.topics?.title || '',
            direction: s.direction,
          })),
        }),
      })
      const { orderedIds } = await res.json()
      if (orderedIds?.length > 0) {
        const ordered = orderedIds.map((id: string) => filtered.find((t:any) => t.id === id)).filter(Boolean) as Topic[]
        setTopics(ordered)
      } else {
        setTopics(filtered)
      }
    } catch {
      setTopics(filtered)
    }
    setPhase('mode-select')
  }

  function startSession(selectedMode: SessionMode) {
    setMode(selectedMode)
    const limit = MODE_LIMITS[selectedMode]
    setTopics(prev => prev.slice(0, limit === 9999 ? prev.length : limit))
    setPhase('swiping')
  }

  const handleSwipe = useCallback(async (direction: 'left' | 'right') => {
    if (currentIndex >= topics.length) return
    const topic = topics[currentIndex]
    const newLog = [...swipeLog, { topic_id: topic.id, direction }]
    setSwipeLog(newLog)

    if (direction === 'right') {
      const cluster = rightSwipeCluster.current
      cluster[topic.subject] = (cluster[topic.subject] || 0) + 1
      if (cluster[topic.subject] % 5 === 0) {
        setQuizTopicId(topic.id)
        try {
          const res = await fetch('/api/ai/generate-quiz', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ topic }),
          })
          const data = await res.json()
          if (data.questions?.length > 0) {
            setQuizQuestions(data.questions)
            setPhase('quiz')
            return
          }
        } catch { }
      }
    }
    advanceCard()
  }, [currentIndex, topics, swipeLog])

  function advanceCard() {
    const nextIndex = currentIndex + 1
    setCurrentIndex(nextIndex)
    if (nextIndex >= topics.length) finishSession()
  }

  function handleQuizComplete(passed: boolean) {
    if (!passed && quizTopicId) {
      setSwipeLog(prev => prev.map((s, i) =>
        i === prev.length - 1 && s.topic_id === quizTopicId ? { ...s, direction: 'left' } : s
      ))
      setQuizFlips(f => f + 1)
    }
    setQuizTopicId(null)
    setQuizQuestions([])
    setPhase('swiping')
    advanceCard()
  }

  async function finishSession() {
    try {
      await fetch('/api/swipe/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ swipes: swipeLog }),
      })
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: streak } = await supabase.from('streaks').select('current_streak').eq('student_id', user.id).single()
        setCurrentStreak(streak?.current_streak ?? 1)
      }
    } catch (e) { console.error('Failed to save session:', e) }
    setPhase('summary')
  }

  const rightCount = swipeLog.filter(s => s.direction === 'right').length
  const leftCount = swipeLog.filter(s => s.direction === 'left').length
  const progress = topics.length > 0 ? (currentIndex / topics.length) * 100 : 0
  const remaining = topics.length - currentIndex
  const visibleCards = topics.slice(currentIndex, currentIndex + 3)
  const filteredCount = getFilteredTopics().length

  // ── FILTER SELECT ────────────────────────────────────────────
  if (phase === 'filter-select') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
          <div className="text-center mb-6">
            <div className="text-5xl mb-3">🎯</div>
            <h1 className="text-2xl font-bold text-gray-900">Choose your topics</h1>
            <p className="text-gray-500 text-sm mt-1">Filter topics or use your profile defaults</p>
          </div>

          {loading ? (
            <div className="text-center py-8 text-gray-400">Loading topics…</div>
          ) : (
            <div className="space-y-4">
              {/* Quick preset buttons */}
              <div className="flex gap-2">
                <button onClick={applyProfileDefaults}
                  className="flex-1 text-xs bg-brand-blue text-white px-3 py-2 rounded-xl font-medium">
                  📚 My Profile Defaults
                </button>
                <button onClick={clearFilters}
                  className="flex-1 text-xs border border-gray-200 text-gray-600 px-3 py-2 rounded-xl">
                  🌐 Show All Topics
                </button>
              </div>

              {/* Filter dropdowns */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Subject</label>
                  <select value={filterSubject} onChange={e => setFilterSubject(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-brand-blue">
                    {subjects.map(s => <option key={s} value={s}>{s === 'all' ? 'All Subjects' : s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Grade</label>
                  <select value={filterGrade} onChange={e => setFilterGrade(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-brand-blue">
                    {grades.map(g => <option key={g} value={g}>{g === 'all' ? 'All Grades' : g}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Curriculum</label>
                  <select value={filterCurriculum} onChange={e => setFilterCurriculum(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-brand-blue">
                    {curriculums.map(c => <option key={c} value={c}>{c === 'all' ? 'All Curriculums' : c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Exam</label>
                  <select value={filterExam} onChange={e => setFilterExam(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-brand-blue">
                    {exams.map(e => <option key={e} value={e}>{e === 'all' ? 'All Exams' : e}</option>)}
                  </select>
                </div>
              </div>

              {/* Matched topics count */}
              <div className={'text-center py-3 rounded-xl text-sm font-medium ' + (filteredCount > 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600')}>
                {filteredCount > 0 ? `✅ ${filteredCount} topics matched` : '⚠️ No topics match — try different filters'}
              </div>

              <button
                onClick={proceedToModeSelect}
                disabled={filteredCount === 0}
                className="w-full bg-brand-blue text-white py-3 rounded-xl font-semibold disabled:opacity-50">
                Continue →
              </button>

              <Button variant="ghost" size="md" className="w-full" onClick={() => router.push('/dashboard/student')}>
                ← Back to dashboard
              </Button>
            </div>
          )}
        </div>
      </div>
    )
  }

  // ── SUMMARY ──────────────────────────────────────────────────
  if (phase === 'summary') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md" style={{ height: '600px' }}>
          <SessionSummary
            totalCards={swipeLog.length}
            rightSwipes={rightCount}
            leftSwipes={leftCount}
            quizFlips={quizFlips}
            xpEarned={10}
            streakDay={currentStreak}
          />
        </div>
      </div>
    )
  }

  // ── MODE SELECT ──────────────────────────────────────────────
  if (phase === 'mode-select') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
          <div className="text-center mb-8">
            <div className="text-5xl mb-4">👆</div>
            <h1 className="text-2xl font-bold text-gray-900">Start swiping</h1>
            <p className="text-gray-500 text-sm mt-1">Choose how deep you want to go today</p>
            <p className="text-xs text-brand-blue mt-1 font-medium">{topics.length} topics ready</p>
          </div>
          <div className="space-y-3">
            {([
              { mode: 'quick' as SessionMode, emoji: '⚡', label: 'Quick Swipe', desc: '10 cards · ~3 minutes', color: 'border-green-200 hover:border-green-400 hover:bg-green-50' },
              { mode: 'deep'  as SessionMode, emoji: '🔍', label: 'Deep Scan',   desc: '50 cards · ~12 minutes', color: 'border-blue-200 hover:border-blue-400 hover:bg-blue-50' },
              { mode: 'full'  as SessionMode, emoji: '🎯', label: 'Full Assessment', desc: `${topics.length} cards · all filtered topics`, color: 'border-purple-200 hover:border-purple-400 hover:bg-purple-50' },
            ]).map(opt => (
              <button key={opt.mode} onClick={() => startSession(opt.mode)}
                className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${opt.color}`}>
                <span className="text-3xl">{opt.emoji}</span>
                <div>
                  <p className="font-semibold text-gray-900">{opt.label}</p>
                  <p className="text-sm text-gray-500">{opt.desc}</p>
                </div>
              </button>
            ))}
          </div>
          <button onClick={() => setPhase('filter-select')} className="w-full mt-4 text-sm text-gray-500 hover:text-gray-700 underline">
            ← Change filters
          </button>
        </div>
      </div>
    )
  }

  // ── SWIPING / QUIZ ───────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex flex-col">
      <div className="bg-white border-b border-gray-100 px-4 py-3">
        <div className="max-w-md mx-auto flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard/student')}>
            <X size={18} />
          </Button>
          <div className="flex-1">
            <ProgressBar value={progress} color="blue" />
            <p className="text-xs text-gray-400 mt-1 text-center">{remaining} cards remaining</p>
          </div>
          <div className="flex gap-2 text-xs font-medium">
            <span className="text-green-600">✓ {rightCount}</span>
            <span className="text-red-500">✗ {leftCount}</span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="relative w-full max-w-sm" style={{ height: '440px' }}>
          <AnimatePresence mode="popLayout">
            {phase === 'quiz' && quizQuestions.length > 0 ? (
              <motion.div key="quiz" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                className="absolute inset-0 bg-white rounded-2xl shadow-xl border-2 border-brand-orange overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-1 bg-brand-orange" />
                <MicroQuiz
                  topic={topics[currentIndex - 1] || topics[0]}
                  questions={quizQuestions}
                  onComplete={handleQuizComplete}
                />
              </motion.div>
            ) : (
              visibleCards.map((topic, i) => (
                <SwipeCard
                  key={topic.id}
                  topic={topic}
                  onSwipe={i === 0 ? handleSwipe : () => {}}
                  isTop={i === 0}
                  index={i}
                />
              ))
            )}
          </AnimatePresence>
        </div>
      </div>

      {phase === 'swiping' && (
        <div className="pb-8 flex justify-center gap-8">
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => handleSwipe('left')}
            className="w-16 h-16 rounded-full bg-white border-2 border-red-300 shadow-lg flex items-center justify-center hover:border-red-500 hover:bg-red-50 transition-all">
            <ChevronLeft size={28} className="text-red-500" />
          </motion.button>
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => handleSwipe('right')}
            className="w-16 h-16 rounded-full bg-white border-2 border-green-300 shadow-lg flex items-center justify-center hover:border-green-500 hover:bg-green-50 transition-all">
            <ChevronRight size={28} className="text-green-500" />
          </motion.button>
        </div>
      )}
      <p className="hidden md:block text-center text-xs text-gray-300 pb-4">← Arrow keys to swipe →</p>
    </div>
  )
}

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-gray-400">Loading...</div>}>
      <SwipePage />
    </Suspense>
  )
}
