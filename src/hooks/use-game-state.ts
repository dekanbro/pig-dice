import { useState } from 'react'
import { getCookie } from 'cookies-next'

interface GameState {
  isRolling: boolean
  lastRoll: number | null
  currentBank: number
  currentStreak: number
  previousRolls: number[]
  gameStarted: boolean
  bonusType: 'MEGA_BONUS' | 'MINI_BONUS' | null
  bonusRolls: number[]
  showBust: boolean
}

interface UseGameStateReturn extends GameState {
  handleStartGame: () => Promise<void>
  handleRoll: (isInitialBet?: boolean) => Promise<void>
  handleBust: () => void
  handleCashout: () => void
  handleRollComplete: () => void
  handleBonusDismiss: () => void
  handleBustDismiss: () => void
  simulateMegaBonus: () => void
  simulateMiniBonusBonus: () => void
  setCurrentBank: (value: number | ((prev: number) => number)) => void
}

export function useGameState(userId?: string): UseGameStateReturn {
  const [isRolling, setIsRolling] = useState(false)
  const [lastRoll, setLastRoll] = useState<number | null>(null)
  const [currentBank, setCurrentBank] = useState<number>(0)
  const [currentStreak, setCurrentStreak] = useState<number>(0)
  const [previousRolls, setPreviousRolls] = useState<number[]>([])
  const [gameStarted, setGameStarted] = useState(false)
  const [bonusType, setBonusType] = useState<'MEGA_BONUS' | 'MINI_BONUS' | null>(null)
  const [bonusRolls, setBonusRolls] = useState<number[]>([])
  const [showBust, setShowBust] = useState(false)

  async function handleStartGame() {
    if (!userId) return
    setGameStarted(true)
    handleRoll(true)
  }

  async function handleRoll(isInitialBet: boolean = false) {
    if (!userId) return

    setIsRolling(true)
    setBonusType(null)
    setBonusRolls([])

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
          betAmount: 0.01, // Using minimum bet amount from env
          currentBank: isInitialBet ? 0 : currentBank,
          currentStreak,
          previousRolls,
        }),
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      if (data.success) {
        setLastRoll(data.data.roll)
        setCurrentBank(data.data.payout)
        setCurrentStreak(data.data.newStreak)
        setPreviousRolls([...previousRolls, data.data.roll])
        
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
    }
  }

  function handleBust() {
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
    // TODO: Implement cashout logic
    alert(`Cashed out ${currentBank} tokens!`)
    setGameStarted(false)
    setCurrentBank(0)
    setCurrentStreak(0)
    setPreviousRolls([])
    setBonusType(null)
    setBonusRolls([])
  }

  function handleRollComplete() {
    setIsRolling(false)
  }

  function handleBonusDismiss() {
    setBonusType(null)
    setBonusRolls([])
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
    setCurrentBank((prev) => prev * multiplier)
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
    setCurrentBank((prev) => prev * multiplier)
    setTimeout(() => {
      setBonusType(null)
      setBonusRolls([])
    }, 8000)
  }

  return {
    isRolling,
    lastRoll,
    currentBank,
    currentStreak,
    previousRolls,
    gameStarted,
    bonusType,
    bonusRolls,
    showBust,
    handleStartGame,
    handleRoll,
    handleBust,
    handleCashout,
    handleRollComplete,
    handleBonusDismiss,
    handleBustDismiss,
    simulateMegaBonus,
    simulateMiniBonusBonus,
    setCurrentBank,
  }
}

export type UseGameStateReturn = ReturnType<typeof useGameState> 