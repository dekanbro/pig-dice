import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { toast } from '@/components/ui/use-toast'
import { STANDARD_MULTIPLIERS, GAME_CONFIG } from '@/lib/constants'
import { saveGameState, loadGameState, subscribeToGameState, handleGameRoll } from '@/lib/game-service'
import { useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

// Convert number to fixed precision (3 decimals) to avoid floating point issues
function toFixed3(num: number | undefined | null): number {
  if (num === undefined || num === null) {
    console.warn('toFixed3 called with undefined/null value, using 0')
    return 0
  }
  return Number(Number(num).toFixed(3))
}

// Helper function to get roll description
export function getRollDescription(roll: number, streakBonus?: number) {
  const baseMultiplier = STANDARD_MULTIPLIERS[roll as keyof typeof STANDARD_MULTIPLIERS]
  const finalMultiplier = roll === 1 ? 0 : baseMultiplier + (streakBonus || 0)
  const percentage = (finalMultiplier * 100).toFixed(0)
  const bonusText = streakBonus ? ` (+${(streakBonus * 100).toFixed(0)}% streak)` : ''

  switch (roll) {
    case 1:
      return 'Bust! You lose everything'
    case 2:
      return `Keep ${percentage}% of your bank${bonusText}`
    case 3:
      return `Break even${bonusText} - Bonus chance!`
    case 4:
      return `Win ${percentage}% of your bank${bonusText}`
    case 5:
      return `Win ${percentage}% of your bank${bonusText}`
    case 6:
      return `Break even${bonusText} - Bonus chance!`
    default:
      return 'Invalid roll'
  }
}

// Helper function to get toast variant based on roll outcome
export function getRollVariant(roll: number): 'default' | 'destructive' | 'success' | 'warning' | 'info' {
  switch (roll) {
    case 1:
      return 'destructive'
    case 2:
      return 'warning'
    case 3:
      return 'info'
    case 4:
    case 5:
      return 'success'
    case 6:
      return 'warning'
    default:
      return 'default'
  }
}

interface GameState {
  isRolling: boolean
  currentRoll: number[]
  currentStreak: number
  sessionBank: number
  currentBank: number
  gameStarted: boolean
  bonusType: 'MEGA_BONUS' | 'MINI_BONUS' | null
  bonusRolls: number[]
  showBust: boolean
  previousRolls: number[]
  sessionStats: {
    totalGames: number
    wins: number
    highestWin: number
    winRate: number
  }
  lastBonusCooldown: {
    mega: number | null
    mini: number | null
  }
  jackpotAmount: number
  lastJackpotContribution: number | null
  recentWinners: Array<{
    address: string
    amount: string
    timestamp: string
  }>
  jackpotWon: boolean
}

interface GameActions {
  setRolling: (isRolling: boolean) => void
  setCurrentRoll: (roll: number[]) => void
  setCurrentStreak: (streak: number) => void
  setSessionBank: (amount: number) => void
  setCurrentBank: (amount: number) => void
  setGameStarted: (started: boolean) => void
  setBonusType: (type: GameState['bonusType']) => void
  setBonusRolls: (rolls: number[]) => void
  setShowBust: (show: boolean) => void
  setPreviousRolls: (rolls: number[]) => void
  setSessionStats: (stats: Partial<GameState['sessionStats']>) => void
  setLastBonusCooldown: (cooldown: Partial<GameState['lastBonusCooldown']>) => void
  setJackpotAmount: (amount: number) => void
  setLastJackpotContribution: (amount: number | null) => void
  setJackpotWon: (won: boolean) => void
  addRecentWinner: (winner: { address: string, amount: string }) => void
  reset: () => void
}

const initialState: GameState = {
  isRolling: false,
  currentRoll: [],
  currentStreak: 0,
  sessionBank: 0,
  currentBank: 0,
  gameStarted: false,
  bonusType: null,
  bonusRolls: [],
  showBust: false,
  previousRolls: [],
  sessionStats: {
    totalGames: 0,
    wins: 0,
    highestWin: 0,
    winRate: 0
  },
  lastBonusCooldown: {
    mega: null,
    mini: null
  },
  jackpotAmount: GAME_CONFIG.INITIAL_JACKPOT,
  lastJackpotContribution: null,
  recentWinners: [],
  jackpotWon: false
}

export const useGameStore = create<GameState & GameActions>()(
  persist(
    (set, get) => ({
      ...initialState,
      setRolling: (isRolling) => set({ isRolling }),
      setCurrentRoll: (currentRoll) => set({ currentRoll }),
      setCurrentStreak: (currentStreak) => set({ currentStreak }),
      setSessionBank: (sessionBank) => set({ sessionBank: toFixed3(sessionBank) }),
      setCurrentBank: (currentBank) => set({ currentBank: toFixed3(currentBank) }),
      setGameStarted: (gameStarted) => set({ gameStarted }),
      setBonusType: (bonusType) => set({ bonusType }),
      setBonusRolls: (bonusRolls) => set({ bonusRolls }),
      setShowBust: (showBust) => set({ showBust }),
      setPreviousRolls: (previousRolls) => set({ previousRolls }),
      setSessionStats: (stats) => 
        set((state) => ({
          sessionStats: { ...state.sessionStats, ...stats }
        })),
      setLastBonusCooldown: (cooldown) =>
        set((state) => ({
          lastBonusCooldown: { ...state.lastBonusCooldown, ...cooldown }
        })),
      setJackpotAmount: (amount) => {
        // Handle undefined/null amount
        if (amount === undefined || amount === null) {
          console.warn('setJackpotAmount called with undefined/null amount, using 0')
          amount = 0
        }

        // Get raw values first
        const rawNewAmount = Number(Number(amount).toFixed(10))
        const rawOldAmount = Number((get().jackpotAmount || 0).toFixed(10))
        const rawContribution = Number((rawNewAmount - rawOldAmount).toFixed(10))
        
        // Then apply fixed precision for display
        const fixedAmount = toFixed3(rawNewAmount)
        const fixedOldAmount = toFixed3(rawOldAmount)
        const fixedContribution = toFixed3(rawContribution)
        
        console.log('Setting jackpot amount:', { 
          oldAmount: fixedOldAmount,
          newAmount: fixedAmount,
          contribution: fixedContribution,
          rawValues: {
            oldAmount: rawOldAmount,
            newAmount: rawNewAmount,
            contribution: rawContribution
          }
        })

        // Store raw values in state to prevent precision loss
        set({ 
          jackpotAmount: rawNewAmount,
          lastJackpotContribution: rawContribution > 0 ? toFixed3(rawContribution) : null
        })
      },
      setLastJackpotContribution: (amount) => set({ 
        lastJackpotContribution: amount !== null ? toFixed3(amount) : null 
      }),
      setJackpotWon: (won) => set({ jackpotWon: won }),
      addRecentWinner: (winner) => set((state) => ({
        recentWinners: [
          {
            ...winner,
            timestamp: 'Just now'
          },
          ...state.recentWinners.slice(0, 4)
        ]
      })),
      reset: () => set(initialState)
    }),
    {
      name: 'game-storage',
      partialize: (state) => {
        const partialState = {
          jackpotAmount: state.jackpotAmount || 0, // Ensure we never persist undefined/null
          jackpotWon: state.jackpotWon,
          sessionStats: state.sessionStats,
          sessionBank: toFixed3(state.sessionBank),
          recentWinners: state.recentWinners,
          // Add game state persistence
          currentStreak: state.currentStreak,
          currentBank: toFixed3(state.currentBank),
          gameStarted: state.gameStarted,
          previousRolls: state.previousRolls,
          bonusType: state.bonusType,
          bonusRolls: state.bonusRolls
        }
        console.log('Persisting state:', partialState)
        return partialState
      },
      onRehydrateStorage: () => (state) => {
        if (state) {
          console.log('Rehydrated state:', { 
            jackpotAmount: state.jackpotAmount || 0, // Ensure we never rehydrate undefined/null
            lastJackpotContribution: state.lastJackpotContribution,
            recentWinners: state.recentWinners,
            currentStreak: state.currentStreak,
            currentBank: state.currentBank,
            gameStarted: state.gameStarted,
            previousRolls: state.previousRolls
          })
        }
      }
    }
  )
)

export type UseGameStateReturn = GameState & {
  handleStartGame: () => Promise<void>
  handleRoll: () => Promise<void>
  handleBust: () => void
  handleCashout: () => void
  handleRollComplete: () => void
  handleBonusDismiss: () => void
  handleBustDismiss: () => void
  handleDeposit: (amount: number) => void
  handleWithdraw: (amount: number) => boolean
  simulateMegaBonus: () => void
  simulateMiniBonusBonus: () => void
  setJackpotWon: (won: boolean) => void
}

export function useGameState(userId?: string): UseGameStateReturn {
  const state = useGameStore()
  
  // Load initial state and subscribe to updates
  useEffect(() => {
    if (!userId) return

    let unsubscribe: (() => void) | undefined

    const loadState = async () => {
      try {
        const savedState = await loadGameState(userId)
        if (savedState) {
          // Update local state with saved state
          state.setJackpotAmount(savedState.jackpotAmount)
          state.setSessionStats(savedState.sessionStats)
          state.setSessionBank(savedState.sessionBank)
          state.setCurrentStreak(savedState.currentStreak)
          state.setCurrentBank(savedState.currentBank)
          state.setGameStarted(savedState.gameStarted)
          state.setPreviousRolls(savedState.previousRolls)
          state.setBonusType(savedState.bonusType)
          state.setBonusRolls(savedState.bonusRolls)
          state.setJackpotWon(savedState.jackpotWon)
          
          // Subscribe to real-time updates
          unsubscribe = await subscribeToGameState(userId, (newState) => {
            console.log('Received game state update:', {
              currentJackpot: state.jackpotAmount,
              newJackpot: newState.jackpotAmount,
              currentJackpotWon: state.jackpotWon,
              newJackpotWon: newState.jackpotWon,
              timestamp: new Date().toISOString()
            })
            
            // Handle jackpot updates first
            if (newState.jackpotAmount !== undefined) {
              state.setJackpotAmount(newState.jackpotAmount)
            }
            if (newState.jackpotWon !== undefined) {
              state.setJackpotWon(newState.jackpotWon)
            }
            
            // Update other state properties
            if (newState.sessionStats) state.setSessionStats(newState.sessionStats)
            if (newState.sessionBank !== undefined) state.setSessionBank(newState.sessionBank)
            if (newState.currentStreak !== undefined) state.setCurrentStreak(newState.currentStreak)
            if (newState.currentBank !== undefined) state.setCurrentBank(newState.currentBank)
            if (newState.gameStarted !== undefined) state.setGameStarted(newState.gameStarted)
            if (newState.previousRolls) state.setPreviousRolls(newState.previousRolls)
            if (newState.bonusType !== undefined) state.setBonusType(newState.bonusType)
            if (newState.bonusRolls) state.setBonusRolls(newState.bonusRolls)
          })
        }
      } catch (error) {
        console.error('Error loading game state:', error)
      }
    }

    loadState()

    return () => {
      if (unsubscribe) {
        unsubscribe()
      }
    }
  }, [userId, state])

  // Save state to Supabase whenever it changes
  useEffect(() => {
    if (!userId) return

    const saveState = async () => {
      try {
        await saveGameState({
          jackpotAmount: state.jackpotAmount,
          sessionStats: state.sessionStats,
          sessionBank: state.sessionBank,
          recentWinners: state.recentWinners,
          currentStreak: state.currentStreak,
          currentBank: state.currentBank,
          gameStarted: state.gameStarted,
          previousRolls: state.previousRolls,
          bonusType: state.bonusType,
          bonusRolls: state.bonusRolls,
          jackpotWon: state.jackpotWon
        }, userId)
      } catch (error) {
        console.error('Error saving game state:', error)
      }
    }

    saveState()
  }, [
    userId,
    state.jackpotAmount,
    state.sessionStats,
    state.sessionBank,
    state.recentWinners,
    state.currentStreak,
    state.currentBank,
    state.gameStarted,
    state.previousRolls,
    state.bonusType,
    state.bonusRolls,
    state.jackpotWon
  ])

  async function handleStartGame() {
    if (!userId || state.sessionBank < GAME_CONFIG.ROLL_COST) return
    
    console.log('Starting new game:', {
      sessionBank: state.sessionBank,
      rollCost: GAME_CONFIG.ROLL_COST
    })
    
    // Reset all game state
    const initialBank = GAME_CONFIG.ROLL_COST
    const newSessionBank = state.sessionBank - initialBank

    // Reset jackpot won state in database
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    const { error: resetError } = await supabase
      .rpc('reset_jackpot_won')
    
    if (resetError) {
      console.error('Error resetting jackpot won state:', resetError)
    }

    // Set initial state synchronously to ensure correct values
    state.setCurrentBank(initialBank)
    state.setSessionBank(newSessionBank)
    state.setCurrentStreak(0)
    state.setPreviousRolls([])
    state.setCurrentRoll([])
    state.setBonusType(null)
    state.setBonusRolls([])
    state.setShowBust(false)
    state.setGameStarted(true)
    state.setRolling(true)
    state.setJackpotWon(false) // Reset jackpot won flag when starting new game
    
    // Load fresh jackpot value from server
    try {
      const freshState = await loadGameState(userId)
      if (freshState?.jackpotAmount !== undefined) {
        state.setJackpotAmount(freshState.jackpotAmount)
      }
    } catch (error) {
      console.error('Error loading fresh jackpot value:', error)
    }
    
    console.log('Game state after reset:', {
      gameStarted: true,
      sessionBank: newSessionBank,
      currentBank: initialBank,
      currentStreak: 0,
      jackpotWon: false
    })
    
    state.setSessionStats({
      totalGames: state.sessionStats.totalGames + 1
    })

    // Wait a moment for state to settle before first roll
    await new Promise(resolve => setTimeout(resolve, 100))

    // Get current state before rolling
    const currentState = {
      currentBank: state.currentBank,
      sessionBank: state.sessionBank,
      currentStreak: state.currentStreak,
      previousRolls: state.previousRolls
    }
    console.log('State before first roll:', currentState)
    
    // Automatically trigger first roll
    await handleRoll()
  }

  async function handleRoll() {
    if (!userId) return

    // Don't check isRolling here since we want to allow rolling from handleStartGame
    // Only check for subsequent rolls
    if (!state.gameStarted && state.isRolling) return

    // Check if we have enough session bank for the roll
    if (state.sessionBank < GAME_CONFIG.ROLL_COST) {
      toast({
        title: "Insufficient Session Bank",
        description: `You need at least ${GAME_CONFIG.ROLL_COST} PIG in your session bank to roll.`,
        variant: "destructive"
      })
      return
    }

    try {
      // Reset jackpot won state if needed before rolling
      if (state.jackpotWon) {
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )
        const { error: resetError } = await supabase.rpc('reset_jackpot_won')
        if (resetError) {
          console.error('Error resetting jackpot won state:', resetError)
        } else {
          state.setJackpotWon(false)
          console.log('Reset jackpot won state before new roll')
        }
      }

      // Get current state values
      const currentState = {
        currentBank: state.currentBank || GAME_CONFIG.ROLL_COST, // Ensure we have a valid bank amount
        sessionBank: state.sessionBank,
        currentStreak: state.currentStreak,
        previousRolls: state.previousRolls
      }

      console.log('Starting handleRoll:', currentState)

      state.setRolling(true)
      state.setSessionBank(currentState.sessionBank - GAME_CONFIG.ROLL_COST)

      const result = await handleGameRoll(
        currentState.currentBank,
        currentState.currentStreak,
        currentState.previousRolls
      )

      console.log('Roll result from server:', {
        roll: result.roll,
        payout: result.payout,
        multiplier: result.multiplier,
        isBust: result.isBust,
        newStreak: result.newStreak,
        currentBank: currentState.currentBank,
        sentBank: currentState.currentBank,
        newJackpot: result.newJackpot,
        jackpotWon: state.jackpotWon
      })

      // Update game state with roll result
      state.setCurrentRoll([result.roll])
      state.setCurrentStreak(result.newStreak)

      // Handle different roll outcomes
      if (result.isBust) {
        console.log('Handling bust:', {
          currentBank: currentState.currentBank,
          newBank: 0
        })
        // Handle bust
        state.setCurrentBank(0)
        state.setShowBust(true)
        state.setGameStarted(false)
        state.setPreviousRolls([])  // Reset dice history on bust
        state.setCurrentRoll([])    // Also reset current roll
      } else {
        // Handle all non-bust cases
        console.log('Setting new bank amount:', {
          currentBank: currentState.currentBank,
          newBank: result.payout,
          roll: result.roll,
          multiplier: result.multiplier,
          streak: currentState.currentStreak
        })
        state.setCurrentBank(result.payout)  // Use the payout from the server
        state.setPreviousRolls([...currentState.previousRolls, result.roll])
      }

      // Always update jackpot if there's a new value
      if (result.newJackpot !== undefined) {
        console.log('Updating jackpot:', {
          oldJackpot: state.jackpotAmount,
          newJackpot: result.newJackpot,
          jackpotWon: state.jackpotWon,
          serverJackpotWon: result.jackpotWon,
          contribution: result.newJackpot - state.jackpotAmount
        })
        
        // Always update jackpot amount
        state.setJackpotAmount(result.newJackpot)
        
        // Sync won state with server
        if (result.jackpotWon !== state.jackpotWon) {
          state.setJackpotWon(result.jackpotWon)
        }
      }

      // Handle bonus rounds
      if (result.bonusType) {
        state.setBonusType(result.bonusType)
        state.setBonusRolls(result.bonusRolls || [])
      }

      console.log('End of handleRoll:', {
        currentBank: state.currentBank,
        sessionBank: state.sessionBank,
        currentStreak: state.currentStreak,
        previousRolls: state.previousRolls,
        isRolling: state.isRolling,
        sentBank: currentState.currentBank,
        jackpotAmount: state.jackpotAmount,
        jackpotWon: state.jackpotWon
      })

    } catch (error) {
      console.error('Roll error:', error)
      // Refund the roll cost on error
      state.setSessionBank(state.sessionBank + GAME_CONFIG.ROLL_COST)
      toast({
        title: "Roll Failed",
        description: error instanceof Error ? error.message : "Failed to process roll. Please try again.",
        variant: "destructive"
      })
    } finally {
      state.setRolling(false)
    }
  }

  function handleBust() {
    state.setShowBust(true)
    state.setCurrentBank(0)
    state.setCurrentStreak(0)
    state.setGameStarted(false)
    state.setPreviousRolls([])  // Reset dice history
    state.setCurrentRoll([])    // Also reset current roll
  }

  function handleCashout() {
    if (state.currentBank <= 0) return
    
    if (state.currentBank > state.sessionStats.highestWin) {
      state.setSessionStats({
        highestWin: state.currentBank
      })
    }
    
    state.setSessionStats({
      wins: state.sessionStats.wins + 1,
      totalGames: state.sessionStats.totalGames + 1,
      winRate: ((state.sessionStats.wins + 1) / (state.sessionStats.totalGames + 1)) * 100
    })
    
    // Add to recent winners if win is significant
    if (state.currentBank >= GAME_CONFIG.SIGNIFICANT_WIN) {
      state.addRecentWinner({
        address: userId || '0x000...000',
        amount: `${state.currentBank.toFixed(3)} PIG`
      })
    }
    
    state.setSessionBank(state.sessionBank + state.currentBank)
    state.setGameStarted(false)
    state.setCurrentBank(0)
    state.setCurrentStreak(0)
    state.setPreviousRolls([])  // Reset dice history
    state.setCurrentRoll([])    // Also reset current roll
    
    // Don't reset jackpotWon here - it should persist until a new game starts
    
    toast({
      title: 'Cashed Out!',
      description: `Added ${state.currentBank.toFixed(3)} PIG to your session bank`,
      variant: 'success'
    })
  }

  function handleDeposit(amount: number) {
    state.setSessionBank(state.sessionBank + amount)
    toast({
      title: 'Deposit Successful',
      description: `Added ${amount.toFixed(3)} PIG to your session bank`,
      variant: 'success'
    })
  }

  function handleWithdraw(amount: number) {
    if (amount <= state.sessionBank) {
      state.setSessionBank(state.sessionBank - amount)
      toast({
        title: 'Withdrawal Successful',
        description: `Withdrew ${amount.toFixed(3)} PIG from your session bank`,
        variant: 'success'
      })
      return true
    }
    return false
  }

  function handleRollComplete() {
    console.log('handleRollComplete', { currentRoll: state.currentRoll })
    state.setRolling(false)
  }

  function handleBonusDismiss() {
    state.setBonusType(null)
    state.setBonusRolls([])
  }

  function handleBustDismiss() {
    state.setShowBust(false)
  }

  function simulateMegaBonus() {
    if (process.env.NODE_ENV !== 'development') return
    state.setBonusType('MEGA_BONUS')
    state.setBonusRolls([6, 6, 6])
    state.setCurrentBank(state.currentBank * 5)
  }

  function simulateMiniBonusBonus() {
    if (process.env.NODE_ENV !== 'development') return
    state.setBonusType('MINI_BONUS')
    state.setBonusRolls([3, 3])
    state.setCurrentBank(state.currentBank * 2)
  }

  return {
    ...state,
    handleStartGame,
    handleRoll,
    handleBust,
    handleCashout,
    handleRollComplete,
    handleBonusDismiss,
    handleBustDismiss,
    handleDeposit,
    handleWithdraw,
    simulateMegaBonus,
    simulateMiniBonusBonus,
    setJackpotWon: state.setJackpotWon
  }
}