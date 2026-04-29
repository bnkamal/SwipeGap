'use client'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'

interface SessionSummaryProps {
  totalCards: number
  rightSwipes: number
  leftSwipes: number
  quizFlips: number   // how many were flipped by Dunning-Kruger quiz
  xpEarned: number
  streakDay: number
}

export function SessionSummary({ totalCards, rightSwipes, leftSwipes, quizFlips, xpEarned, streakDay }: SessionSummaryProps) {
  const router = useRouter()
  const confidentPct = totalCards > 0 ? Math.round((rightSwipes / totalCards) * 100) : 0

  const stats = [
    { label: 'Topics covered', value: totalCards,     icon: '📋', color: 'text-gray-700' },
    { label: 'Confident',       value: rightSwipes,   icon: '✅', color: 'text-green-600' },
    { label: 'Need study',      value: leftSwipes,    icon: '📌', color: 'text-red-600' },
    { label: 'Quiz-corrected',  value: quizFlips,     icon: '🎯', color: 'text-orange-600' },
  ]

  return (
    <div className="h-full flex flex-col items-center justify-center p-6 text-center">
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', bounce: 0.5 }}
        className="text-6xl mb-4">
        {confidentPct >= 70 ? '🌟' : confidentPct >= 40 ? '💪' : '📚'}
      </motion.div>

      <motion.h2 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="text-2xl font-bold text-gray-900 mb-1">
        Session complete!
      </motion.h2>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
        className="text-gray-500 text-sm mb-6">
        You're {confidentPct}% confident across {totalCards} topics
      </motion.p>

      {/* Stats grid */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        className="grid grid-cols-2 gap-3 w-full mb-5">
        {stats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 + i * 0.08 }}
            className="bg-gray-50 rounded-xl p-3">
            <div className="text-2xl mb-0.5">{s.icon}</div>
            <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-gray-500">{s.label}</div>
          </motion.div>
        ))}
      </motion.div>

      {/* XP and streak earned */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
        className="flex gap-4 mb-6">
        <div className="flex items-center gap-1.5 bg-yellow-50 px-4 py-2 rounded-full">
          <span className="text-yellow-500 font-bold">+{xpEarned} XP</span>
          <span className="text-yellow-500">⚡</span>
        </div>
        <div className="flex items-center gap-1.5 bg-orange-50 px-4 py-2 rounded-full">
          <span className="text-orange-500 font-bold">{streakDay} day streak</span>
          <span className="text-orange-500">🔥</span>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}
        className="flex flex-col gap-3 w-full">
        <Button variant="primary" size="lg" className="w-full" onClick={() => router.push('/dashboard/student/heatmap')}>
          View my heatmap →
        </Button>
        <Button variant="ghost" size="md" className="w-full" onClick={() => router.push('/dashboard/student/plan')}>
          See learning plan
        </Button>
        <Button variant="ghost" size="md" className="w-full" onClick={() => router.push('/dashboard/student')}>
          Back to dashboard
        </Button>
      </motion.div>
    </div>
  )
}
