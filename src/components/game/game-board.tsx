'use client'

import { useState } from 'react'
import { usePrivy } from '@privy-io/react-auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { MegaDice } from './mega-dice'
import { getCookie } from 'cookies-next'

export function GameBoard() {
  const { user } = usePrivy()
  const [isRolling, setIsRolling] = useState(false)
  const [lastRoll, setLastRoll] = useState<number | null>(null)
  const [multiplier, setMultiplier] = useState<number | null>(null)

  async function handleRoll() {
    if (!user?.id) return

    setIsRolling(true)
    try {
      // Get the token from cookie
      const token = getCookie('privy-token')
      if (!token) {
        throw new Error('No auth token found')
      }

      const response = await fetch('/api/game/roll', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          betAmount: 0.01, // Using minimum bet amount from env
        }),
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      if (data.success) {
        setLastRoll(data.data.roll)
        setMultiplier(data.data.payout / 0.01) // Calculate multiplier from payout
      } else {
        console.error('Roll failed:', data.error)
      }
    } catch (error) {
      console.error('Error rolling dice:', error)
    }
  }

  function handleRollComplete() {
    setIsRolling(false)
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-center">Roll the Dice</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-6">
        <div className="w-32 h-32 md:w-48 md:h-48">
          <MegaDice
            rolling={isRolling}
            value={lastRoll}
            onRollComplete={handleRollComplete}
          />
        </div>
        {multiplier && (
          <div className="text-2xl font-semibold">
            Multiplier: {multiplier}x
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-center">
        <Button 
          size="lg"
          onClick={handleRoll}
          disabled={isRolling || !user?.id}
        >
          {isRolling ? 'Rolling...' : 'Roll Dice'}
        </Button>
      </CardFooter>
    </Card>
  )
} 