'use client'

import { Suspense } from 'react'
import { GameBoard } from '@/components/game/game-board'
import { GameStats } from '@/components/game/game-stats'
import { JackpotDisplay } from '@/components/game/jackpot-display'
import { AuthCheck } from '@/components/auth/auth-check'
import { useGameState } from '@/hooks/use-game-state'
import { usePrivy } from '@privy-io/react-auth'
import { JACKPOT_RATES } from '@/lib/constants'

export default function GamePage() {
  const { user } = usePrivy()
  const gameState = useGameState(user?.id)
  const { sessionBank, sessionStats, handleDeposit, jackpotAmount, lastJackpotContribution, recentWinners } = gameState

  const handleTopUpSession = () => {
    handleDeposit(1)
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
            <GameBoard {...gameState} />
          </Suspense>
        </div>

        {/* Right Column - Jackpot */}
        <div className="lg:col-span-1 order-3">
          <Suspense fallback={<div className="animate-pulse h-[300px] bg-muted rounded-lg" />}>
            <JackpotDisplay
              jackpot={{
                amount: (jackpotAmount ?? JACKPOT_RATES.INITIAL_AMOUNT).toFixed(3) + ' PIG',
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