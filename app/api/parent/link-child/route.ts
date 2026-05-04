import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.redirect(new URL('/login', request.url))

  const formData = await request.formData()
  const inviteCode = (formData.get('invite_code') as string || '').trim().toUpperCase().replace(/-/g, '')

  if (!inviteCode || inviteCode.length < 6) {
    return NextResponse.redirect(new URL('/dashboard/parent?error=invalid_code', request.url))
  }

  // Find student whose user ID matches the invite code
  // The invite code is first 8 chars of UUID (without dashes)
  const { data: students } = await supabase
    .from('student_profiles')
    .select('user_id, name')

  const matched = (students || []).find((s: any) => {
    const code = s.user_id.replace(/-/g, '').slice(0, 8).toUpperCase()
    const inputCode = inviteCode.slice(0, 8)
    return code === inputCode
  })

  if (!matched) {
    // Also try matching against users table directly
    const { data: allUsers } = await supabase
      .from('users')
      .select('id, email')
      .eq('role', 'student')

    const matchedUser = (allUsers || []).find((u: any) => {
      const code = u.id.replace(/-/g, '').slice(0, 8).toUpperCase()
      return code === inviteCode.slice(0, 8)
    })

    if (!matchedUser) {
      return NextResponse.redirect(new URL('/dashboard/parent?error=not_found', request.url))
    }

    // Insert link using users table match
    const { data: existing } = await supabase
      .from('parent_links')
      .select('id')
      .eq('parent_user_id', user.id)
      .eq('student_user_id', matchedUser.id)
      .single()

    if (!existing) {
      await supabase.from('parent_links').insert({
        parent_user_id: user.id,
        student_user_id: matchedUser.id,
      })
    }
    return NextResponse.redirect(new URL('/dashboard/parent?linked=true', request.url))
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
