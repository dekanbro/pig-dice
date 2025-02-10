import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '../test/utils'
import { LoginButton } from './login-button'
import { usePrivy } from '@privy-io/react-auth'

// Mock usePrivy hook
vi.mock('@privy-io/react-auth', () => ({
  usePrivy: vi.fn(),
  PrivyProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

describe('LoginButton', () => {
  it('renders connect wallet button when not authenticated', () => {
    const mockLogin = vi.fn()
    vi.mocked(usePrivy).mockReturnValue({
      login: mockLogin,
      logout: vi.fn(),
      authenticated: false,
      ready: true,
      user: null,
      connectWallet: vi.fn(),
      createWallet: vi.fn(),
      linkWallet: vi.fn(),
      unlinkWallet: vi.fn(),
      exportWallet: vi.fn(),
      sendTransaction: vi.fn(),
      signMessage: vi.fn(),
      getAccessToken: vi.fn(),
    } as any)

    render(<LoginButton />)
    
    const button = screen.getByRole('button', { name: /connect wallet/i })
    expect(button).toBeInTheDocument()
    
    fireEvent.click(button)
    expect(mockLogin).toHaveBeenCalled()
  })

  it('renders disconnect button when authenticated', () => {
    const mockLogout = vi.fn()
    vi.mocked(usePrivy).mockReturnValue({
      login: vi.fn(),
      logout: mockLogout,
      authenticated: true,
      ready: true,
      user: {
        id: 'test-user',
        wallet: {
          address: '0x123',
        },
      },
      connectWallet: vi.fn(),
      createWallet: vi.fn(),
      linkWallet: vi.fn(),
      unlinkWallet: vi.fn(),
      exportWallet: vi.fn(),
      sendTransaction: vi.fn(),
      signMessage: vi.fn(),
      getAccessToken: vi.fn(),
    } as any)

    render(<LoginButton />)
    
    const button = screen.getByRole('button', { name: /disconnect wallet/i })
    expect(button).toBeInTheDocument()
    
    fireEvent.click(button)
    expect(mockLogout).toHaveBeenCalled()
  })

  it('renders nothing when not ready', () => {
    vi.mocked(usePrivy).mockReturnValue({
      login: vi.fn(),
      logout: vi.fn(),
      authenticated: false,
      ready: false,
      user: null,
      connectWallet: vi.fn(),
      createWallet: vi.fn(),
      linkWallet: vi.fn(),
      unlinkWallet: vi.fn(),
      exportWallet: vi.fn(),
      sendTransaction: vi.fn(),
      signMessage: vi.fn(),
      getAccessToken: vi.fn(),
    } as any)

    const { container } = render(<LoginButton />)
    expect(container).toBeEmptyDOMElement()
  })
}) 