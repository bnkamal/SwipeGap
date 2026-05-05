import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Routes accessible WITHOUT being logged in
const PUBLIC_PATHS = ['/', '/login', '/register', '/privacy', '/terms', '/contact']

// Routes that logged-in users should be redirected away from
const AUTH_PATHS = ['/login', '/register']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check for Supabase session cookie (covers all Supabase auth versions)
  const session =
    request.cookies.get('sb-auth-token')?.value ||
    request.cookies.get('sb-access-token')?.value ||
    request.cookies.get('supabase-auth-token')?.value

  const isPublic  = PUBLIC_PATHS.some(p => pathname === p || pathname.startsWith(p + '/'))
  const isAuthPage = AUTH_PATHS.includes(pathname)

  // Already logged in — redirect away from login/register to dashboard
  if (session && isAuthPage) {
    return NextResponse.redirect(new URL('/student', request.url))
  }

  // Not logged in — block access to protected routes
  if (!session && !isPublic) {
    const url = new URL('/login', request.url)
    url.searchParams.set('from', pathname)
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|logo.png|.*\.png|.*\.jpg|.*\.svg|api/).*)',
  ],
}
