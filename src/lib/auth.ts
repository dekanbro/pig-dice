import { NextRequest } from "next/server"
import { PrivyClient } from "@privy-io/server-auth"

if (!process.env.NEXT_PUBLIC_PRIVY_APP_ID) {
  throw new Error('NEXT_PUBLIC_PRIVY_APP_ID is not set')
}

if (!process.env.PRIVY_APP_SECRET) {
  throw new Error('PRIVY_APP_SECRET is not set')
}

const privy = new PrivyClient(
  process.env.NEXT_PUBLIC_PRIVY_APP_ID,
  process.env.PRIVY_APP_SECRET
)

export async function verifyAuthToken(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader?.startsWith("Bearer ")) {
      console.error('Invalid auth header:', authHeader)
      throw new Error("Missing or invalid authorization header")
    }

    const token = authHeader.split(" ")[1]
    console.log('Attempting to verify token...')
    
    try {
      const verifiedUser = await privy.verifyAuthToken(token)
      console.log('Token verified successfully:', verifiedUser)
      return { userId: verifiedUser.userId }
    } catch (verifyError: any) {
      console.error('Privy verification error:', {
        error: verifyError,
        message: verifyError.message,
        details: verifyError.details
      })
      throw new Error(`Token verification failed: ${verifyError.message}`)
    }
  } catch (error) {
    console.error("Auth error:", error)
    throw error
  }
} 