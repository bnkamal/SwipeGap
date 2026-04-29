'use client'
import { motion } from 'framer-motion'

interface CoverageRingProps {
  confident: number    // count
  needsHelp: number
  mixed: number
  unswiped: number
  size?: number
}

export function CoverageRing({ confident, needsHelp, mixed, unswiped, size = 120 }: CoverageRingProps) {
  const total = confident + needsHelp + mixed + unswiped
  const coveredPct = total > 0 ? Math.round(((confident + needsHelp + mixed) / total) * 100) : 0
  const confidentPct = total > 0 ? Math.round((confident / total) * 100) : 0

  const r = (size / 2) - 10
  const circ = 2 * Math.PI * r
  const coveredDash = (coveredPct / 100) * circ
  const confidentDash = (confidentPct / 100) * circ

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          {/* Track */}
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#E5E7EB" strokeWidth={10} />
          {/* Covered (all swiped) */}
          <motion.circle
            cx={size/2} cy={size/2} r={r} fill="none"
            stroke="#F59E0B" strokeWidth={10} strokeLinecap="round"
            strokeDasharray={`${coveredDash} ${circ - coveredDash}`}
            initial={{ strokeDasharray: `0 ${circ}` }}
            animate={{ strokeDasharray: `${coveredDash} ${circ - coveredDash}` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
          {/* Confident (green layer) */}
          <motion.circle
            cx={size/2} cy={size/2} r={r} fill="none"
            stroke="#22C55E" strokeWidth={10} strokeLinecap="round"
            strokeDasharray={`${confidentDash} ${circ - confidentDash}`}
            initial={{ strokeDasharray: `0 ${circ}` }}
            animate={{ strokeDasharray: `${confidentDash} ${circ - confidentDash}` }}
            transition={{ duration: 1.2, ease: 'easeOut', delay: 0.2 }}
          />
        </svg>
        {/* Centre label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-gray-900">{coveredPct}%</span>
          <span className="text-xs text-gray-400">covered</span>
        </div>
      </div>
      {/* Legend */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-3 text-xs">
        {[
          { color: 'bg-green-500',  label: `Confident (${confident})` },
          { color: 'bg-red-500',    label: `Need study (${needsHelp})` },
          { color: 'bg-amber-400',  label: `Mixed (${mixed})` },
          { color: 'bg-gray-300',   label: `Unswiped (${unswiped})` },
        ].map(item => (
          <div key={item.label} className="flex items-center gap-1.5">
            <div className={`w-2.5 h-2.5 rounded-sm flex-shrink-0 ${item.color}`} />
            <span className="text-gray-500">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
