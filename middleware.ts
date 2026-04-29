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
        setAll(cookiesToSet) {
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

  // Public routes — no auth needed
  const publicRoutes = ['/login', '/register', '/onboarding/student', '/onboarding/mentor']
  if (publicRoutes.some(r => pathname.startsWith(r))) {
    if (user) return NextResponse.redirect(new URL('/', request.url))
    return supabaseResponse
  }

  // Not logged in — redirect to login
  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Get role for route protection
  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile) return NextResponse.redirect(new URL('/register', request.url))

  const role = profile.role

  // Protect role-specific routes
  if (pathname.startsWith('/dashboard/admin') && role !== 'admin') return NextResponse.redirect(new URL('/dashboard/student', request.url))
  if (pathname.startsWith('/dashboard/mentor') && role !== 'mentor')  return NextResponse.redirect(new URL('/', request.url))
  if (pathname.startsWith('/dashboard/student')&& role !== 'student') return NextResponse.redirect(new URL('/', request.url))
  if (pathname.startsWith('/dashboard/parent') && role !== 'parent')  return NextResponse.redirect(new URL('/', request.url))
  if (pathname.startsWith('/swipe')            && role !== 'student') return NextResponse.redirect(new URL('/', request.url))

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|manifest.json|icons|api/webhooks).*)'],
}
