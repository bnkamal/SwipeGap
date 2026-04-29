import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { student_id, topic_id, message } = await req.json()
    const { data, error } = await supabase.from('session_offers').insert({ mentor_id: user.id, student_id, topic_id, message, status: 'pending' }).select().single()
    if (error) throw error
    await supabase.from('notifications').insert({ user_id: student_id, type: 'session_offer', message: 'A mentor has offered to help you!', read: false })
    return NextResponse.json({ offer: data })
  } catch (e) { return NextResponse.json({ error: 'Failed' }, { status: 500 }) }
}
