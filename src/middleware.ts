import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Public routes — accessible without authentication.
 * The landing page at "/" is now public.
 */
const PUBLIC_ROUTES = [
  "/",
  "/login",
  "/register",
  "/privacy",
  "/terms",
  "/contact",
];

/**
 * Auth routes — redirect to dashboard if already logged in.
 */
const AUTH_ROUTES = ["/login", "/register"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check for session cookie (adjust key to match your auth implementation)
  const session =
    request.cookies.get("session")?.value ||
    request.cookies.get("next-auth.session-token")?.value ||
    request.cookies.get("__session")?.value;

  const isPublic = PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname === route);

  // Already authenticated — redirect away from login/register
  if (session && isAuthRoute) {
    return NextResponse.redirect(new URL("/student", request.url));
  }

  // Not authenticated and trying to access a protected route
  if (!session && !isPublic) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all routes EXCEPT:
     * - _next/static (static files)
     * - _next/image (image optimisation)
     * - favicon.ico, public files (logo.png etc.)
     * - API routes
     */
    "/((?!_next/static|_next/image|favicon.ico|logo.png|api/).*)",
  ],
};
