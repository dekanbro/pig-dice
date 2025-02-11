import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { motion, AnimatePresence } from 'framer-motion'

interface JackpotDisplayProps {
  jackpot: {
    amount: string
    lastContribution?: number | null
    wonAmount?: number | null
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
        <AnimatePresence mode="wait">
          {jackpot.wonAmount ? (
            <motion.div
              key="won"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="flex flex-col items-center gap-2 p-4 rounded-lg bg-purple-500/10 border border-purple-500/20"
            >
              <span className="text-4xl">🎉</span>
              <div className="text-2xl font-bold text-purple-500">JACKPOT WON!</div>
              <div className="text-xl">{jackpot.wonAmount?.toFixed(3) || ''} PIG</div>
            </motion.div>
          ) : (
            <motion.div
              key="current"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="flex flex-col items-center gap-2"
            >
              <motion.div 
                key={jackpot.amount}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className="relative"
              >
                <div className="text-4xl font-bold bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-500 text-transparent bg-clip-text">
                  {jackpot.amount}
                </div>
                {jackpot.lastContribution && jackpot.lastContribution > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className="absolute -top-6 left-1/2 -translate-x-1/2 text-sm text-green-500 font-medium"
                  >
                    +{jackpot.lastContribution.toFixed(3)} PIG
                  </motion.div>
                )}
              </motion.div>
              <div className="text-sm text-muted-foreground">Current Prize Pool</div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-4">
          <h4 className="text-sm font-semibold">Recent Winners</h4>
          <div className="space-y-2">
            {jackpot.recentWinners.length == 0 && (
              <div className="text-sm text-muted-foreground">No recent winners</div>
            )}
            {jackpot.recentWinners.map((winner, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between rounded-lg border p-3 text-sm"
              >
                <div className="flex flex-col gap-1">
                  <span className="font-medium">{winner.address}</span>
                  <span className="text-xs text-muted-foreground">
                    {winner.timestamp}
                  </span>
                </div>
                <div className="font-bold">{winner.amount}</div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="text-xs text-muted-foreground space-y-2">
          <p>🎲 Each roll contributes to the jackpot</p>
          <p>🌟 MEGA BONUS: 5% chance to win jackpot</p>
          <p>✨ MINI BONUS: 1% chance to win jackpot</p>
        </div>
      </CardContent>
    </Card>
  )
} 