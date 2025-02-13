import { Button } from '@/components/ui/button'

interface DebugPanelProps {
  onTriggerMegaBonus: () => void
  onTriggerMiniBonus: () => void
  onTriggerBust: () => void
  onTriggerJackpot: () => void
  onClearWallet: () => void
  onAddToJackpot: () => void
  setCurrentBank: (value: number) => void
  currentBank: number
  onTopUpSession?: () => void
}

export function DebugPanel({
  onTriggerMegaBonus,
  onTriggerMiniBonus,
  onTriggerBust,
  onTriggerJackpot,
  onClearWallet,
  onAddToJackpot,
  setCurrentBank,
  currentBank,
  onTopUpSession
}: DebugPanelProps) {
  if (process.env.NEXT_PUBLIC_SHOW_DEBUG_PANEL !== "true") {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 flex flex-col gap-2 z-50">
      <div className="text-xs text-muted-foreground mb-1 text-right">Debug Controls (testing only)</div>
      <div className="flex flex-col gap-2 p-3 rounded-lg border bg-background/95 shadow-lg">
        {onTopUpSession && (
          <Button
            variant="outline"
            size="sm"
            onClick={onTopUpSession}
            className="text-xs bg-green-500/10 hover:bg-green-500/20 border-green-500/20"
          >
            <span className="mr-2">💰</span>
            Add 1 PIG
          </Button>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={onAddToJackpot}
          className="text-xs bg-pink-500/10 hover:bg-pink-500/20 border-pink-500/20"
        >
          <span className="mr-2">💎</span>
          Add 1 PIG to Jackpot
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            if (!currentBank) setCurrentBank(0.1)
            onTriggerMegaBonus()
          }}
          className="text-xs bg-yellow-500/10 hover:bg-yellow-500/20 border-yellow-500/20"
        >
          <span className="mr-2">🌟</span>
          Trigger MEGA Bonus
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            if (!currentBank) setCurrentBank(0.1)
            onTriggerMiniBonus()
          }}
          className="text-xs bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/20"
        >
          <span className="mr-2">✨</span>
          Trigger MINI Bonus
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            if (!currentBank) setCurrentBank(0.1)
            onTriggerBust()
          }}
          className="text-xs bg-red-500/10 hover:bg-red-500/20 border-red-500/20"
        >
          <span className="mr-2">🌧️</span>
          Trigger Bust
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onTriggerJackpot}
          className="text-xs bg-purple-500/10 hover:bg-purple-500/20 border-purple-500/20"
        >
          <span className="mr-2">🎰</span>
          Trigger Jackpot
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onClearWallet}
          className="text-xs bg-gray-500/10 hover:bg-gray-500/20 border-gray-500/20"
        >
          <span className="mr-2">🗑️</span>
          Clear Wallet
        </Button>
      </div>
    </div>
  )
} 