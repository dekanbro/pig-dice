// Note: Keep imports clean - remove any unused imports to prevent linting errors
import { NextRequest } from 'next/server'
import { PrivyClient } from '@privy-io/server-auth'

const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID || ''
const PRIVY_APP_SECRET = process.env.PRIVY_APP_SECRET || ''

interface AuthResult {
  isAuthenticated: boolean
  userId?: string
}

const privyClient = new PrivyClient(
  PRIVY_APP_ID,
  PRIVY_APP_SECRET
)

export async function verifyAuthToken(request: NextRequest): Promise<AuthResult> {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader?.startsWith("Bearer ")) {
      return { isAuthenticated: false }
    }

    const token = authHeader.split(" ")[1]
    const user = await privyClient.verifyAuthToken(token)
    
    return { isAuthenticated: true, userId: user.userId }
  } catch {
    return { isAuthenticated: false }
  }
}

export function getAuthToken(): string | null {
  // Implementation pending
  return null
} 