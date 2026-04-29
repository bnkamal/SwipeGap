import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' })
export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { mentor_id, topic_id, session_price, mentor_name, topic_title } = await req.json()
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{ price_data: { currency: 'aud', product_data: { name: `Tutoring: ${topic_title}`, description: `Session with ${mentor_name}` }, unit_amount: Math.round(session_price * 100) }, quantity: 1 }],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/student?session=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/mentors`,
      metadata: { student_id: user.id, mentor_id, topic_id: topic_id || '' },
    })
    return NextResponse.json({ url: session.url })
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}
