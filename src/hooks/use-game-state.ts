import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { toast } from '@/components/ui/use-toast'
import { getCookie } from 'cookies-next'
import { STANDARD_MULTIPLIERS, GAME_CONFIG } from '@/lib/constants'

// Convert number to fixed precision (3 decimals) to avoid floating point issues
function toFixed3(num: number): number {
  return Number(num.toFixed(3))
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
  recentWinners: []
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
        // Get raw values first
        const rawNewAmount = Number(amount.toFixed(10))
        const rawOldAmount = Number(get().jackpotAmount.toFixed(10))
        const rawContribution = Number((rawNewAmount - rawOldAmount).toFixed(10))
        
        // Then apply fixed precision for display
        const fixedAmount = toFixed3(rawNewAmount)
        const fixedOldAmount = toFixed3(rawOldAmount)
        const fixedContribution = toFixed3(rawContribution)
        
        console.log('Setting jackpot amount (detailed):', { 
          rawOldAmount,
          rawNewAmount,
          rawContribution,
          fixedOldAmount,
          fixedAmount,
          fixedContribution,
          beforeRounding: {
            sum: Number((rawOldAmount + GAME_CONFIG.ROLL_COST).toFixed(10)),
            difference: Number((rawOldAmount + GAME_CONFIG.ROLL_COST - rawOldAmount).toFixed(10))
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
          jackpotAmount: state.jackpotAmount,
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
        console.log('Rehydrated state:', { 
          jackpotAmount: state?.jackpotAmount,
          lastJackpotContribution: state?.lastJackpotContribution,
          recentWinners: state?.recentWinners,
          currentStreak: state?.currentStreak,
          currentBank: state?.currentBank,
          gameStarted: state?.gameStarted,
          previousRolls: state?.previousRolls
        })
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
}

export function useGameState(userId?: string): UseGameStateReturn {
  const state = useGameStore()
  
  async function handleStartGame() {
    if (!userId || state.sessionBank < GAME_CONFIG.ROLL_COST) return
    
    // Reset all game state
    state.setGameStarted(true)
    state.setSessionBank(state.sessionBank - GAME_CONFIG.ROLL_COST)
    state.setCurrentBank(GAME_CONFIG.ROLL_COST)
    state.setCurrentStreak(0)
    state.setPreviousRolls([])
    state.setCurrentRoll([])
    state.setBonusType(null)
    state.setBonusRolls([])
    state.setShowBust(false)
    state.setRolling(true)  // Start rolling animation
    
    state.setSessionStats({
      totalGames: state.sessionStats.totalGames + 1
    })

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

    const token = getCookie('privy-token')
    if (!token) {
      toast({
        title: "Authentication Error",
        description: "Please reconnect your wallet.",
        variant: "destructive"
      })
      return
    }

    try {
      state.setRolling(true)
      state.setSessionBank(state.sessionBank - GAME_CONFIG.ROLL_COST)

      // Get initial jackpot amount
      const initialJackpot = state.jackpotAmount
      
      const response = await fetch('/api/game/roll', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          betAmount: GAME_CONFIG.ROLL_COST,
          currentBank: state.currentBank,
          currentStreak: state.currentStreak,
          previousRolls: state.previousRolls,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Roll failed')
      }

      const { data } = await response.json()
      const {
        roll,
        payout,
        bonusType: newBonusType,
        bonusRolls: newBonusRolls,
        isBust,
        newStreak,
        jackpotContribution,
        multiplier
      } = data

      // Update game state
      state.setCurrentRoll([roll])
      state.setCurrentStreak(newStreak)
      
      // Log the actual multiplier and payout details
      console.log('Roll result:', {
        roll,
        baseMultiplier: STANDARD_MULTIPLIERS[roll as keyof typeof STANDARD_MULTIPLIERS],
        finalMultiplier: multiplier,
        currentBank: state.currentBank,
        payout,
        currentStreak: state.currentStreak,
        newStreak
      })

      // Handle different roll outcomes
      if (isBust) {
        // Handle bust
        state.setCurrentBank(0)
        state.setShowBust(true)
        state.setGameStarted(false)
        state.setPreviousRolls([])  // Reset dice history on bust
        state.setCurrentRoll([])    // Also reset current roll
      } else {
        // Handle all non-bust cases
        console.log('Setting new bank amount:', {
          currentBank: state.currentBank,
          payout,
          roll,
          multiplier,
          streak: state.currentStreak
        })
        state.setCurrentBank(toFixed3(payout))  // Ensure we use toFixed3 here
        state.setPreviousRolls([...state.previousRolls, roll])
      }

      // Update jackpot in a single place
      // Always add roll cost first
      const newJackpot = initialJackpot + GAME_CONFIG.ROLL_COST
      
      // Then add any additional contribution
      const finalJackpot = jackpotContribution > 0 
        ? newJackpot + jackpotContribution
        : newJackpot

      console.log('Jackpot update:', {
        initialJackpot,
        rollCost: GAME_CONFIG.ROLL_COST,
        newJackpot,
        jackpotContribution,
        finalJackpot
      })

      state.setJackpotAmount(finalJackpot)

      // Handle bonus rounds
      if (newBonusType) {
        state.setBonusType(newBonusType)
        state.setBonusRolls(newBonusRolls || [])
      }

      // Update session stats
      const isWin = multiplier > 1
      state.setSessionStats({
        totalGames: state.sessionStats.totalGames + 1,
        wins: isWin ? state.sessionStats.wins + 1 : state.sessionStats.wins,
        highestWin: Math.max(state.sessionStats.highestWin, payout),
        winRate: (state.sessionStats.wins / (state.sessionStats.totalGames + 1)) * 100,
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
    simulateMiniBonusBonus
  }
}