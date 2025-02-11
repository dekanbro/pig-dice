// Note: Keep imports clean - remove any unused imports to prevent linting errors
import { NextRequest } from 'next/server'
import { PrivyClient } from '@privy-io/server-auth'

export const runtime = 'nodejs'

if (!process.env.NEXT_PUBLIC_PRIVY_APP_ID) {
  throw new Error('NEXT_PUBLIC_PRIVY_APP_ID is not set')
}

if (!process.env.PRIVY_APP_SECRET) {
  throw new Error('PRIVY_APP_SECRET is not set')
}

export interface AuthResult {
  isAuthenticated: boolean
  userId?: string
}

const privyClient = new PrivyClient(
  process.env.NEXT_PUBLIC_PRIVY_APP_ID,
  process.env.PRIVY_APP_SECRET
)

export async function verifyAuthToken(req: NextRequest): Promise<AuthResult> {
  try {
    const authHeader = req.headers.get("authorization")
    if (!authHeader) {
      console.warn('No authorization header found')
      return { isAuthenticated: false }
    }

    if (!authHeader.startsWith("Bearer ")) {
      console.warn('Authorization header is not a Bearer token')
      return { isAuthenticated: false }
    }

    const token = authHeader.split(" ")[1]
    if (!token) {
      console.warn('No token found in authorization header')
      return { isAuthenticated: false }
    }

    const user = await privyClient.verifyAuthToken(token)
    if (!user?.userId) {
      console.warn('No user ID found in verified token')
      return { isAuthenticated: false }
    }

    return { isAuthenticated: true, userId: user.userId }
  } catch (error) {
    console.error('Error verifying auth token:', error)
    return { isAuthenticated: false }
  }
}

export function getAuthToken(): string | null {
  // Implementation pending
  return null
} 