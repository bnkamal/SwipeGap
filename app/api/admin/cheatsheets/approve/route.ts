import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { data: u } = await supabase.from('users').select('role').eq('id', user.id).single()
    if (u?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    const { id, action } = await req.json()
    if (action === 'approve') await supabase.from('cheatsheets').update({ approved: true }).eq('id', id)
    else await supabase.from('cheatsheets').delete().eq('id', id)
    return NextResponse.json({ success: true })
  } catch(e) { return NextResponse.json({ error: 'Failed' }, { status: 500 }) }
}
