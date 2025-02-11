'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { InfoCircledIcon } from '@radix-ui/react-icons'

// const strategyTips = [
//   "Start with smaller bets to build your streak multiplier.",
//   "Consider banking your winnings after hitting a high multiplier.",
//   "The streak bonus can significantly increase your potential returns.",
//   "Watch for consecutive 6's or 3's to trigger bonus rounds.",
//   "Remember that a single 1 will reset both your streak and bank."
// ]

export function RulesDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="absolute top-4 right-4">
          <InfoCircledIcon className="h-5 w-5" />
          <span className="sr-only">Game Rules</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>How to Play One More Roll</DialogTitle>
          <DialogDescription>
            Push your luck to build your bank, but be careful not to bust!
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Payouts */}
          <div>
            <h3 className="font-semibold mb-2">Payout Multipliers</h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2 rounded bg-red-500/10 border border-red-500/20">
                <span className="font-bold">Roll 1:</span> Bust (lose everything)
              </div>
              <div className="p-2 rounded bg-orange-500/10 border border-orange-500/20">
                <span className="font-bold">Roll 2:</span> 0.8x (keep 80%)
              </div>
              <div className="p-2 rounded bg-blue-500/10 border border-blue-500/20">
                <span className="font-bold">Roll 3:</span> 0 (break even)
              </div>
              <div className="p-2 rounded bg-emerald-500/10 border border-emerald-500/20">
                <span className="font-bold">Roll 4:</span> 1.2x (small win)
              </div>
              <div className="p-2 rounded bg-green-500/10 border border-green-500/20">
                <span className="font-bold">Roll 5:</span> 1.5x (medium win)
              </div>
              <div className="p-2 rounded bg-yellow-500/10 border border-yellow-500/20">
                <span className="font-bold">Roll 6:</span> 0 (break even)
              </div>
            </div>
          </div>

          {/* Streak System */}
          <div>
            <h3 className="font-semibold mb-2">Streak Bonus System</h3>
            <div className="space-y-4">
              <div className="p-3 rounded bg-green-500/10 border border-green-500/20">
                <h4 className="font-semibold text-green-500 mb-2">🔥 Streak Multiplier</h4>
                <ul className="list-disc pl-4 space-y-1">
                  <li>+5% bonus multiplier per streak level</li>
                  <li>Maximum bonus of 50% at streak level 10</li>
                  <li>Every 5 streak levels adds 10% risk</li>
                  <li>Bust (roll 1) resets your streak</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Bonus Rounds */}
          <div>
            <h3 className="font-semibold mb-2">Bonus Rounds</h3>
            <div className="space-y-4">
              <div className="p-3 rounded bg-yellow-500/10 border border-yellow-500/20">
                <h4 className="font-semibold text-yellow-500 mb-2">🌟 MEGA BONUS</h4>
                <ul className="list-disc pl-4 space-y-1">
                  <li>Triggered by rolling three 6&apos;s in a row</li>
                  <li>Roll 3d6 for a special multiplier</li>
                  <li>Multiplier range: 2x to 10x</li>
                </ul>
              </div>
              
              <div className="p-3 rounded bg-blue-500/10 border border-blue-500/20">
                <h4 className="font-semibold text-blue-500 mb-2">✨ MINI BONUS</h4>
                <ul className="list-disc pl-4 space-y-1">
                  <li>Triggered by rolling four 3&apos;s in a row</li>
                  <li>Roll 3d6 for a special multiplier</li>
                  <li>Multiplier range: 1.2x to 3x</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 