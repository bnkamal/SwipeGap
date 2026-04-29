'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const PLANS = [
  { id: 'basic', name: 'Basic', price_au: '$9.99', price_in: '₹299', highlight: false,
    features: ['Unlimited swipes','Real-time heatmap','Full learning plan','View mentor profiles','3 assessments/month'] },
  { id: 'pro', name: 'Pro', price_au: '$19.99', price_in: '₹599', highlight: true,
    features: ['Everything in Basic','2 mentor sessions/month','Unlimited assessments','National benchmarking','2 cheatsheet credits/month'] },
  { id: 'premium', name: 'Premium', price_au: '$39.99', price_in: '₹999', highlight: false,
    features: ['Everything in Pro','Unlimited mentor sessions','Full cheatsheet library','Parent dashboard','PDF export'] },
]

export default function BillingPage() {
  const router = useRouter()
  const supabase = createClient()
  const [currentPlan, setCurrentPlan] = useState('free')
  const [country, setCountry] = useState('AU')
  const [loading, setLoading] = useState<string|null>(null)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: sub } = await supabase.from('subscriptions').select('plan').eq('user_id', user.id).single()
      if (sub?.plan) setCurrentPlan(sub.plan)
      const { data: profile } = await supabase.from('student_profiles').select('country').eq('user_id', user.id).single()
      if (profile?.country) setCountry(profile.country)
    }
    load()
  }, [])

  async function handleUpgrade(planId: string) {
    setLoading(planId)
    try {
      const res = await fetch('/api/stripe/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planId }),
      })
      const { url, error } = await res.json()
      if (error) throw new Error(error)
      if (url) window.location.href = url
    } catch(e: any) {
      alert('Upgrade failed: ' + e.message)
    }
    setLoading(null)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Upgrade SwipeGap</h1>
          <p className="text-gray-500 mb-3">Choose the plan that fits your study goals</p>
          <span className="bg-gray-100 text-gray-700 text-sm px-4 py-1.5 rounded-full">
            Current plan: <strong className="capitalize">{currentPlan}</strong>
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {PLANS.map(plan => {
            const isCurrent = currentPlan === plan.id
            return (
              <div key={plan.id} className={`relative bg-white rounded-2xl border-2 p-6 ${plan.highlight ? 'border-brand-teal' : isCurrent ? 'border-brand-blue' : 'border-gray-200'}`}>
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-brand-teal text-white text-xs font-bold px-3 py-1 rounded-full">Most popular</span>
                  </div>
                )}
                {isCurrent && (
                  <div className="absolute -top-3 right-4">
                    <span className="bg-brand-blue text-white text-xs font-bold px-3 py-1 rounded-full">Current</span>
                  </div>
                )}
                <div className="mb-4">
                  <p className="font-bold text-gray-900 text-lg">{plan.name}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {country === 'IN' ? plan.price_in : plan.price_au}
                    <span className="text-sm font-normal text-gray-400">/mo</span>
                  </p>
                </div>
                <ul className="space-y-2 mb-6">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-start gap-2 text-sm text-gray-600">
                      <span className="text-green-500 flex-shrink-0">✓</span>{f}
                    </li>
                  ))}
                </ul>
                <button
                  disabled={isCurrent || loading === plan.id}
                  onClick={() => handleUpgrade(plan.id)}
                  className={`w-full py-2.5 rounded-xl font-medium text-sm transition-all ${
                    isCurrent ? 'bg-gray-100 text-gray-400 cursor-not-allowed' :
                    plan.highlight ? 'bg-brand-teal text-white hover:bg-teal-700' :
                    'bg-brand-blue text-white hover:bg-blue-800'
                  } disabled:opacity-50`}>
                  {loading === plan.id ? 'Redirecting...' : isCurrent ? 'Current plan' : 'Upgrade to ' + plan.name}
                </button>
              </div>
            )
          })}
        </div>
        <div className="text-center">
          <button onClick={() => router.push('/dashboard/student')} className="text-sm text-gray-400 hover:text-gray-600">
            ← Back to dashboard
          </button>
        </div>
      </div>
    </div>
  )
}
