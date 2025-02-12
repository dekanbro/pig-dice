import { NextRequest, NextResponse } from "next/server"
import { STANDARD_MULTIPLIERS, JACKPOT_RATES, GAME_CONFIG } from "@/lib/constants"
import { createServerClient } from '@/lib/supabase/server'
import { verifyAuthToken } from '@/lib/auth'

// Specify Node.js runtime for API routes
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const authResult = await verifyAuthToken(request)
    if (!authResult.isAuthenticated || !authResult.userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { currentBank, currentStreak, previousRolls } = await request.json()
    
    console.log('Processing roll with:', {
      currentBank,
      currentStreak,
      previousRolls
    })

    // Get random roll result
    const roll = Math.floor(Math.random() * 6) + 1
    
    // Calculate multiplier and payout
    const baseMultiplier = STANDARD_MULTIPLIERS[roll as keyof typeof STANDARD_MULTIPLIERS]
    const streakBonus = Math.min(
      currentStreak * GAME_CONFIG.STREAK_BONUS_PER_LEVEL,
      GAME_CONFIG.MAX_STREAK_BONUS
    )
    
    // Calculate final multiplier (apply streak bonus even on break-even rolls)
    const finalMultiplier = roll === 1 ? 0 : (baseMultiplier + streakBonus)

    // For break-even rolls (3 or 6), ensure we at least keep the current bank plus streak
    const effectiveMultiplier = (roll === 3 || roll === 6) 
      ? Math.max(1 + streakBonus, finalMultiplier) 
      : finalMultiplier

    console.log('Calculating payout:', {
      roll,
      currentBank,
      baseMultiplier,
      streakBonus,
      finalMultiplier,
      effectiveMultiplier
    })

    // Calculate payout with 3 decimal precision
    const payout = Number((currentBank * effectiveMultiplier).toFixed(3))
    
    // Determine if this is a bust
    const isBust = roll === 1
    
    // Calculate new streak
    const newStreak = isBust ? 0 : currentStreak + 1
    
    // Calculate jackpot contribution
    const jackpotContribution = isBust 
      ? currentBank * JACKPOT_RATES.BUST_CONTRIBUTION  // 100% on bust
      : payout * JACKPOT_RATES.ROLL_CONTRIBUTION      // 2% of winnings

    // Update jackpot atomically using the update_jackpot function
    const supabase = createServerClient()
    const { data: newJackpot, error: jackpotError } = await supabase
      .rpc('update_jackpot', { 
        contribution: jackpotContribution + GAME_CONFIG.ROLL_COST 
      })

    if (jackpotError) {
      console.error('Error updating jackpot:', jackpotError)
      return NextResponse.json(
        { error: 'Failed to update jackpot' },
        { status: 500 }
      )
    }

    // Check for bonus rounds
    let bonusType = null
    let bonusRolls = null

    // Check for MEGA BONUS (three 6's in a row)
    if (roll === 6 && previousRolls.length >= 2) {
      const lastTwo = previousRolls.slice(-2)
      if (lastTwo.every((r: number) => r === 6)) {
        bonusType = 'MEGA_BONUS'
        // Generate 3d6 for bonus rolls
        bonusRolls = Array.from(
          { length: GAME_CONFIG.MEGA_BONUS.DICE_COUNT }, 
          () => Math.floor(Math.random() * 6) + 1
        )
      }
    }
    
    // Check for MINI BONUS (three 3's in a row)
    if (roll === 3 && previousRolls.length >= 2) {
      const lastTwo = previousRolls.slice(-2)
      if (lastTwo.every((r: number) => r === 3)) {
        bonusType = 'MINI_BONUS'
        // Generate 2d6 for bonus rolls
        bonusRolls = Array.from(
          { length: GAME_CONFIG.MINI_BONUS.DICE_COUNT }, 
          () => Math.floor(Math.random() * 6) + 1
        )
      }
    }

    console.log('Roll result:', {
      roll,
      payout,
      bonusType,
      bonusRolls,
      isBust,
      newStreak,
      jackpotContribution,
      multiplier: effectiveMultiplier,
      newJackpot
    })

    return NextResponse.json({
      data: {
        roll,
        payout,
        bonusType,
        bonusRolls,
        isBust,
        newStreak,
        jackpotContribution,
        multiplier: effectiveMultiplier,
        newJackpot
      }
    })

  } catch (error) {
    console.error('Roll error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 