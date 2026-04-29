import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' })
export async function POST(req: Request) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!
  let event: Stripe.Event
  try { event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!) }
  catch (e) { return NextResponse.json({ error: 'Invalid signature' }, { status: 400 }) }
  const supabase = await createClient()
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const { student_id, mentor_id, topic_id } = session.metadata!
    await supabase.from('sessions').insert({ student_id, mentor_id, topic_id: topic_id||null, status: 'scheduled', scheduled_at: new Date(Date.now() + 86400000).toISOString(), price: (session.amount_total||0)/100 })
    await supabase.from('payments').insert({ user_id: student_id, stripe_payment_id: session.payment_intent as string, amount: (session.amount_total||0)/100, currency: 'AUD', type: 'session', status: 'completed' })
  }
  return NextResponse.json({ received: true })
}
