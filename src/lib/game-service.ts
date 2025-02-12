import { createClient } from '@/lib/supabase/client'
import type { GameState } from '@/types/supabase'
import { JACKPOT_RATES } from '@/lib/constants'
import { getCookie } from 'cookies-next'

interface JackpotData {
  amount: number
  last_updated: string
}

interface GameStateResponse {
  game_state: Omit<GameState, 'jackpotAmount'>
}

interface RollResult {
  roll: number
  payout: number
  bonusType: 'MEGA_BONUS' | 'MINI_BONUS' | null
  bonusRolls: number[] | null
  isBust: boolean
  newStreak: number
  jackpotContribution: number
  multiplier: number
  newJackpot: number
}

export async function handleGameRoll(
  currentBank: number,
  currentStreak: number,
  previousRolls: number[]
): Promise<RollResult> {
  const token = getCookie('privy-token')
  if (!token) throw new Error('Not authenticated')

  const response = await fetch('/api/game/roll', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      currentBank,
      currentStreak,
      previousRolls,
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to process roll')
  }

  const { data } = await response.json()
  return data as RollResult
}

export async function saveGameState(state: GameState, userId?: string): Promise<void> {
  try {
    if (!userId) throw new Error('User not authenticated')
    
    const token = getCookie('privy-token')
    if (!token) throw new Error('Not authenticated')

    const response = await fetch('/api/game/state', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        gameState: state
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to save game state')
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error saving game state:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      })
    }
    throw error
  }
}

export async function loadGameState(userId?: string): Promise<GameState | null> {
  try {
    if (!userId) throw new Error('User not authenticated')
    
    const token = getCookie('privy-token')
    if (!token) throw new Error('Not authenticated')

    const response = await fetch('/api/game/state', {
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to load game state')
    }

    const { data } = await response.json()
    return data as GameState
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error loading game state:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      })
    }
    throw error
  }
}

export async function subscribeToGameState(
  userId: string, 
  onUpdate: (state: Partial<GameState>) => void
): Promise<() => void> {
  const supabase = createClient()
  
  const gameStateSubscription = supabase
    .channel('game_state_changes')
    .on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'game_data',
      filter: `user_id=eq.${userId}`
    }, (payload) => {
      const newState = payload.new as unknown as GameStateResponse
      if (newState?.game_state) {
        onUpdate(newState.game_state)
      }
    })
    .subscribe()
    
  const jackpotSubscription = supabase
    .channel('jackpot_changes')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'jackpot'
    }, (payload) => {
      const jackpotData = payload.new as unknown as JackpotData
      onUpdate({ jackpotAmount: jackpotData?.amount ?? JACKPOT_RATES.INITIAL_AMOUNT })
    })
    .subscribe()
    
  return () => {
    gameStateSubscription.unsubscribe()
    jackpotSubscription.unsubscribe()
  }
} 