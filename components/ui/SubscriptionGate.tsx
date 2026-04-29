'use client'
import { useState } from 'react'
import { Lock } from 'lucide-react'
import { Modal } from './Modal'
import { Button } from './Button'
import { Badge } from './Elements'
import type { SubscriptionPlan } from '@/lib/supabase/types'

const PLAN_ORDER: SubscriptionPlan[] = ['free', 'basic', 'pro', 'premium']

const PLAN_DETAILS = {
  free:    { label: 'Free',    color: 'gray'   as const, price_au: '$0',     price_in: '₹0' },
  basic:   { label: 'Basic',   color: 'blue'   as const, price_au: '$9.99',  price_in: '₹299' },
  pro:     { label: 'Pro',     color: 'teal'   as const, price_au: '$19.99', price_in: '₹599' },
  premium: { label: 'Premium', color: 'orange' as const, price_au: '$39.99', price_in: '₹999' },
}

interface SubscriptionGateProps {
  children: React.ReactNode
  requiredPlan: SubscriptionPlan
  currentPlan: SubscriptionPlan
  featureName?: string
}

export function SubscriptionGate({ children, requiredPlan, currentPlan, featureName }: SubscriptionGateProps) {
  const [showModal, setShowModal] = useState(false)
  const hasAccess = PLAN_ORDER.indexOf(currentPlan) >= PLAN_ORDER.indexOf(requiredPlan)

  if (hasAccess) return <>{children}</>

  return (
    <>
      <div className="relative group cursor-pointer" onClick={() => setShowModal(true)}>
        <div className="pointer-events-none select-none opacity-40 blur-[1px]">{children}</div>
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/60 rounded-xl">
          <div className="flex flex-col items-center gap-2 p-4 text-center">
            <div className="w-10 h-10 bg-brand-blue/10 rounded-full flex items-center justify-center">
              <Lock size={20} className="text-brand-blue" />
            </div>
            <p className="text-sm font-semibold text-gray-800">
              {featureName || 'This feature'} requires <Badge variant={PLAN_DETAILS[requiredPlan].color}>{PLAN_DETAILS[requiredPlan].label}</Badge>
            </p>
            <span className="text-xs text-brand-blue font-medium">Tap to upgrade →</span>
          </div>
        </div>
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Upgrade your plan" size="md">
        <p className="text-gray-600 text-sm mb-4">
          {featureName ? `"${featureName}" is` : 'This feature is'} available on the{' '}
          <strong>{PLAN_DETAILS[requiredPlan].label}</strong> plan and above.
        </p>
        <div className="grid grid-cols-2 gap-3 mb-6">
          {(['basic', 'pro', 'premium'] as SubscriptionPlan[]).map(plan => {
            const p = PLAN_DETAILS[plan]
            const isRecommended = plan === requiredPlan
            return (
              <div key={plan} className={`rounded-xl border-2 p-3 ${isRecommended ? 'border-brand-blue bg-blue-50' : 'border-gray-200'}`}>
                <div className="flex justify-between items-center mb-1">
                  <Badge variant={p.color}>{p.label}</Badge>
                  {isRecommended && <span className="text-xs text-brand-blue font-medium">Recommended</span>}
                </div>
                <p className="text-lg font-bold text-gray-900">{p.price_au}<span className="text-xs font-normal text-gray-500">/mo</span></p>
                <p className="text-xs text-gray-500">{p.price_in}/mo in India</p>
              </div>
            )
          })}
        </div>
        <Button variant="primary" className="w-full" onClick={() => { setShowModal(false); window.location.href = '/dashboard/student/billing' }}>
          View all plans & upgrade
        </Button>
      </Modal>
    </>
  )
}
