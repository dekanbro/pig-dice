import { NextResponse, NextRequest } from "next/server"
import { verifyAuthToken } from "@/lib/auth"

interface VerifyError extends Error {
  details?: unknown
}

// Paths that require authentication
const PROTECTED_PATHS = ["/game", "/api/game"]

// Paths that are always allowed
const PUBLIC_PATHS = ["/", "/api/auth", "/_next", "/favicon.ico"]

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public paths to pass through
  if (PUBLIC_PATHS.some(path => pathname.startsWith(path))) {
    return NextResponse.next()
  }

  // Check if the path needs protection
  const isProtectedPath = PROTECTED_PATHS.some(path => pathname.startsWith(path))
  if (!isProtectedPath) {
    return NextResponse.next()
  }

  try {
    // Get token from cookie
    const token = request.cookies.get('privy-token')?.value
    
    if (!token) {
      console.log('No token found in cookies')
      throw new Error('No auth token found')
    }

    // Create new request with the token
    const requestWithAuth = new NextRequest(request.url, {
      headers: {
        ...Object.fromEntries(request.headers),
        authorization: `Bearer ${token}`,
      },
    })

    try {
      const { userId } = await verifyAuthToken(requestWithAuth)
      console.log('Token verified successfully for user:', userId)
      
      // Return response with the token cookie preserved
      const response = NextResponse.next()
      response.cookies.set('privy-token', token, {
        maxAge: 60 * 60 * 24, // 24 hours
        path: '/',
        secure: true,
        sameSite: 'strict'
      })
      return response
    } catch (verifyError) {
      const error = verifyError as VerifyError
      console.error('Token verification failed:', {
        error,
        message: error.message,
        details: error.details
      })

      // If token is expired or invalid, clear it and redirect to home
      const response = NextResponse.redirect(new URL("/", request.url))
      response.cookies.delete('privy-token')
      return response
    }
  } catch (error) {
    console.error('Middleware error:', error)
    
    // Clear the invalid token and redirect
    const response = NextResponse.redirect(new URL("/", request.url))
    response.cookies.delete('privy-token')
    return response
  }
}

export const config = {
  // Specify which paths the middleware should run on
  matcher: [
    /*
     * Match all request paths except static files
     */
    "/((?!_next/static|_next/image|assets/|favicon.ico).*)",
  ],
} 