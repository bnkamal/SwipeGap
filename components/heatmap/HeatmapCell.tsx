'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

type CellStatus = 'confident' | 'needs-help' | 'mixed' | 'unswiped'

interface HeatmapCellProps {
  title: string
  subject: string
  grade: string
  subtopics: string[]
  status: CellStatus
  lastSwiped?: string
  onClick?: () => void
}

const STATUS_STYLES: Record<CellStatus, { bg: string; border: string; glow: string }> = {
  'confident':  { bg: 'bg-green-500',  border: 'border-green-400',  glow: 'shadow-green-200' },
  'needs-help': { bg: 'bg-red-500',    border: 'border-red-400',    glow: 'shadow-red-200' },
  'mixed':      { bg: 'bg-amber-400',  border: 'border-amber-300',  glow: 'shadow-amber-200' },
  'unswiped':   { bg: 'bg-gray-200',   border: 'border-gray-200',   glow: '' },
}

const STATUS_LABELS: Record<CellStatus, string> = {
  'confident':  'Confident ✓',
  'needs-help': 'Needs study 📌',
  'mixed':      'Partially known',
  'unswiped':   'Not yet swiped',
}

export function HeatmapCell({ title, subject, status, lastSwiped, subtopics, onClick }: HeatmapCellProps) {
  const [showTooltip, setShowTooltip] = useState(false)
  const styles = STATUS_STYLES[status]

  function formatDate(iso?: string) {
    if (!iso) return 'Never'
    const d = new Date(iso)
    const days = Math.floor((Date.now() - d.getTime()) / 86400000)
    if (days === 0) return 'Today'
    if (days === 1) return 'Yesterday'
    return `${days} days ago`
  }

  return (
    <div className="relative" onMouseEnter={() => setShowTooltip(true)} onMouseLeave={() => setShowTooltip(false)}
      onTouchStart={() => setShowTooltip(true)} onTouchEnd={() => setTimeout(() => setShowTooltip(false), 1500)}>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={onClick}
        className={`heatmap-cell w-full aspect-square rounded-lg border-2 transition-all shadow-sm ${styles.bg} ${styles.border} ${styles.glow ? 'hover:shadow-md ' + styles.glow : ''}`}
        aria-label={`${title} — ${STATUS_LABELS[status]}`}
      />

      {/* Tooltip */}
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            transition={{ duration: 0.12 }}
            className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-52 bg-gray-900 text-white rounded-xl p-3 shadow-2xl pointer-events-none"
          >
            <p className="font-semibold text-sm leading-tight mb-1">{title}</p>
            <p className="text-xs text-gray-400 mb-2">{subject}</p>
            <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium mb-2 ${
              status === 'confident' ? 'bg-green-500/20 text-green-300' :
              status === 'needs-help' ? 'bg-red-500/20 text-red-300' :
              status === 'mixed' ? 'bg-amber-500/20 text-amber-300' :
              'bg-gray-600 text-gray-400'
            }`}>
              {STATUS_LABELS[status]}
            </div>
            {lastSwiped && (
              <p className="text-xs text-gray-500">Last swiped: {formatDate(lastSwiped)}</p>
            )}
            {subtopics?.length > 0 && (
              <div className="mt-2 pt-2 border-t border-gray-700">
                <p className="text-xs text-gray-500 mb-1">Covers:</p>
                <div className="flex flex-wrap gap-1">
                  {subtopics.slice(0, 3).map(s => (
                    <span key={s} className="text-xs bg-gray-700 px-1.5 py-0.5 rounded text-gray-300">{s}</span>
                  ))}
                </div>
              </div>
            )}
            {/* Arrow */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
