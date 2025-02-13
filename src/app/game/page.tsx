'use client'

import { Suspense } from 'react'
import { GameBoard } from '@/components/game/game-board'
import { GameStats } from '@/components/game/game-stats'
import { JackpotDisplay } from '@/components/game/jackpot-display'
import { AuthCheck } from '@/components/auth/auth-check'
import { useGameState } from '@/hooks/use-game-state'
import { usePrivy } from '@privy-io/react-auth'
import { toast } from '@/components/ui/use-toast'
import { useGameStore } from '@/hooks/use-game-state'
import { getCookie } from 'cookies-next'

export default function GamePage() {
  const { user } = usePrivy()
  const gameState = useGameState(user?.id)
  const { sessionBank, sessionStats, handleDeposit, jackpotAmount, lastJackpotContribution, recentWinners } = gameState
  const { setCurrentBank, setSessionBank, setJackpotAmount } = useGameStore()

  const handleTopUpSession = () => {
    handleDeposit(1)
  }

  // Debug function to trigger jackpot
  async function simulateJackpot() {
    if (process.env.NODE_ENV !== 'development') return
    
    try {
      console.log('Starting jackpot trigger with state:', {
        currentBank: gameState.currentBank,
        jackpotAmount,
        jackpotWon: gameState.jackpotWon
      })

      const token = getCookie('privy-token')
      if (!token) throw new Error('Not authenticated')

      // Call trigger_jackpot_win to atomically get amount and mark as won
      const response = await fetch('/api/game/jackpot/trigger', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      })

      if (!response.ok) {
        throw new Error('Failed to trigger jackpot')
      }

      const result = await response.json()
      console.log('Jackpot trigger response:', result)
      
      if (typeof result.won_amount !== 'number' || typeof result.amount !== 'number') {
        console.error('Invalid jackpot data:', result)
        throw new Error('Invalid jackpot response')
      }
      
      console.log('Processing jackpot win:', {
        wonAmount: result.won_amount,
        newJackpotAmount: result.amount,
        currentBank: gameState.currentBank,
        newBank: gameState.currentBank + result.won_amount
      })

      // Update local state
      setJackpotAmount(result.amount) // Set jackpot to new amount (0)
      gameState.setJackpotWon(result.jackpot_won) // Mark as won
      
      // Add won amount to current bank
      if (result.won_amount > 0) {
        const newBank = gameState.currentBank + result.won_amount
        setCurrentBank(newBank) // Add to current bank
        
        console.log('Updated bank after jackpot:', {
          oldBank: gameState.currentBank,
          wonAmount: result.won_amount,
          newBank
        })
        
        // Add to recent winners using the store
        const store = useGameStore.getState()
        if (user?.id) {
          store.addRecentWinner({
            address: user.id,
            amount: `${result.won_amount.toFixed(3)} PIG`
          })
        }
        
        toast({
          title: '🎰 Jackpot!',
          description: `You won the jackpot of ${result.won_amount.toFixed(3)} PIG!`,
          variant: 'success'
        })
      } else {
        console.log('No jackpot amount to add to bank')
        toast({
          title: 'Jackpot Reset',
          description: 'The jackpot has been reset and is ready for new contributions.',
          variant: 'info'
        })
      }
    } catch (error) {
      console.error('Error triggering jackpot:', error)
      toast({
        title: 'Error',
        description: 'Failed to trigger jackpot',
        variant: 'destructive'
      })
    }
  }

  // Debug function to clear wallet
  function clearWallet() {
    if (process.env.NODE_ENV !== 'development') return
    setSessionBank(0)
    setCurrentBank(0)
    toast({
      title: '🗑️ Wallet Cleared',
      description: 'Session and current bank have been reset to 0',
      variant: 'info'
    })
  }

  return (
    <AuthCheck>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Stats */}
        <div className="lg:col-span-1 order-2 lg:order-1">
          <Suspense fallback={<div className="animate-pulse h-[200px] bg-muted rounded-lg" />}>
            <GameStats
              sessionStats={sessionStats}
              sessionBank={sessionBank}
              onTopUpSession={handleTopUpSession}
            />
          </Suspense>
        </div>

        {/* Center Column - Game Board */}
        <div className="lg:col-span-1 order-1 lg:order-2">
          <Suspense fallback={<div className="animate-pulse h-[400px] bg-muted rounded-lg" />}>
            <GameBoard
              {...gameState}
              onTriggerJackpot={simulateJackpot}
              onClearWallet={clearWallet}
              setJackpotAmount={setJackpotAmount}
            />
          </Suspense>
        </div>

        {/* Right Column - Jackpot */}
        <div className="lg:col-span-1 order-3">
          <Suspense fallback={<div className="animate-pulse h-[300px] bg-muted rounded-lg" />}>
            <JackpotDisplay
              jackpot={{
                amount: (jackpotAmount || 0).toFixed(3) + ' PIG',
                lastContribution: lastJackpotContribution,
                recentWinners
              }}
            />
          </Suspense>
        </div>
      </div>
    </AuthCheck>
  )
} 