import { Button } from '@/components/ui/button'

interface DebugPanelProps {
  onTriggerMegaBonus: () => void
  onTriggerMiniBonus: () => void
  onTriggerBust: () => void
  setCurrentBank: (value: number) => void
  currentBank: number
}

export function DebugPanel({
  onTriggerMegaBonus,
  onTriggerMiniBonus,
  onTriggerBust,
  setCurrentBank,
  currentBank
}: DebugPanelProps) {
  if (process.env.NEXT_PUBLIC_SHOW_DEBUG_PANEL !== "true") {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 flex flex-col gap-2 z-50">
      <div className="text-xs text-muted-foreground mb-1 text-right">Debug Controls</div>
      <div className="flex flex-col gap-2 p-3 rounded-lg border bg-background/95 shadow-lg">
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
      </div>
    </div>
  )
} 