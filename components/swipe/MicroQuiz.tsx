'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import type { Topic } from '@/lib/supabase/types'

interface QuizQuestion {
  id: string
  question: string
  options: string[]
  correct: number
  explanation: string
}

interface MicroQuizProps {
  topic: Topic
  questions: QuizQuestion[]
  onComplete: (passed: boolean) => void
}

export function MicroQuiz({ topic, questions, onComplete }: MicroQuizProps) {
  const [currentQ, setCurrentQ] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [answers, setAnswers] = useState<number[]>([])
  const [showResult, setShowResult] = useState(false)

  function handleAnswer(idx: number) {
    if (selected !== null) return
    setSelected(idx)
  }

  function handleNext() {
    const newAnswers = [...answers, selected!]
    setAnswers(newAnswers)

    if (currentQ < questions.length - 1) {
      setCurrentQ(q => q + 1)
      setSelected(null)
    } else {
      // Score: pass if ≥ 1 correct out of 2
      const correct = newAnswers.filter((a, i) => a === questions[i].correct).length
      const passed = correct >= 1
      setShowResult(true)
      setTimeout(() => onComplete(passed), 2000)
    }
  }

  const q = questions[currentQ]
  const isCorrect = selected === q.correct
  const subjectColors: Record<string, string> = {
    Mathematics: '#1A4D8F', English: '#7C3AED', Physics: '#4F46E5',
    Chemistry: '#059669', Biology: '#0D7A5F', default: '#1A4D8F',
  }
  const accentColor = subjectColors[topic.subject] || subjectColors.default

  if (showResult) {
    const correct = answers.filter((a, i) => a === questions[i].correct).length
    const passed = correct >= 1
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex flex-col items-center justify-center h-full text-center p-8"
      >
        {passed ? (
          <>
            <CheckCircle size={56} className="text-green-500 mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Well done! ✓</h3>
            <p className="text-gray-500">{correct}/2 correct — keeping as confident</p>
          </>
        ) : (
          <>
            <XCircle size={56} className="text-red-500 mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Keep studying 📌</h3>
            <p className="text-gray-500">{correct}/2 correct — moved to your learning plan</p>
          </>
        )}
      </motion.div>
    )
  }

  return (
    <div className="h-full flex flex-col p-6">
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-bold uppercase tracking-wide px-2.5 py-1 rounded-full text-white" style={{ background: accentColor }}>
            Quick check · {topic.title}
          </span>
        </div>
        <div className="flex gap-1">
          {questions.map((_, i) => (
            <div key={i} className={`h-1 flex-1 rounded-full ${i <= currentQ ? 'bg-brand-orange' : 'bg-gray-200'}`} />
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-1">Question {currentQ + 1} of {questions.length}</p>
      </div>

      {/* Question */}
      <div className="flex-1 flex flex-col justify-center">
        <p className="text-lg font-semibold text-gray-900 mb-5 leading-snug">{q.question}</p>
        <div className="space-y-2.5">
          {q.options.map((opt, idx) => {
            let style = 'border-gray-200 bg-white hover:border-brand-blue hover:bg-blue-50'
            if (selected !== null) {
              if (idx === q.correct) style = 'border-green-500 bg-green-50'
              else if (idx === selected && selected !== q.correct) style = 'border-red-400 bg-red-50'
              else style = 'border-gray-100 bg-gray-50 opacity-60'
            }
            return (
              <button key={idx} onClick={() => handleAnswer(idx)}
                className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all text-sm font-medium ${style} ${selected === null ? 'cursor-pointer' : 'cursor-default'}`}>
                <span className="inline-block w-5 text-gray-400 font-mono">{['A','B','C','D'][idx]}.</span>
                {' '}{opt}
              </button>
            )
          })}
        </div>
        {selected !== null && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className={`mt-4 p-3 rounded-xl text-sm ${isCorrect ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {isCorrect ? '✓ ' : '✗ '}{q.explanation}
          </motion.div>
        )}
      </div>

      <Button variant="primary" size="lg" className="mt-4 w-full"
        onClick={handleNext} disabled={selected === null}>
        {currentQ < questions.length - 1 ? 'Next question →' : 'See result'}
      </Button>
    </div>
  )
}
