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

export function JackpotRulesDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-6 w-6 rounded-full hover:bg-muted"
        >
          <InfoCircledIcon className="h-4 w-4" />
          <span className="sr-only">Jackpot Rules</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>How to Win the Jackpot</DialogTitle>
          <DialogDescription>
            Every roll contributes to the jackpot, giving you more chances to win big!
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Jackpot Chances */}
          <div>
            <h3 className="font-semibold mb-2">Winning Chances</h3>
            <div className="space-y-4">
              <div className="p-3 rounded bg-yellow-500/10 border border-yellow-500/20">
                <h4 className="font-semibold text-yellow-500 mb-2">🌟 MEGA BONUS Jackpot</h4>
                <ul className="list-disc pl-4 space-y-1">
                  <li>5% chance to win jackpot during MEGA BONUS</li>
                  <li>Triggered by rolling a 6</li>
                  <li>Win the entire jackpot pool!</li>
                </ul>
              </div>
              
              <div className="p-3 rounded bg-blue-500/10 border border-blue-500/20">
                <h4 className="font-semibold text-blue-500 mb-2">✨ MINI BONUS Jackpot</h4>
                <ul className="list-disc pl-4 space-y-1">
                  <li>1% chance to win jackpot during MINI BONUS</li>
                  <li>Triggered by rolling a 3</li>
                  <li>Win the entire jackpot pool!</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Jackpot Growth */}
          <div>
            <h3 className="font-semibold mb-2">How the Jackpot Grows</h3>
            <div className="space-y-4">
              <div className="p-3 rounded bg-green-500/10 border border-green-500/20">
                <h4 className="font-semibold text-green-500 mb-2">💰 Contributions</h4>
                <ul className="list-disc pl-4 space-y-1">
                  <li>2% of all winnings go to the jackpot</li>
                  <li>100% of bust amounts are added</li>
                  <li>0.01 PIG from each roll (except first roll)</li>
                </ul>
              </div>
              <div className="p-3 rounded bg-amber-500/10 border border-amber-500/20">
                <h4 className="font-semibold text-amber-500 mb-2">📈 Example Growth</h4>
                <ul className="list-disc pl-4 space-y-1">
                  <li>Win 1 PIG = 0.02 PIG to jackpot</li>
                  <li>Bust with 0.5 PIG = 0.5 PIG to jackpot</li>
                  <li>Each roll = 0.01 PIG to jackpot</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Strategy Tips */}
          <div>
            <h3 className="font-semibold mb-2">Strategy Tips</h3>
            <div className="p-3 rounded bg-purple-500/10 border border-purple-500/20">
              <h4 className="font-semibold text-purple-500 mb-2">🎲 Maximize Your Chances</h4>
              <ul className="list-disc pl-4 space-y-1">
                <li>Play longer sessions to hit more bonus rounds</li>
                <li>Each roll has a chance for bonus rounds</li>
                <li>Higher bets mean bigger jackpot contributions</li>
              </ul>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 