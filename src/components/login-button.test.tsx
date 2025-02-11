import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '../test/utils'
import { LoginButton } from './login-button'
import { usePrivy, type PrivyInterface, type Wallet, type User } from '@privy-io/react-auth'

// Mock usePrivy hook
vi.mock('@privy-io/react-auth', () => ({
  usePrivy: vi.fn(),
  PrivyProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

describe('LoginButton', () => {
  it('renders connect wallet button when not authenticated', () => {
    const mockLogin = vi.fn()
    const mockLogout = vi.fn()
    const mockPrivy: Partial<PrivyInterface> = {
      login: mockLogin,
      logout: mockLogout,
      authenticated: false,
      ready: true,
      user: null,
    }

    vi.mocked(usePrivy).mockReturnValue(mockPrivy as PrivyInterface)
    render(<LoginButton />)
    
    const button = screen.getByRole('button', { name: /connect wallet/i })
    expect(button).toBeInTheDocument()
    
    fireEvent.click(button)
    expect(mockLogin).toHaveBeenCalled()
  })

  it('renders disconnect button when authenticated', () => {
    const mockLogin = vi.fn()
    const mockLogout = vi.fn()
    const mockWallet: Wallet = {
      address: '0x123',
      chainType: 'ethereum',
      imported: false,
      delegated: false,
      walletIndex: 0,
    }
    const mockUser: User = {
      id: 'test-user',
      createdAt: new Date(),
      linkedAccounts: [],
      mfaMethods: [],
      wallet: mockWallet,
      hasAcceptedTerms: true,
      isGuest: false,
    }
    const mockPrivy: Partial<PrivyInterface> = {
      login: mockLogin,
      logout: mockLogout,
      authenticated: true,
      ready: true,
      user: mockUser,
    }

    vi.mocked(usePrivy).mockReturnValue(mockPrivy as PrivyInterface)
    render(<LoginButton />)
    
    const button = screen.getByRole('button', { name: /disconnect wallet/i })
    expect(button).toBeInTheDocument()
    
    fireEvent.click(button)
    expect(mockLogout).toHaveBeenCalled()
  })

  it('renders nothing when not ready', () => {
    const mockLogin = vi.fn()
    const mockLogout = vi.fn()
    const mockPrivy: Partial<PrivyInterface> = {
      login: mockLogin,
      logout: mockLogout,
      authenticated: false,
      ready: false,
      user: null,
    }

    vi.mocked(usePrivy).mockReturnValue(mockPrivy as PrivyInterface)
    const { container } = render(<LoginButton />)
    expect(container.firstChild).toBeNull()
  })
}) 