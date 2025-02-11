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
          {/* Basic Rules */}
          <div>
            <h3 className="font-semibold mb-2">Basic Rules</h3>
            <ul className="list-disc pl-4 space-y-2">
              <li>Start with a 0.01 ETH bet</li>
              <li>Roll the dice and build your bank</li>
              <li>Choose to cash out or push your luck after each roll</li>
              <li>Rolling a 1 busts and you lose everything!</li>
            </ul>
          </div>

          {/* Payouts */}
          <div>
            <h3 className="font-semibold mb-2">Payout Multipliers</h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2 rounded bg-red-500/10 border border-red-500/20">
                <span className="font-bold">Roll 1:</span> Bust (lose everything)
              </div>
              <div className="p-2 rounded bg-orange-500/10 border border-orange-500/20">
                <span className="font-bold">Roll 2:</span> 0.5x (small loss)
              </div>
              <div className="p-2 rounded bg-blue-500/10 border border-blue-500/20">
                <span className="font-bold">Roll 3:</span> 1x (break even + bonus potential)
              </div>
              <div className="p-2 rounded bg-emerald-500/10 border border-emerald-500/20">
                <span className="font-bold">Roll 4:</span> 1.5x (small win)
              </div>
              <div className="p-2 rounded bg-green-500/10 border border-green-500/20">
                <span className="font-bold">Roll 5:</span> 2x (medium win)
              </div>
              <div className="p-2 rounded bg-yellow-500/10 border border-yellow-500/20">
                <span className="font-bold">Roll 6:</span> 1x (break even + bonus potential)
              </div>
            </div>
          </div>

          {/* Streak System */}
          <div>
            <h3 className="font-semibold mb-2">Streak System</h3>
            <ul className="list-disc pl-4 space-y-2">
              <li>Each successful roll increases your streak</li>
              <li>Each streak level adds a 10% bonus to your multiplier</li>
              <li>Streak resets if you bust or cash out</li>
            </ul>
          </div>

          {/* Bonus Rounds */}
          <div>
            <h3 className="font-semibold mb-2">Bonus Rounds</h3>
            <div className="space-y-4">
              <div className="p-3 rounded bg-yellow-500/10 border border-yellow-500/20">
                <h4 className="font-semibold text-yellow-500 mb-2">🌟 MEGA BONUS</h4>
                <ul className="list-disc pl-4 space-y-1">
                  <li>Triggered by rolling two 6&apos;s in a row</li>
                  <li>Roll 3d6 for a special multiplier</li>
                  <li>Multiplier range: 3x to 15x</li>
                  <li>Applied to your entire current bank</li>
                </ul>
              </div>
              
              <div className="p-3 rounded bg-blue-500/10 border border-blue-500/20">
                <h4 className="font-semibold text-blue-500 mb-2">✨ MINI BONUS</h4>
                <ul className="list-disc pl-4 space-y-1">
                  <li>Triggered by rolling three 3&apos;s in a row</li>
                  <li>Roll 2d6 for a special multiplier</li>
                  <li>Multiplier range: 1.5x to 5x</li>
                  <li>Applied to your entire current bank</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Strategy Tips */}
          <div>
            <h3 className="font-semibold mb-2">Strategy Tips</h3>
            <ul className="list-disc pl-4 space-y-2">
              <li>Higher streaks mean higher risk and reward</li>
              <li>Consider cashing out after big wins</li>
              <li>Watch for opportunities to trigger bonus rounds</li>
              <li>Rolling 6&apos;s is safer now but can lead to huge bonus wins</li>
              <li>Three 3&apos;s in a row is a safer bonus strategy</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 