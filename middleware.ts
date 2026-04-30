import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const { pathname } = request.nextUrl

  // Always allow API routes
  if (pathname.startsWith('/api/')) return supabaseResponse

  // Always allow onboarding — logged in users need to complete it
  if (pathname.startsWith('/onboarding/')) return supabaseResponse

  // Auth routes — if not logged in, allow through
  if (pathname === '/login' || pathname === '/register') {
    if (!user) return supabaseResponse
    // Logged in — redirect to correct dashboard
    const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single()
    const role = profile?.role || 'student'
    return NextResponse.redirect(new URL('/dashboard/' + role, request.url))
  }

  // Root path redirect
  if (pathname === '/') {
    if (!user) return NextResponse.redirect(new URL('/login', request.url))
    const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single()
    const role = profile?.role || 'student'
    return NextResponse.redirect(new URL('/dashboard/' + role, request.url))
  }

  // All other routes — must be logged in
  if (!user) return NextResponse.redirect(new URL('/login', request.url))

  // Get role for route protection
  const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single()
  if (!profile) return NextResponse.redirect(new URL('/register', request.url))
  const role = profile.role

  // Role-based protection
  if (pathname.startsWith('/dashboard/admin') && role !== 'admin')
    return NextResponse.redirect(new URL('/dashboard/' + role, request.url))
  if (pathname.startsWith('/dashboard/mentor') && role !== 'mentor')
    return NextResponse.redirect(new URL('/dashboard/' + role, request.url))
  if (pathname.startsWith('/dashboard/student') && role !== 'student')
    return NextResponse.redirect(new URL('/dashboard/' + role, request.url))
  if (pathname.startsWith('/dashboard/parent') && role !== 'parent')
    return NextResponse.redirect(new URL('/dashboard/' + role, request.url))
  if (pathname.startsWith('/swipe') && role !== 'student')
    return NextResponse.redirect(new URL('/dashboard/' + role, request.url))

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|manifest.json|icons|api/webhooks).*)'],
}
