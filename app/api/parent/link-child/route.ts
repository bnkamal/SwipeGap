import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.redirect(new URL('/login', request.url))

  const formData = await request.formData()
  const inviteCode = (formData.get('invite_code') as string || '').trim().toUpperCase()

  if (!inviteCode || inviteCode.length < 6) {
    return NextResponse.redirect(new URL('/dashboard/parent?error=invalid_code', request.url))
  }

  // Find student whose user ID starts with this invite code (case-insensitive)
  const { data: students } = await supabase
    .from('student_profiles')
    .select('user_id, name')

  const matched = (students || []).find(s =>
    s.user_id.replace(/-/g, '').slice(0, 8).toUpperCase() === inviteCode.replace(/-/g, '').slice(0, 8)
  )

  if (!matched) {
    return NextResponse.redirect(new URL('/dashboard/parent?error=not_found', request.url))
  }

  // Check not already linked
  const { data: existing } = await supabase
    .from('parent_links')
    .select('id')
    .eq('parent_user_id', user.id)
    .eq('student_user_id', matched.user_id)
    .single()

  if (!existing) {
    await supabase.from('parent_links').insert({
      parent_user_id: user.id,
      student_user_id: matched.user_id,
    })
  }

  return NextResponse.redirect(new URL('/dashboard/parent?linked=true', request.url))
}
