'use client'

import { Suspense } from 'react'
import { GameBoard } from '@/components/game/game-board'
import { GameStats } from '@/components/game/game-stats'
import { JackpotDisplay } from '@/components/game/jackpot-display'
import { AuthCheck } from '@/components/auth/auth-check'
import { useGameState } from '@/hooks/use-game-state'
import { usePrivy } from '@privy-io/react-auth'

// Mock data
export const mockStats = {
  totalGames: 42,
  wins: 18,
  highestWin: 2.5,
  winRate: 42.8
}

export const mockJackpot = {
  amount: '5.5 ETH',
  recentWinners: [
    {
      address: '0x1234...5678',
      amount: '3.2 ETH',
      timestamp: '2 hours ago',
    },
    {
      address: '0x8765...4321',
      amount: '2.8 ETH',
      timestamp: '5 hours ago',
    },
  ]
}

export default function GamePage() {
  const { user } = usePrivy()
  const gameState = useGameState(user?.id)
  const { sessionStats } = gameState

  return (
    <AuthCheck>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Left Column - Stats */}
        <div className="lg:col-span-1 order-2 lg:order-1">
          <Suspense fallback={<div className="animate-pulse h-[200px] bg-muted rounded-lg" />}>
            <GameStats sessionStats={sessionStats} />
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
            <JackpotDisplay jackpot={mockJackpot} />
          </Suspense>
        </div>
      </div>
    </AuthCheck>
  )
} 