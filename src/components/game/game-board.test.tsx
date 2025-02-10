import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@/test/utils'
import { GameBoard } from './game-board'
import { usePrivy } from '@privy-io/react-auth'
import { useGameState } from '@/hooks/use-game-state'
import type { User, Wallet } from '@privy-io/react-auth'
import type { UseGameStateReturn } from '@/hooks/use-game-state'

// Mock the hooks
vi.mock('@privy-io/react-auth')
vi.mock('@/hooks/use-game-state')

describe('GameBoard', () => {
  // Mock user data
  const mockWallet: Partial<Wallet> = {
    address: '0x123',
    chainType: 'ethereum',
    imported: false,
    delegated: false,
    walletIndex: 0
  }

  const mockUser: Partial<User> = {
    id: 'test-user-id',
    wallet: mockWallet as Wallet
  }

  // Base game state
  const baseGameState: UseGameStateReturn = {
    isRolling: false,
    lastRoll: null,
    currentBank: 0.1,
    currentStreak: 0,
    previousRolls: [],
    gameStarted: true,
    bonusType: null,
    bonusRolls: [],
    showBust: false,
    handleStartGame: vi.fn(),
    handleRoll: vi.fn(),
    handleBust: vi.fn(),
    handleCashout: vi.fn(),
    handleRollComplete: vi.fn(),
    handleBonusDismiss: vi.fn(),
    handleBustDismiss: vi.fn(),
    simulateMegaBonus: vi.fn(),
    simulateMiniBonusBonus: vi.fn(),
    setCurrentBank: vi.fn(),
  }

  beforeEach(() => {
    vi.mocked(usePrivy).mockReturnValue({
      user: mockUser,
      authenticated: true,
      ready: true,
    } as ReturnType<typeof usePrivy>)

    vi.mocked(useGameState).mockReturnValue(baseGameState)
  })

  it('renders basic game elements', () => {
    render(<GameBoard />)
    
    expect(screen.getByText('Push Your Luck!')).toBeInTheDocument()
    expect(screen.getByText('Current Bank')).toBeInTheDocument()
    expect(screen.getByText('Streak')).toBeInTheDocument()
  })

  it('hides roll history during dice roll', () => {
    vi.mocked(useGameState).mockReturnValue({
      ...baseGameState,
      isRolling: true,
      previousRolls: [1, 2, 3],
    })

    render(<GameBoard />)
    
    // Roll history should not be visible
    const rollHistory = screen.queryByRole('list')
    expect(rollHistory).not.toBeInTheDocument()
  })

  it('shows roll history after dice roll completes', () => {
    vi.mocked(useGameState).mockReturnValue({
      ...baseGameState,
      isRolling: false,
      previousRolls: [1, 2, 3],
    })

    render(<GameBoard />)
    
    // Roll history should be visible
    const rolls = screen.getAllByRole('generic').filter(el => el.textContent?.match(/^[1-6]$/))
    expect(rolls).toHaveLength(3)
  })

  it('hides bonus panel during dice roll', () => {
    vi.mocked(useGameState).mockReturnValue({
      ...baseGameState,
      isRolling: true,
      bonusType: 'MEGA_BONUS',
      bonusRolls: [6, 6],
    })

    render(<GameBoard />)
    
    // Bonus panel should not be visible
    expect(screen.queryByText(/MEGA BONUS/)).not.toBeInTheDocument()
  })

  it('shows bonus panel after dice roll completes', () => {
    vi.mocked(useGameState).mockReturnValue({
      ...baseGameState,
      isRolling: false,
      bonusType: 'MEGA_BONUS',
      bonusRolls: [6, 6],
    })

    render(<GameBoard />)
    
    // Bonus panel should be visible
    expect(screen.getByText(/MEGA BONUS/)).toBeInTheDocument()
  })

  it('hides bust animation during dice roll', () => {
    vi.mocked(useGameState).mockReturnValue({
      ...baseGameState,
      isRolling: true,
      showBust: true,
    })

    render(<GameBoard />)
    
    // Bust animation should not be visible
    expect(screen.queryByText('BUST!')).not.toBeInTheDocument()
  })

  it('shows bust animation after dice roll completes', () => {
    vi.mocked(useGameState).mockReturnValue({
      ...baseGameState,
      isRolling: false,
      showBust: true,
    })

    render(<GameBoard />)
    
    // Bust animation should be visible
    expect(screen.getByText('BUST!')).toBeInTheDocument()
  })

  it('disables game controls during rolling', () => {
    vi.mocked(useGameState).mockReturnValue({
      ...baseGameState,
      isRolling: true,
      gameStarted: true,
    })

    render(<GameBoard />)
    
    // Roll button should be disabled
    const rollButton = screen.getByText('Rolling...')
    expect(rollButton).toBeDisabled()
  })

  it('enables game controls after rolling completes', () => {
    vi.mocked(useGameState).mockReturnValue({
      ...baseGameState,
      isRolling: false,
      gameStarted: true,
    })

    render(<GameBoard />)
    
    // Roll button should be enabled
    const rollButton = screen.getByText('Roll Again')
    expect(rollButton).not.toBeDisabled()
  })
}) 