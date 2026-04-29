import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' })
export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { cheatsheet_id, price, title, mentor_id } = await req.json()
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{ price_data: { currency: 'aud', product_data: { name: title }, unit_amount: Math.round(price*100) }, quantity: 1 }],
      mode: 'payment',
      success_url: process.env.NEXT_PUBLIC_APP_URL + '/marketplace?purchased=true',
      cancel_url: process.env.NEXT_PUBLIC_APP_URL + '/marketplace',
      metadata: { student_id: user.id, cheatsheet_id, mentor_id, type: 'cheatsheet' },
    })
    return NextResponse.json({ url: session.url })
  } catch(e: any) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}
