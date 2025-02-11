'use client'

import { usePrivy } from '@privy-io/react-auth'
import { GameBoard } from '@/components/game/game-board'
import { GameStats } from '@/components/game/game-stats'
import { JackpotDisplay } from '@/components/game/jackpot-display'
import { useGameState } from '@/hooks/use-game-state'

// Mock data for jackpot
const mockJackpot = {
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
  const { sessionBank, sessionStats, handleDeposit } = gameState

  const handleTopUpSession = () => {
    handleDeposit(1)
  }

  return (
    <div className="container mx-auto p-4 space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Stats */}
        <div className="lg:col-span-1 order-2 lg:order-1">
          <GameStats
            sessionStats={sessionStats}
            sessionBank={sessionBank}
            onTopUpSession={handleTopUpSession}
          />
        </div>

        {/* Center Column - Game Board */}
        <div className="lg:col-span-1 order-1 lg:order-2">
          <GameBoard {...gameState} />
        </div>

        {/* Right Column - Jackpot */}
        <div className="lg:col-span-1 order-3">
          <JackpotDisplay jackpot={mockJackpot} />
        </div>
      </div>
    </div>
  )
} 