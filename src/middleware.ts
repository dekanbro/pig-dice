import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyAuthToken } from "./lib/auth";

export const runtime = 'nodejs'

export async function middleware(request: NextRequest) {
  // Create base response
  const response = NextResponse.next()

  // Add security headers
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin')
  response.headers.set(
    'Strict-Transport-Security',
    'max-age=31536000; includeSubDomains'
  )

  // Only protect /api/game routes
  if (request.nextUrl.pathname.startsWith("/api/game")) {
    try {
      const authResult = await verifyAuthToken(request);
      if (!authResult.isAuthenticated) {
        return NextResponse.json(
          { error: "Unauthorized", code: "AUTH_REQUIRED" },
          { status: 401 }
        );
      }
      // Add user ID to headers for downstream use
      response.headers.set('X-User-ID', authResult.userId!)
    } catch (error) {
      console.error('Middleware auth error:', error)
      return NextResponse.json(
        { error: "Internal server error", code: "AUTH_ERROR" },
        { status: 500 }
      );
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     * Then, we only protect /api/game routes in the middleware function
     */
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
}; 