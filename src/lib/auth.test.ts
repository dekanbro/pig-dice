import { describe, it, expect, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { verifyAuthToken } from "./auth"

// Mock the entire privy-io/server-auth module
vi.mock('@privy-io/server-auth', () => ({
  PrivyClient: vi.fn().mockImplementation(() => ({
    verifyAuthToken: vi.fn().mockImplementation((token: string) => {
      if (!token) throw new Error("Invalid token")
      return Promise.resolve({ 
        id: 'mock-user-id',
        email: 'test@example.com',
        wallet: {
          address: '0x123'
        }
      })
    })
  }))
}))

describe('verifyAuthToken', () => {
  const mockUserId = 'mock-user-id'
  
  function createMockRequest(token?: string): NextRequest {
    return new NextRequest(new URL('http://localhost:3000'), {
      headers: token ? new Headers({ 'Authorization': `Bearer ${token}` }) : new Headers(),
    })
  }

  it('successfully verifies a valid token', async () => {
    const request = createMockRequest('valid-token')
    const result = await verifyAuthToken(request)
    
    expect(result).toEqual({
      id: mockUserId,
      email: 'test@example.com',
      wallet: {
        address: '0x123'
      }
    })
  })

  it('throws error when no authorization header is present', async () => {
    const request = createMockRequest()
    await expect(verifyAuthToken(request)).rejects.toThrow(
      'Missing or invalid authorization header'
    )
  })
}) 