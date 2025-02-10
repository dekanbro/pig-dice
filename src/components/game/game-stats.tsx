import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface GameStatsProps {
  stats: {
    totalGames: number
    wins: number
    highestWin: string
    winRate: string
  }
}

export function GameStats({ stats }: GameStatsProps) {
  const statItems = [
    { label: 'Total Games', value: stats.totalGames },
    { label: 'Wins', value: stats.wins },
    { label: 'Highest Win', value: stats.highestWin },
    { label: 'Win Rate', value: stats.winRate },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-center">Your Stats</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        {statItems.map((stat) => (
          <div
            key={stat.label}
            className="flex items-center justify-between rounded-lg border p-3"
          >
            <div className="text-sm font-medium">{stat.label}</div>
            <div className="text-sm font-bold">{stat.value}</div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
} 