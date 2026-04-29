'use client'
import { useState, useRef } from 'react'
import { motion, useMotionValue, useTransform, useAnimation, type PanInfo } from 'framer-motion'
import { type Topic } from '@/lib/supabase/types'

// Subject icon mapping
const SUBJECT_ICONS: Record<string, string> = {
  Mathematics: '📐', English: '📖', Physics: '⚛️', Chemistry: '🧪',
  Biology: '🧬', History: '📜', Geography: '🌍', Science: '🔬',
  'Computer Science': '💻', 'General Ability': '🧩', default: '📚',
}

const SUBJECT_COLORS: Record<string, string> = {
  Mathematics: 'bg-blue-100 text-blue-700',
  English: 'bg-purple-100 text-purple-700',
  Physics: 'bg-indigo-100 text-indigo-700',
  Chemistry: 'bg-green-100 text-green-700',
  Biology: 'bg-teal-100 text-teal-700',
  History: 'bg-amber-100 text-amber-700',
  Geography: 'bg-orange-100 text-orange-700',
  Science: 'bg-cyan-100 text-cyan-700',
  'Computer Science': 'bg-slate-100 text-slate-700',
  'General Ability': 'bg-rose-100 text-rose-700',
  default: 'bg-gray-100 text-gray-700',
}

interface SwipeCardProps {
  topic: Topic
  onSwipe: (direction: 'left' | 'right') => void
  isTop: boolean
  index: number   // 0 = top, 1 = next, 2 = third
}

export function SwipeCard({ topic, onSwipe, isTop, index }: SwipeCardProps) {
  const controls = useAnimation()
  const x = useMotionValue(0)
  const rotate = useTransform(x, [-200, 200], [-20, 20])
  const [isDragging, setIsDragging] = useState(false)

  // Glow opacity based on drag direction
  const leftOpacity  = useTransform(x, [-150, -30, 0], [1, 0.3, 0])
  const rightOpacity = useTransform(x, [0, 30, 150], [0, 0.3, 1])

  const icon = SUBJECT_ICONS[topic.subject] || SUBJECT_ICONS.default
  const subjectColor = SUBJECT_COLORS[topic.subject] || SUBJECT_COLORS.default

  async function handleDragEnd(_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) {
    setIsDragging(false)
    const THRESHOLD = 100
    if (info.offset.x < -THRESHOLD) {
      await controls.start({ x: -500, opacity: 0, transition: { duration: 0.3 } })
      onSwipe('left')
    } else if (info.offset.x > THRESHOLD) {
      await controls.start({ x: 500, opacity: 0, transition: { duration: 0.3 } })
      onSwipe('right')
    } else {
      // Snap back
      await controls.start({ x: 0, rotate: 0, transition: { type: 'spring', stiffness: 400, damping: 25 } })
    }
  }

  // Stack visual — cards behind the top card are slightly offset
  const stackScale   = 1 - index * 0.04
  const stackY       = index * -8
  const stackOpacity = 1 - index * 0.15

  if (!isTop) {
    return (
      <motion.div
        className="absolute inset-0 swipe-card bg-white"
        style={{ scale: stackScale, y: stackY, opacity: stackOpacity, zIndex: 10 - index }}
      />
    )
  }

  return (
    <motion.div
      className="absolute inset-0 swipe-card cursor-grab active:cursor-grabbing"
      style={{ x, rotate, zIndex: 20 }}
      animate={controls}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.7}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={handleDragEnd}
      whileTap={{ scale: 0.98 }}
    >
      {/* Left glow overlay — RED — needs help */}
      <motion.div
        className="absolute inset-0 rounded-2xl bg-red-500/20 border-4 border-red-500 flex items-center justify-center pointer-events-none"
        style={{ opacity: leftOpacity }}
      >
        <div className="absolute left-6 top-6 bg-red-500 text-white font-bold text-xl px-4 py-2 rounded-xl rotate-[-15deg] shadow-lg">
          STUDY THIS 📌
        </div>
      </motion.div>

      {/* Right glow overlay — GREEN — confident */}
      <motion.div
        className="absolute inset-0 rounded-2xl bg-green-500/20 border-4 border-green-500 flex items-center justify-center pointer-events-none"
        style={{ opacity: rightOpacity }}
      >
        <div className="absolute right-6 top-6 bg-green-500 text-white font-bold text-xl px-4 py-2 rounded-xl rotate-[15deg] shadow-lg">
          CONFIDENT ✓
        </div>
      </motion.div>

      {/* Card content */}
      <div className="h-full flex flex-col p-7 select-none">
        {/* Header badges */}
        <div className="flex items-center gap-2 mb-6 flex-wrap">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${subjectColor}`}>
            <span>{icon}</span>
            {topic.subject}
          </span>
          <span className="px-3 py-1.5 rounded-full text-sm font-medium bg-gray-100 text-gray-600">
            {topic.grade}
          </span>
          <span className="px-3 py-1.5 rounded-full text-xs font-medium bg-brand-orange/10 text-brand-orange">
            {topic.exam_tag}
          </span>
        </div>

        {/* Main topic title */}
        <div className="flex-1 flex flex-col justify-center">
          <h2 className="text-3xl font-bold text-gray-900 leading-tight mb-4">
            {topic.title}
          </h2>
          <p className="text-gray-500 text-base leading-relaxed">{topic.hint}</p>
        </div>

        {/* Subtopics */}
        {topic.subtopics && topic.subtopics.length > 0 && (
          <div className="mt-6">
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-2">Covers</p>
            <div className="flex flex-wrap gap-1.5">
              {topic.subtopics.slice(0, 4).map(sub => (
                <span key={sub} className="px-2.5 py-1 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-600">
                  {sub}
                </span>
              ))}
              {topic.subtopics.length > 4 && (
                <span className="px-2.5 py-1 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-400">
                  +{topic.subtopics.length - 4} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Swipe hint — only show when not dragging */}
        {!isDragging && (
          <p className="text-center text-xs text-gray-300 mt-5 select-none">
            ← Swipe left if unsure  ·  Swipe right if confident →
          </p>
        )}
      </div>
    </motion.div>
  )
}
