import { useState } from 'react'
import { getCookie } from 'cookies-next'
import { toast } from '@/components/ui/use-toast'

interface GameState {
  isRolling: boolean
  lastRoll: number | null
  currentBank: number
  sessionBank: number
  currentStreak: number
  previousRolls: number[]
  gameStarted: boolean
  bonusType: 'MEGA_BONUS' | 'MINI_BONUS' | null
  bonusRolls: number[]
  showBust: boolean
  sessionStats: {
    totalGames: number
    wins: number
    highestWin: number
    winRate: number
  }
}

interface RollResult {
  roll: number
  payout: number
  multiplier: number
  bonusType: 'MEGA_BONUS' | 'MINI_BONUS' | null
  bonusRolls?: number[]
  streakBonus: number
}

const ROLL_COST = 0.01 // Cost per roll in ETH

// Helper function to get roll description
function getRollDescription(roll: number, multiplier: number, streakBonus: number = 0) {
  switch (roll) {
    case 1:
      return 'Bust! You lose everything'
    case 2:
      return `Small loss (${multiplier}x${streakBonus ? ` +${streakBonus}x streak` : ''})`
    case 3:
      return `Break even (${multiplier}x${streakBonus ? ` +${streakBonus}x streak` : ''})`
    case 4:
      return `Small win (${multiplier}x${streakBonus ? ` +${streakBonus}x streak` : ''})`
    case 5:
      return `Medium win (${multiplier}x${streakBonus ? ` +${streakBonus}x streak` : ''})`
    case 6:
      return `Break even (${multiplier}x${streakBonus ? ` +${streakBonus}x streak` : ''}) - Bonus chance!`
    default:
      return 'Invalid roll'
  }
}

// Helper function to get toast variant based on roll outcome
function getRollVariant(roll: number): 'default' | 'destructive' | 'success' | 'warning' | 'info' {
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
  setCurrentBank: (value: number | ((prev: number) => number)) => void
}

export function useGameState(userId?: string): UseGameStateReturn {
  const [isRolling, setIsRolling] = useState(false)
  const [lastRoll, setLastRoll] = useState<number | null>(null)
  const [currentBank, setCurrentBank] = useState(0)
  const [sessionBank, setSessionBank] = useState(0)
  const [currentStreak, setCurrentStreak] = useState(0)
  const [previousRolls, setPreviousRolls] = useState<number[]>([])
  const [gameStarted, setGameStarted] = useState(false)
  const [bonusType, setBonusType] = useState<'MEGA_BONUS' | 'MINI_BONUS' | null>(null)
  const [bonusRolls, setBonusRolls] = useState<number[]>([])
  const [showBust, setShowBust] = useState(false)
  const [rollResult, setRollResult] = useState<RollResult | null>(null)
  const [sessionStats, setSessionStats] = useState({
    totalGames: 0,
    wins: 0,
    highestWin: 0,
    winRate: 0
  })

  async function handleStartGame() {
    if (!userId || sessionBank < ROLL_COST) return
    setGameStarted(true)
    // Deduct roll cost from session bank
    setSessionBank(prev => prev - ROLL_COST)
    // Set initial bank to roll cost
    setCurrentBank(ROLL_COST)
    // Start rolling immediately
    setIsRolling(true)
    setBonusType(null)
    setBonusRolls([])

    // Update total games counter when starting a new game
    setSessionStats(prev => ({
      ...prev,
      totalGames: prev.totalGames + 1
    }))

    try {
      // Get the token from cookie
      const token = getCookie('privy-token')
      if (!token) {
        throw new Error('No auth token found')
      }

      const response = await fetch('/api/game/roll', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          betAmount: ROLL_COST,
          currentBank: 0,
          currentStreak: 0,
          previousRolls: [],
        }),
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      if (data.success) {
        const roll = data.data.roll
        const streakBonus = 0 // No streak bonus on first roll
        const multiplier = data.data.multiplier
        const payout = data.data.payout

        setLastRoll(roll)
        setCurrentBank(payout)
        setCurrentStreak(data.data.newStreak)
        setPreviousRolls([roll])
        
        // Update session stats based on roll outcome
        if (roll === 1) {
          // Update win rate on bust
          setSessionStats(prev => ({
            ...prev,
            winRate: (prev.wins / prev.totalGames) * 100
          }))
        } else if (payout > ROLL_COST) {
          // Count as a win if payout is higher than roll cost
          setSessionStats(prev => {
            const newWins = prev.wins + 1
            return {
              ...prev,
              wins: newWins,
              winRate: (newWins / prev.totalGames) * 100,
              highestWin: payout > prev.highestWin ? payout : prev.highestWin
            }
          })
        }

        // Show roll information
        toast({
          title: `Rolled a ${roll}!`,
          description: getRollDescription(roll, multiplier, streakBonus),
          variant: getRollVariant(roll),
        })
        
        // Handle bonus rounds
        if (data.data.bonusType) {
          setBonusType(data.data.bonusType)
          setBonusRolls(data.data.bonusRolls || [])
        }
        
        // Handle bust
        if (data.data.isBust) {
          handleBust()
        }
      } else {
        console.error('Roll failed:', data.error)
      }
    } catch (error) {
      console.error('Error rolling dice:', error)
      // Reset game state on error
      setGameStarted(false)
      setCurrentBank(0)
      setIsRolling(false)
      // Return the roll cost to session bank
      setSessionBank(prev => prev + ROLL_COST)
    }
  }

  async function handleRoll() {
    if (!userId || isRolling || !gameStarted || sessionBank < ROLL_COST) return

    setIsRolling(true)
    
    try {
      // Deduct roll cost from session bank
      setSessionBank(prev => prev - ROLL_COST)
      setCurrentBank(prev => prev + ROLL_COST)

      // Check for potential bonus triggers with previous rolls
      const lastRolls = [...previousRolls].slice(-2)
      const isMegaBonusPotential = lastRolls.length === 2 && lastRolls.every(r => r === 6)
      const isMiniBonusPotential = previousRolls.length >= 2 && 
        previousRolls.slice(-2).every(r => r === 3)

      const response = await fetch('/api/game/roll', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getCookie('privy-token')}`,
        },
        body: JSON.stringify({
          betAmount: ROLL_COST,
          currentBank: currentBank + ROLL_COST,
          currentStreak: currentStreak,
          previousRolls: previousRolls,
          isMegaBonusPotential,
          isMiniBonusPotential
        }),
      })

      const data = await response.json()
      
      if (data.success) {
        const { roll, payout, multiplier, bonusType } = data.data
        const streakBonus = currentStreak * 0.1
        
        // Check if this roll completes a bonus sequence
        const newBonusType = (() => {
          if (bonusType) return bonusType
          if (isMegaBonusPotential && roll === 6) {
            return 'MEGA_BONUS'
          } else if (previousRolls.length >= 2 && 
                    [...previousRolls.slice(-2), roll].every(r => r === 3)) {
            return 'MINI_BONUS'
          }
          return null
        })()

        // Calculate final payout including bonus
        let finalPayout = payout
        let finalMultiplier = multiplier
        if (newBonusType && !bonusType) {
          const bonusMultiplier = newBonusType === 'MEGA_BONUS' ? 10 : 5
          finalPayout = payout * bonusMultiplier
          finalMultiplier = multiplier * bonusMultiplier
        }

        // Update session stats based on roll outcome
        if (roll === 1) {
          // Update win rate on bust
          setSessionStats(prev => ({
            ...prev,
            winRate: (prev.wins / prev.totalGames) * 100
          }))
        } else if (finalPayout > currentBank) {
          // Count as a win if payout is higher than current bank
          setSessionStats(prev => {
            const newWins = prev.wins + 1
            return {
              ...prev,
              wins: newWins,
              winRate: (newWins / prev.totalGames) * 100,
              highestWin: finalPayout > prev.highestWin ? finalPayout : prev.highestWin
            }
          })
        }

        // Set the roll value to trigger animation
        setLastRoll(roll)
        
        // Store roll result for animation completion
        const rollData = {
          roll,
          payout: finalPayout,
          multiplier: finalMultiplier,
          bonusType: newBonusType,
          streakBonus
        }
        
        // Don't update other state until animation completes
        setRollResult(rollData)
      }
    } catch (error) {
      console.error('Roll error:', error)
      toast({
        title: 'Error',
        description: 'Failed to process roll',
        variant: 'destructive',
      })
      // Return the roll cost on error
      setSessionBank(prev => prev + ROLL_COST)
      setCurrentBank(prev => prev - ROLL_COST)
      setIsRolling(false)
    }
  }

  function handleBust() {
    // Update session stats for a loss
    setSessionStats(prev => {
      const newTotal = prev.totalGames + 1
      return {
        ...prev,
        totalGames: newTotal,
        winRate: (prev.wins / newTotal) * 100
      }
    })

    setShowBust(true)
    // Show bust animation for 4 seconds before resetting
    setTimeout(() => {
      setShowBust(false)
      setGameStarted(false)
      setCurrentBank(0)
      setCurrentStreak(0)
      setPreviousRolls([])
      setBonusType(null)
      setBonusRolls([])
    }, 4000)
  }

  function handleCashout() {
    // Update highest win if current bank is higher
    if (currentBank > sessionStats.highestWin) {
      setSessionStats(prev => ({
        ...prev,
        highestWin: currentBank
      }))
    }

    // Count this as a win since player is cashing out
    setSessionStats(prev => {
      const newWins = prev.wins + 1
      const newTotal = prev.totalGames + 1
      return {
        ...prev,
        wins: newWins,
        totalGames: newTotal,
        winRate: (newWins / newTotal) * 100
      }
    })

    // Show cashout information
    toast({
      title: 'Cashed Out!',
      description: `Added ${currentBank.toFixed(3)} ETH to your session bank`,
      variant: 'success',
    })
    
    // Add current bank to session bank
    setSessionBank(prev => prev + currentBank)
    setGameStarted(false)
    setCurrentBank(0)
    setCurrentStreak(0)
    setPreviousRolls([])
    setBonusType(null)
    setBonusRolls([])
  }

  // New functions for session bank management
  function handleDeposit(amount: number) {
    setSessionBank(prev => prev + amount)
    toast({
      title: 'Deposit Successful',
      description: `Added ${amount.toFixed(3)} ETH to your session bank`,
      variant: 'success',
    })
  }

  function handleWithdraw(amount: number) {
    if (amount <= sessionBank) {
      setSessionBank(prev => prev - amount)
      // TODO: Implement actual withdrawal to user's wallet
      toast({
        title: 'Withdrawal Successful',
        description: `Withdrew ${amount.toFixed(3)} ETH from your session bank`,
        variant: 'success',
      })
      return true
    }
    toast({
      title: 'Withdrawal Failed',
      description: 'Insufficient funds in session bank',
      variant: 'destructive',
    })
    return false
  }

  function handleRollComplete() {
    if (!rollResult) {
      setIsRolling(false)
      return
    }

    const { roll, payout, multiplier, bonusType, streakBonus } = rollResult

    // Update game state after animation completes
    if (bonusType) {
      setBonusType(bonusType)
      setCurrentBank(payout)
    } else if (roll === 1) {
      setShowBust(true)
      setCurrentBank(0)
      setCurrentStreak(0)
    } else {
      setCurrentBank(payout)
      setCurrentStreak(prev => prev + 1)
    }

    setPreviousRolls(prev => [...prev, roll])
    
    // Show roll result toast after animation completes
    toast({
      title: `Rolled a ${roll}!`,
      description: getRollDescription(roll, multiplier, streakBonus),
      variant: getRollVariant(roll),
    })

    // Show bonus toast if applicable
    if (bonusType) {
      toast({
        title: `${bonusType === 'MEGA_BONUS' ? '🌟 MEGA BONUS!' : '✨ MINI BONUS!'}`,
        description: `Multiplier: ${multiplier}x\nNew Bank: ${payout.toFixed(3)} ETH`,
        variant: bonusType === 'MEGA_BONUS' ? 'warning' : 'info',
      })
    }

    // Clear roll result and rolling state
    setRollResult(null)
    setIsRolling(false)
  }

  function handleBonusDismiss() {
    setBonusType(null)
    setIsRolling(false)
  }

  function handleBustDismiss() {
    setShowBust(false)
    setGameStarted(false)
    setCurrentBank(0)
    setCurrentStreak(0)
    setPreviousRolls([])
    setBonusType(null)
    setBonusRolls([])
  }

  function simulateMegaBonus() {
    setBonusType('MEGA_BONUS')
    const rolls = Array.from({ length: 3 }, () => Math.floor(Math.random() * 6) + 1)
    setBonusRolls(rolls)
    const sum = rolls.reduce((a, b) => a + b, 0)
    const multiplier = 3 + ((sum - 3) * (15 - 3) / (18 - 3))
    const newBank = currentBank * multiplier
    setCurrentBank(newBank)
    
    toast({
      title: '🌟 MEGA BONUS! 🌟',
      description: `Rolled ${rolls.join(', ')}\nMultiplier: ${multiplier.toFixed(2)}x\nBank: ${newBank.toFixed(3)} ETH`,
      variant: 'warning',
    })
    
    setTimeout(() => {
      setBonusType(null)
      setBonusRolls([])
    }, 8000)
  }

  function simulateMiniBonusBonus() {
    setBonusType('MINI_BONUS')
    const rolls = Array.from({ length: 2 }, () => Math.floor(Math.random() * 6) + 1)
    setBonusRolls(rolls)
    const sum = rolls.reduce((a, b) => a + b, 0)
    const multiplier = 1.5 + ((sum - 2) * (5 - 1.5) / (12 - 2))
    const newBank = currentBank * multiplier
    setCurrentBank(newBank)
    
    toast({
      title: '✨ MINI BONUS! ✨',
      description: `Rolled ${rolls.join(', ')}\nMultiplier: ${multiplier.toFixed(2)}x\nBank: ${newBank.toFixed(3)} ETH`,
      variant: 'info',
    })
    
    setTimeout(() => {
      setBonusType(null)
      setBonusRolls([])
    }, 8000)
  }

  return {
    isRolling,
    lastRoll,
    currentBank,
    sessionBank,
    currentStreak,
    previousRolls,
    gameStarted,
    bonusType,
    bonusRolls,
    showBust,
    sessionStats,
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
    setCurrentBank,
  }
}

export default useGameState 