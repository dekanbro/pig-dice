import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'
import middleware from './middleware'
import * as auth from './lib/auth'

// Mock auth module
vi.mock('./lib/auth', () => ({
  verifyAuthToken: vi.fn(),
}))

describe('middleware', () => {
  const mockUserId = 'mock-user-id'
  const mockToken = 'mock-token'

  function createMockRequest(path: string, token?: string): NextRequest {
    return new NextRequest(new URL(`http://localhost:3000${path}`), {
      headers: token ? new Headers({ 'cookie': `privy-token=${token}` }) : new Headers(),
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('allows access to public paths without token', async () => {
    const publicPaths = ['/', '/api/auth']
    
    for (const path of publicPaths) {
      const request = createMockRequest(path)
      const response = await middleware(request)
      
      expect(response?.status).toBe(200)
      expect(auth.verifyAuthToken).not.toHaveBeenCalled()
    }
  })

  it('redirects to home when accessing protected route without token', async () => {
    const request = createMockRequest('/game')
    const response = await middleware(request)
    
    expect(response).toBeInstanceOf(NextResponse)
    expect(response?.status).toBe(307)
    expect(response?.headers.get('Location')).toBe('http://localhost:3000/')
  })

  it('allows access to protected route with valid token', async () => {
    vi.mocked(auth.verifyAuthToken).mockResolvedValue({ userId: mockUserId })
    
    const request = createMockRequest('/game', mockToken)
    const response = await middleware(request)
    
    expect(response).toBeInstanceOf(NextResponse)
    expect(response?.status).toBe(200)
    expect(auth.verifyAuthToken).toHaveBeenCalled()
  })

  it('redirects to home when token verification fails', async () => {
    vi.mocked(auth.verifyAuthToken).mockRejectedValue(new Error('Invalid token'))
    
    const request = createMockRequest('/game', mockToken)
    const response = await middleware(request)
    
    expect(response).toBeInstanceOf(NextResponse)
    expect(response?.status).toBe(307)
    expect(response?.headers.get('Location')).toBe('http://localhost:3000/')
  })

  it('preserves token in response cookies on successful verification', async () => {
    vi.mocked(auth.verifyAuthToken).mockResolvedValue({ userId: mockUserId })
    
    const request = createMockRequest('/game', mockToken)
    const response = await middleware(request)
    
    expect(response).toBeInstanceOf(NextResponse)
    const cookie = response?.cookies.get('privy-token')
    expect(cookie?.value).toBe(mockToken)
    expect(cookie).toMatchObject({
      value: mockToken,
      path: '/',
      secure: true,
      sameSite: 'strict',
      maxAge: 86400 // 24 hours
    })
  })

  it('clears token cookie when verification fails', async () => {
    vi.mocked(auth.verifyAuthToken).mockRejectedValue(new Error('Invalid token'))
    
    const request = createMockRequest('/game', mockToken)
    const response = await middleware(request)
    
    expect(response).toBeInstanceOf(NextResponse)
    const cookie = response?.cookies.get('privy-token')
    expect(cookie).toMatchObject({
      value: '',
      path: '/',
      expires: new Date(0)
    })
  })
}) 