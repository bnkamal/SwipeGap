import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'
import { PLAN_PRICES } from '@/lib/subscription'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' })

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { plan } = await req.json()
    const { data: profile } = await supabase.from('student_profiles').select('country').eq('user_id', user.id).single()
    const currency = profile?.country === 'IN' ? 'inr' : 'aud'
    const price = currency === 'inr' ? PLAN_PRICES[plan as keyof typeof PLAN_PRICES].INR : PLAN_PRICES[plan as keyof typeof PLAN_PRICES].AUD
    const names: Record<string,string> = { basic: 'SwipeGap Basic', pro: 'SwipeGap Pro', premium: 'SwipeGap Premium' }
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{ price_data: { currency, product_data: { name: names[plan] || plan }, unit_amount: Math.round(price * 100), recurring: { interval: 'month' } }, quantity: 1 }],
      mode: 'subscription',
      success_url: process.env.NEXT_PUBLIC_APP_URL + '/dashboard/student?upgraded=true',
      cancel_url: process.env.NEXT_PUBLIC_APP_URL + '/dashboard/student/billing',
      metadata: { user_id: user.id, plan },
      customer_email: user.email,
    })
    return NextResponse.json({ url: session.url })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
