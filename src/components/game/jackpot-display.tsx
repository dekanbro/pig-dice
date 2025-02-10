import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface JackpotDisplayProps {
  jackpot: {
    amount: string
    recentWinners: Array<{
      address: string
      amount: string
      timestamp: string
    }>
  }
}

export function JackpotDisplay({ jackpot }: JackpotDisplayProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-center">Jackpot</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col items-center gap-2">
          <div className="text-4xl font-bold">{jackpot.amount}</div>
          <div className="text-sm text-muted-foreground">Current Prize Pool</div>
        </div>

        <div className="space-y-4">
          <h4 className="text-sm font-semibold">Recent Winners</h4>
          <div className="space-y-2">
            {jackpot.recentWinners.map((winner, index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded-lg border p-3 text-sm"
              >
                <div className="flex flex-col gap-1">
                  <span className="font-medium">{winner.address}</span>
                  <span className="text-xs text-muted-foreground">
                    {winner.timestamp}
                  </span>
                </div>
                <div className="font-bold">{winner.amount}</div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 