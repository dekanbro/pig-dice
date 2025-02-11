'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface GameStatsProps {
  sessionStats: {
    totalGames: number
    wins: number
    highestWin: number
    winRate: number
  }
  sessionBank?: number
  onTopUpSession?: () => void
}

export function GameStats({ sessionStats, sessionBank = 0, onTopUpSession }: GameStatsProps) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Session Stats</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-muted-foreground">Total Games</div>
            <div className="text-2xl font-bold">{sessionStats.totalGames}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Wins</div>
            <div className="text-2xl font-bold">{sessionStats.wins}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Highest Win</div>
            <div className="text-2xl font-bold">{sessionStats.highestWin.toFixed(3)} PIG</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Win Rate</div>
            <div className="text-2xl font-bold">{sessionStats.winRate.toFixed(1)}%</div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Session Bank</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="text-sm text-muted-foreground">Available Balance</div>
            <div className="text-2xl font-bold">{sessionBank.toFixed(3)} PIG</div>
          </div>
          {process.env.NODE_ENV === 'development' && onTopUpSession && (
            <Button onClick={onTopUpSession} className="w-full">
              Add 1 PIG (Debug)
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 