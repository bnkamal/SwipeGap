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
type Phase = 'mode-select' | 'swiping' | 'quiz' | 'summary'

const MODE_LIMITS: Record<SessionMode, number> = { quick: 10, deep: 50, full: 9999 }

interface SwipeRecord { topic_id: string; direction: 'left' | 'right' }
interface QuizQuestion { id: string; question: string; options: string[]; correct: number; explanation: string }

function SwipePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  const [phase, setPhase] = useState<Phase>('mode-select')
  const [mode, setMode] = useState<SessionMode>('quick')
  const [topics, setTopics] = useState<Topic[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [swipeLog, setSwipeLog] = useState<SwipeRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [quizTopicId, setQuizTopicId] = useState<string | null>(null)
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([])
  const [quizFlips, setQuizFlips] = useState(0)
  const [currentStreak, setCurrentStreak] = useState(0)
  const [sessionStarted, setSessionStarted] = useState(false)

  // Track consecutive right-swipes per subject for Dunning-Kruger
  const rightSwipeCluster = useRef<Record<string, number>>({})

  // Load topics on mount
  useEffect(() => {
    loadTopics()
  }, [])

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

  async function loadTopics() {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: profile } = await supabase
      .from('student_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (!profile) { router.push('/onboarding/student'); return }

    // Fetch topics matching student profile
    let query = supabase
      .from('topics')
      .select('*')
      .eq('grade', profile.grade)

    if (profile.subjects?.length > 0) {
      query = query.in('subject', profile.subjects)
    }

    const { data: allTopics } = await query.limit(200)
    if (!allTopics || allTopics.length === 0) { setLoading(false); return }

    // Get recent swipe history for AI personalisation
    const { data: recentSwipes } = await supabase
      .from('swipe_events')
      .select('topic_id, direction, topics(title)')
      .eq('student_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20)

    // Ask AI to prioritise the card order
    try {
      const res = await fetch('/api/ai/personalise-cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topics: allTopics,
          studentProfile: profile,
          swipeHistory: recentSwipes?.map(s => ({
            title: (s.topics as any)?.title || '',
            direction: s.direction,
          })),
        }),
      })
      const { orderedIds } = await res.json()
      if (orderedIds?.length > 0) {
        const ordered = orderedIds
          .map((id: string) => allTopics.find(t => t.id === id))
          .filter(Boolean) as Topic[]
        const limit = MODE_LIMITS[mode]
        setTopics(ordered.slice(0, limit))
      } else {
        setTopics(allTopics.slice(0, MODE_LIMITS[mode]))
      }
    } catch {
      setTopics(allTopics.slice(0, MODE_LIMITS[mode]))
    }

    setLoading(false)
  }

  function startSession(selectedMode: SessionMode) {
    setMode(selectedMode)
    const limit = MODE_LIMITS[selectedMode]
    setTopics(prev => prev.slice(0, limit === 9999 ? prev.length : limit))
    setPhase('swiping')
    setSessionStarted(true)
  }

  const handleSwipe = useCallback(async (direction: 'left' | 'right') => {
    if (currentIndex >= topics.length) return
    const topic = topics[currentIndex]

    const newLog = [...swipeLog, { topic_id: topic.id, direction }]
    setSwipeLog(newLog)

    if (direction === 'right') {
      // Track right-swipe cluster per subject
      const cluster = rightSwipeCluster.current
      cluster[topic.subject] = (cluster[topic.subject] || 0) + 1

      // Dunning-Kruger: every 5 right-swipes in same subject cluster → trigger quiz
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
            return // pause — don't advance yet
          }
        } catch { /* skip quiz on error */ }
      }
    }

    advanceCard()
  }, [currentIndex, topics, swipeLog])

  function advanceCard() {
    const nextIndex = currentIndex + 1
    setCurrentIndex(nextIndex)
    if (nextIndex >= topics.length) {
      finishSession()
    }
  }

  function handleQuizComplete(passed: boolean) {
    if (!passed && quizTopicId) {
      // Flip the last right-swipe to left
      setSwipeLog(prev => prev.map((s, i) =>
        i === prev.length - 1 && s.topic_id === quizTopicId
          ? { ...s, direction: 'left' }
          : s
      ))
      setQuizFlips(f => f + 1)
    }
    setQuizTopicId(null)
    setQuizQuestions([])
    setPhase('swiping')
    advanceCard()
  }

  async function finishSession() {
    // Save all swipes to backend
    try {
      await fetch('/api/swipe/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ swipes: swipeLog }),
      })
      // Get updated streak
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: streak } = await supabase.from('streaks').select('current_streak').eq('student_id', user.id).single()
        setCurrentStreak(streak?.current_streak ?? 1)
      }
    } catch (e) { console.error('Failed to save session:', e) }
    setPhase('summary')
  }

  const rightCount  = swipeLog.filter(s => s.direction === 'right').length
  const leftCount   = swipeLog.filter(s => s.direction === 'left').length
  const progress    = topics.length > 0 ? (currentIndex / topics.length) * 100 : 0
  const remaining   = topics.length - currentIndex
  const visibleCards = topics.slice(currentIndex, currentIndex + 3)

  // ── MODE SELECT ─────────────────────────────────────────────
  if (phase === 'mode-select') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
          <div className="text-center mb-8">
            <div className="text-5xl mb-4">👆</div>
            <h1 className="text-2xl font-bold text-gray-900">Start swiping</h1>
            <p className="text-gray-500 text-sm mt-1">Choose how deep you want to go today</p>
          </div>

          {loading ? (
            <div className="text-center py-8 text-gray-400">Loading your topics…</div>
          ) : (
            <div className="space-y-3">
              {([
                { mode: 'quick' as SessionMode, emoji: '⚡', label: 'Quick Swipe', desc: '10 cards · ~3 minutes', color: 'border-green-200 hover:border-green-400 hover:bg-green-50' },
                { mode: 'deep'  as SessionMode, emoji: '🔍', label: 'Deep Scan',   desc: '50 cards · ~12 minutes', color: 'border-blue-200 hover:border-blue-400 hover:bg-blue-50' },
                { mode: 'full'  as SessionMode, emoji: '🎯', label: 'Full Assessment', desc: `${topics.length} cards · your whole curriculum`, color: 'border-purple-200 hover:border-purple-400 hover:bg-purple-50' },
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
          )}

          <Button variant="ghost" size="md" className="w-full mt-4" onClick={() => router.push('/dashboard/student')}>
            ← Back to dashboard
          </Button>
        </div>
      </div>
    )
  }

  // ── SUMMARY ─────────────────────────────────────────────────
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

  // ── SWIPING / QUIZ ───────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex flex-col">
      {/* Header */}
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

      {/* Card area */}
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

      {/* Action buttons */}
      {phase === 'swiping' && (
        <div className="pb-8 flex justify-center gap-8">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => handleSwipe('left')}
            className="w-16 h-16 rounded-full bg-white border-2 border-red-300 shadow-lg flex items-center justify-center hover:border-red-500 hover:bg-red-50 transition-all">
            <ChevronLeft size={28} className="text-red-500" />
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => handleSwipe('right')}
            className="w-16 h-16 rounded-full bg-white border-2 border-green-300 shadow-lg flex items-center justify-center hover:border-green-500 hover:bg-green-50 transition-all">
            <ChevronRight size={28} className="text-green-500" />
          </motion.button>
        </div>
      )}

      {/* Keyboard hint */}
      <p className="hidden md:block text-center text-xs text-gray-300 pb-4">
        ← Arrow keys to swipe →
      </p>
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
