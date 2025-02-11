import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { toast } from '@/components/ui/use-toast'
import { getCookie } from 'cookies-next'

const ROLL_COST = 0.01
const INITIAL_JACKPOT = 5.5

// Convert number to fixed precision (3 decimals) to avoid floating point issues
function toFixed3(num: number): number {
  return Number(num.toFixed(3))
}

// Helper function to get roll description
export function getRollDescription(roll: number) {
  switch (roll) {
    case 1:
      return 'Bust! You lose everything'
    case 2:
      return `Small loss `
    case 3:
      return `Break even - Bonus chance!`
    case 4:
      return `Small win `
    case 5:
      return `Medium win `
    case 6:
      return `Break even - Bonus chance!`
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
  jackpotAmount: INITIAL_JACKPOT,
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
        const fixedAmount = toFixed3(amount)
        console.log('Setting jackpot amount:', { 
          oldAmount: toFixed3(get().jackpotAmount),
          newAmount: fixedAmount,
          contribution: toFixed3(fixedAmount - get().jackpotAmount)
        })
        set((state) => ({ 
          jackpotAmount: fixedAmount,
          lastJackpotContribution: toFixed3(fixedAmount - state.jackpotAmount)
        }))
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
          jackpotAmount: toFixed3(state.jackpotAmount),
          sessionStats: state.sessionStats,
          sessionBank: toFixed3(state.sessionBank),
          recentWinners: state.recentWinners
        }
        console.log('Persisting state:', partialState)
        return partialState
      },
      onRehydrateStorage: () => (state) => {
        console.log('Rehydrated state:', { 
          jackpotAmount: state?.jackpotAmount,
          lastJackpotContribution: state?.lastJackpotContribution,
          recentWinners: state?.recentWinners
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
    if (!userId || state.sessionBank < ROLL_COST) return
    
    // Reset all game state
    state.setGameStarted(true)
    state.setSessionBank(state.sessionBank - ROLL_COST)
    state.setCurrentBank(ROLL_COST)
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
    if (state.sessionBank < ROLL_COST) {
      toast({
        title: "Insufficient Session Bank",
        description: "You need at least 0.01 PIG in your session bank to roll.",
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
      state.setSessionBank(state.sessionBank - ROLL_COST)

      // Add roll cost to jackpot after first roll in streak
      if (state.currentStreak > 0) {
        console.log('Adding to jackpot:', { 
          currentAmount: toFixed3(state.jackpotAmount),
          contribution: ROLL_COST,
          streak: state.currentStreak
        })
        const newJackpotAmount = toFixed3(state.jackpotAmount + ROLL_COST)
        state.setJackpotAmount(newJackpotAmount)
      } else {
        console.log('First roll in streak, no jackpot contribution')
        state.setLastJackpotContribution(null)
      }

      const response = await fetch('/api/game/roll', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          betAmount: ROLL_COST,
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
      } = data

      // Update game state
      state.setCurrentRoll([roll])
      state.setCurrentStreak(newStreak)
      
      // Handle different roll outcomes
      if (isBust) {
        // Handle bust
        state.setCurrentBank(0)
        state.setShowBust(true)
        state.setGameStarted(false)
        state.setPreviousRolls([])  // Reset dice history on bust
        state.setCurrentRoll([])    // Also reset current roll
      } else if (roll === 3 || roll === 6) {
        // Break even - keep current bank the same
        // Do nothing to currentBank as it should stay the same
        state.setPreviousRolls([...state.previousRolls, roll])
      } else {
        // Handle win/loss cases
        state.setCurrentBank(Math.max(0, payout))
        state.setPreviousRolls([...state.previousRolls, roll])
      }

      // Handle bonus rounds
      if (newBonusType) {
        state.setBonusType(newBonusType)
        state.setBonusRolls(newBonusRolls || [])
      }

      // Update session stats
      if (payout > state.currentBank) {
        state.setSessionStats({
          wins: state.sessionStats.wins + 1,
          totalGames: state.sessionStats.totalGames + 1,
          highestWin: Math.max(state.sessionStats.highestWin, payout),
          winRate: ((state.sessionStats.wins + 1) / (state.sessionStats.totalGames + 1)) * 100,
        })
      } else {
        state.setSessionStats({
          totalGames: state.sessionStats.totalGames + 1,
          winRate: (state.sessionStats.wins / (state.sessionStats.totalGames + 1)) * 100,
        })
      }

    } catch (error) {
      console.error('Roll error:', error)
      // Refund the roll cost on error
      state.setSessionBank(state.sessionBank + ROLL_COST)
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
    
    // Add to recent winners if win is significant (> 1 PIG)
    if (state.currentBank >= 1) {
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