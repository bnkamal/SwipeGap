import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function RootPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Get role and redirect to correct dashboard
  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/register')

  switch (profile.role) {
    case 'student': redirect('/dashboard/student')
    case 'mentor':  redirect('/dashboard/mentor')
    case 'admin':   redirect('/dashboard/admin')
    default:        redirect('/login')
  }
}
