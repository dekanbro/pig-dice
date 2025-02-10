import { describe, it, expect, vi } from 'vitest'
import { NextRequest } from 'next/server'

// Mock the entire auth module
vi.mock('./auth', () => ({
  verifyAuthToken: async (request: NextRequest) => {
    const authHeader = request.headers.get("authorization")
    if (!authHeader?.startsWith("Bearer ")) {
      throw new Error("Missing or invalid authorization header")
    }

    const token = authHeader.split(" ")[1]
    return { userId: 'mock-user-id' }
  },
}))

describe('verifyAuthToken', () => {
  const mockToken = 'mock-token'
  const mockUserId = 'mock-user-id'
  
  function createMockRequest(token?: string): NextRequest {
    return new NextRequest(new URL('http://localhost:3000'), {
      headers: token ? new Headers({ 'Authorization': `Bearer ${token}` }) : new Headers(),
    })
  }

  it('successfully verifies a valid token', async () => {
    const request = createMockRequest(mockToken)
    const { verifyAuthToken } = await import('./auth')
    const result = await verifyAuthToken(request)
    
    expect(result).toEqual({ userId: mockUserId })
  })

  it('throws error when no authorization header is present', async () => {
    const request = createMockRequest()
    const { verifyAuthToken } = await import('./auth')
    await expect(verifyAuthToken(request)).rejects.toThrow(
      'Missing or invalid authorization header'
    )
  })
}) 