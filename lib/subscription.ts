import { createClient } from '@/lib/supabase/server'

export type SubscriptionPlan = 'free' | 'basic' | 'pro' | 'premium'
const PLAN_ORDER: SubscriptionPlan[] = ['free', 'basic', 'pro', 'premium']

export function planAtLeast(current: SubscriptionPlan, required: SubscriptionPlan): boolean {
  return PLAN_ORDER.indexOf(current) >= PLAN_ORDER.indexOf(required)
}

export async function getSubscriptionTier(userId: string): Promise<SubscriptionPlan> {
  try {
    const supabase = await createClient()
    const { data } = await supabase.from('subscriptions').select('plan, status').eq('user_id', userId).single()
    if (!data || data.status !== 'active') return 'free'
    return (data.plan as SubscriptionPlan) || 'free'
  } catch { return 'free' }
}

export const PLAN_PRICES = {
  basic:   { AUD: 9.99,  INR: 299 },
  pro:     { AUD: 19.99, INR: 599 },
  premium: { AUD: 39.99, INR: 999 },
}

export const PLAN_LABELS = {
  free:    { name: 'Free',    color: 'gray'   },
  basic:   { name: 'Basic',   color: 'blue'   },
  pro:     { name: 'Pro',     color: 'teal'   },
  premium: { name: 'Premium', color: 'orange' },
}
