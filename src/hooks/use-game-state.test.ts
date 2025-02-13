import { act, renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useGameState } from './use-game-state'
import { createClient } from '@supabase/supabase-js'
import { GAME_CONFIG } from '@/lib/constants'
import { loadGameState, subscribeToGameState, handleGameRoll } from '@/lib/game-service'
import type { GameState } from '@/types/supabase'

// Define RollResult type since it's not exported
interface RollResult {
  roll: number
  payout: number
  multiplier: number
  isBust: boolean
  newStreak: number
  newJackpot: number
  jackpotWon: boolean
  bonusType: 'MEGA_BONUS' | 'MINI_BONUS' | null
  bonusRolls: number[] | null
  jackpotContribution: number
}

// Type for mocked Supabase client
type MockSupabaseClient = {
  rpc: ReturnType<typeof vi.fn>
  supabaseUrl: string
  supabaseKey: string
  from: ReturnType<typeof vi.fn>
  schema: ReturnType<typeof vi.fn>
}

// Mock Supabase client
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    rpc: vi.fn(() => ({ error: null }))
  }))
}))

// Mock game service functions
vi.mock('@/lib/game-service', () => ({
  loadGameState: vi.fn(),
  saveGameState: vi.fn(),
  subscribeToGameState: vi.fn(),
  handleGameRoll: vi.fn()
}))

// Mock cookies-next
vi.mock('cookies-next', () => ({
  getCookie: vi.fn(() => 'mock-token')
}))

// Type for subscription callback
type SubscriptionCallback = (state: Partial<GameState>) => void

describe('useGameState - Jackpot Functionality', () => {
  const userId = 'test-user'
  const mockInitialState: GameState = {
    jackpotAmount: GAME_CONFIG.INITIAL_JACKPOT,
    sessionBank: 100,
    currentBank: 0,
    currentStreak: 0,
    sessionStats: {
      totalGames: 0,
      wins: 0,
      highestWin: 0,
      winRate: 0
    },
    gameStarted: false,
    previousRolls: [],
    bonusType: null,
    bonusRolls: [],
    jackpotWon: false,
    recentWinners: []
  }

  beforeEach(() => {
    // Reset all mocks before each test
    vi.resetAllMocks()
    
    // Setup default mock implementations
    vi.mocked(loadGameState).mockResolvedValue(mockInitialState)
    vi.mocked(subscribeToGameState).mockImplementation((_: string, callback: SubscriptionCallback) => {
      // Store callback for manual triggering in tests
      ;(global as { mockSubscriptionCallback?: SubscriptionCallback }).mockSubscriptionCallback = callback
      return Promise.resolve(() => {})
    })
  })

  afterEach(() => {
    // Clear subscription callback after each test
    delete (global as { mockSubscriptionCallback?: SubscriptionCallback }).mockSubscriptionCallback
  })

  it('should initialize with default jackpot state', async () => {
    const { result } = renderHook(() => useGameState(userId))
    
    await waitFor(() => {
      expect(result.current.jackpotAmount).toBe(GAME_CONFIG.INITIAL_JACKPOT)
      expect(result.current.jackpotWon).toBe(false)
    })
  })

  it('should update jackpot amount on roll', async () => {
    const newJackpot = GAME_CONFIG.INITIAL_JACKPOT + 0.01
    const mockRollResult: RollResult = {
      roll: 4,
      payout: 10,
      multiplier: 1.5,
      isBust: false,
      newStreak: 1,
      newJackpot,
      jackpotWon: false,
      bonusType: null,
      bonusRolls: null,
      jackpotContribution: 0.01
    }
    vi.mocked(handleGameRoll).mockResolvedValue(mockRollResult)

    const { result } = renderHook(() => useGameState(userId))

    // Start game and roll
    await act(async () => {
      await result.current.handleStartGame()
      await result.current.handleRoll()
    })

    // Simulate subscription update
    await act(async () => {
      const callback = (global as { mockSubscriptionCallback?: SubscriptionCallback }).mockSubscriptionCallback
      if (callback) {
        callback({
          jackpotAmount: newJackpot,
          jackpotWon: false
        })
      }
    })

    expect(result.current.jackpotAmount).toBe(newJackpot)
    expect(result.current.jackpotWon).toBe(false)
  })

  it('should handle jackpot win correctly', async () => {
    const mockRollResult: RollResult = {
      roll: 4,
      payout: 10,
      multiplier: 1.5,
      isBust: false,
      newStreak: 1,
      newJackpot: 0,
      jackpotWon: true,
      bonusType: null,
      bonusRolls: null,
      jackpotContribution: 0
    }
    vi.mocked(handleGameRoll).mockResolvedValue(mockRollResult)

    const { result } = renderHook(() => useGameState(userId))

    // Start game and roll
    await act(async () => {
      await result.current.handleStartGame()
      await result.current.handleRoll()
    })

    // Simulate subscription update for jackpot win
    await act(async () => {
      const callback = (global as { mockSubscriptionCallback?: SubscriptionCallback }).mockSubscriptionCallback
      if (callback) {
        callback({
          jackpotAmount: 0,
          jackpotWon: true
        })
      }
    })

    expect(result.current.jackpotAmount).toBe(0)
    expect(result.current.jackpotWon).toBe(true)
  })

  it('should reset jackpot won state when continuing to roll', async () => {
    const mockRpc = vi.fn().mockResolvedValue({ error: null })
    const mockSupabase: MockSupabaseClient = {
      rpc: mockRpc,
      supabaseUrl: 'test',
      supabaseKey: 'test',
      from: vi.fn(),
      schema: vi.fn()
    }

    vi.mocked(createClient).mockImplementation(() => mockSupabase as unknown as ReturnType<typeof createClient>)

    // First roll wins jackpot
    const mockWinResult: RollResult = {
      roll: 4,
      payout: 10,
      multiplier: 1.5,
      isBust: false,
      newStreak: 1,
      newJackpot: 0,
      jackpotWon: true,
      bonusType: null,
      bonusRolls: null,
      jackpotContribution: 0
    }
    vi.mocked(handleGameRoll).mockResolvedValueOnce(mockWinResult)

    // Second roll adds to new jackpot
    const mockNextResult: RollResult = {
      roll: 4,
      payout: 15,
      multiplier: 1.5,
      isBust: false,
      newStreak: 2,
      newJackpot: 0.01,
      jackpotWon: false,
      bonusType: null,
      bonusRolls: null,
      jackpotContribution: 0.01
    }
    vi.mocked(handleGameRoll).mockResolvedValueOnce(mockNextResult)

    const { result } = renderHook(() => useGameState(userId))

    // Start game and win jackpot
    await act(async () => {
      await result.current.handleStartGame()
      await result.current.handleRoll()
    })

    // Simulate subscription update for jackpot win
    await act(async () => {
      const callback = (global as { mockSubscriptionCallback?: SubscriptionCallback }).mockSubscriptionCallback
      if (callback) {
        callback({
          jackpotAmount: 0,
          jackpotWon: true
        })
      }
    })

    expect(result.current.jackpotAmount).toBe(0)
    expect(result.current.jackpotWon).toBe(true)

    // Continue rolling
    await act(async () => {
      await result.current.handleRoll()
    })

    // Simulate subscription update for new jackpot
    await act(async () => {
      const callback = (global as { mockSubscriptionCallback?: SubscriptionCallback }).mockSubscriptionCallback
      if (callback) {
        callback({
          jackpotAmount: 0.01,
          jackpotWon: false
        })
      }
    })

    expect(mockRpc).toHaveBeenCalledWith('reset_jackpot_won')
    expect(result.current.jackpotAmount).toBe(0.01)
    expect(result.current.jackpotWon).toBe(false)
  })

  it('should handle subscription updates to jackpot state', async () => {
    const { result } = renderHook(() => useGameState(userId))
    
    // Wait for initial state to load
    await waitFor(() => {
      expect(result.current.jackpotAmount).toBe(GAME_CONFIG.INITIAL_JACKPOT)
    })

    // Simulate subscription update
    await act(async () => {
      const callback = (global as { mockSubscriptionCallback?: SubscriptionCallback }).mockSubscriptionCallback
      if (callback) {
        callback({
          jackpotAmount: 1.5,
          jackpotWon: true
        })
      }
    })

    expect(result.current.jackpotAmount).toBe(1.5)
    expect(result.current.jackpotWon).toBe(true)
  })

  it('should reset jackpot won state when starting new game', async () => {
    const mockRpc = vi.fn().mockResolvedValue({ error: null })
    const mockSupabase: MockSupabaseClient = {
      rpc: mockRpc,
      supabaseUrl: 'test',
      supabaseKey: 'test',
      from: vi.fn(),
      schema: vi.fn()
    }
    
    vi.mocked(createClient).mockImplementation(() => mockSupabase as unknown as ReturnType<typeof createClient>)
    
    const { result } = renderHook(() => useGameState(userId))

    // Set initial state with jackpot won
    await act(async () => {
      result.current.setJackpotWon(true)
    })

    expect(result.current.jackpotWon).toBe(true)

    // Start new game
    await act(async () => {
      await result.current.handleStartGame()
    })

    // Simulate subscription update for reset jackpot
    await act(async () => {
      const callback = (global as { mockSubscriptionCallback?: SubscriptionCallback }).mockSubscriptionCallback
      if (callback) {
        callback({
          jackpotAmount: GAME_CONFIG.INITIAL_JACKPOT,
          jackpotWon: false
        })
      }
    })

    expect(mockRpc).toHaveBeenCalledWith('reset_jackpot_won')
    expect(result.current.jackpotWon).toBe(false)
  })
}) 