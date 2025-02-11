import { NextRequest, NextResponse } from "next/server"
import { verifyAuthToken } from "@/lib/auth"
import { STANDARD_MULTIPLIERS, JACKPOT_RATES, GAME_CONFIG } from "@/lib/constants"
import { z } from "zod"

// Specify Node.js runtime for API routes
export const runtime = 'nodejs'

// Helper function to fix floating point precision
function toFixed3(num: number): number {
  return Number(num.toFixed(3))
}

// Validation schema for request body
const RollRequestSchema = z.object({
  betAmount: z.number().min(GAME_CONFIG.ROLL_COST).max(GAME_CONFIG.MAX_BET),
  currentStreak: z.number().min(0).default(0),
  currentBank: z.number().min(0).default(0),
  previousRolls: z.array(z.number()).default([]),
})

// Bonus types
type BonusType = 'MEGA_BONUS' | 'MINI_BONUS' | null

// Check for bonus round triggers
function checkBonusRound(previousRolls: number[]): BonusType {
  if (previousRolls.length < GAME_CONFIG.MEGA_BONUS.REQUIRED_ROLLS) return null
  const lastThree = previousRolls.slice(-GAME_CONFIG.MEGA_BONUS.REQUIRED_ROLLS)
  
  // Check for MEGA BONUS (three 6's in a row)
  if (lastThree.every(roll => roll === 6)) {
    return 'MEGA_BONUS'
  }
  
  // Check for MINI BONUS (three 3's in a row)
  if (previousRolls.length >= GAME_CONFIG.MINI_BONUS.REQUIRED_ROLLS) {
    const lastThreeMini = previousRolls.slice(-GAME_CONFIG.MINI_BONUS.REQUIRED_ROLLS)
    if (lastThreeMini.every(roll => roll === 3)) {
      return 'MINI_BONUS'
    }
  }
  
  return null
}

// Calculate mega bonus multiplier
function calculateMegaBonusMultiplier(): { rolls: number[], multiplier: number, wonJackpot: boolean } {
  const rolls = Array.from({ length: GAME_CONFIG.MEGA_BONUS.DICE_COUNT }, () => Math.floor(Math.random() * 6) + 1)
  const sum = rolls.reduce((a, b) => a + b, 0)
  
  // Scale multiplier based on sum
  const minSum = GAME_CONFIG.MEGA_BONUS.DICE_COUNT // All 1's
  const maxSum = GAME_CONFIG.MEGA_BONUS.DICE_COUNT * 6 // All 6's
  const multiplier = GAME_CONFIG.MEGA_BONUS.MIN_MULTIPLIER + 
    ((sum - minSum) * (GAME_CONFIG.MEGA_BONUS.MAX_MULTIPLIER - GAME_CONFIG.MEGA_BONUS.MIN_MULTIPLIER) / (maxSum - minSum))
  
  return { 
    rolls, 
    multiplier: Number(multiplier.toFixed(2)),
    wonJackpot: Math.random() < JACKPOT_RATES.MEGA_BONUS_WIN_CHANCE
  }
}

// Calculate mini bonus multiplier
function calculateMiniBonusMultiplier(): { rolls: number[], multiplier: number, wonJackpot: boolean } {
  const rolls = Array.from({ length: GAME_CONFIG.MINI_BONUS.DICE_COUNT }, () => Math.floor(Math.random() * 6) + 1)
  const sum = rolls.reduce((a, b) => a + b, 0)
  
  // Scale multiplier based on sum
  const minSum = GAME_CONFIG.MINI_BONUS.DICE_COUNT // All 1's
  const maxSum = GAME_CONFIG.MINI_BONUS.DICE_COUNT * 6 // All 6's
  const multiplier = GAME_CONFIG.MINI_BONUS.MIN_MULTIPLIER + 
    ((sum - minSum) * (GAME_CONFIG.MINI_BONUS.MAX_MULTIPLIER - GAME_CONFIG.MINI_BONUS.MIN_MULTIPLIER) / (maxSum - minSum))
  
  return { 
    rolls, 
    multiplier: Number(multiplier.toFixed(2)),
    wonJackpot: Math.random() < JACKPOT_RATES.MINI_BONUS_WIN_CHANCE
  }
}

// Generate a roll with proper RNG
function generateRoll(): number {
  return Math.floor(Math.random() * 6) + 1
}

// Calculate final payout including streak bonuses
function calculatePayout(
  roll: number, 
  currentBank: number,
  currentStreak: number,
  previousRolls: number[]
): {
  payout: number
  jackpotContribution: number
  bonusType?: BonusType
  bonusRolls?: number[]
  multiplier: number
  wonJackpot?: boolean
  isBust: boolean
  newStreak: number
} {
  // Check for bonus rounds first
  const bonusType = checkBonusRound([...previousRolls, roll])
  
  if (bonusType === 'MEGA_BONUS') {
    const bonus = calculateMegaBonusMultiplier()
    const payout = currentBank * bonus.multiplier
    return {
      payout,
      jackpotContribution: payout * JACKPOT_RATES.ROLL_CONTRIBUTION,
      bonusType: 'MEGA_BONUS',
      bonusRolls: bonus.rolls,
      multiplier: bonus.multiplier,
      wonJackpot: bonus.wonJackpot,
      isBust: false,
      newStreak: currentStreak + 1
    }
  }

  if (bonusType === 'MINI_BONUS') {
    const bonus = calculateMiniBonusMultiplier()
    const payout = currentBank * bonus.multiplier
    return {
      payout,
      jackpotContribution: payout * JACKPOT_RATES.ROLL_CONTRIBUTION,
      bonusType: 'MINI_BONUS',
      bonusRolls: bonus.rolls,
      multiplier: bonus.multiplier,
      wonJackpot: bonus.wonJackpot,
      isBust: false,
      newStreak: currentStreak + 1
    }
  }

  // Get base multiplier
  const baseMultiplier = STANDARD_MULTIPLIERS[roll as keyof typeof STANDARD_MULTIPLIERS]
  
  // Add streak bonus
  const streakBonus = Math.min(
    currentStreak * GAME_CONFIG.STREAK_BONUS_PER_LEVEL, 
    GAME_CONFIG.MAX_STREAK_BONUS
  )
  
  // Calculate final multiplier (apply streak bonus even on break-even rolls)
  const finalMultiplier = roll === 1 ? 0 : (baseMultiplier + streakBonus)

  // For break-even rolls (3 or 6), ensure we at least keep the current bank plus streak bonus
  const effectiveMultiplier = (roll === 3 || roll === 6) ? Math.max(1 + streakBonus, finalMultiplier) : finalMultiplier

  // Check if bust
  const isBust = roll === 1
  
  // Log detailed calculation steps
  console.log('Payout calculation:', {
    roll,
    currentBank,
    currentStreak,
    baseMultiplier,
    streakBonus,
    finalMultiplier,
    effectiveMultiplier,
    rawPayout: currentBank * effectiveMultiplier,
    fixedPayout: toFixed3(currentBank * effectiveMultiplier)
  })

  const payout = toFixed3(currentBank * effectiveMultiplier)

  // Calculate jackpot contribution
  const jackpotContribution = isBust 
    ? currentBank * JACKPOT_RATES.BUST_CONTRIBUTION
    : payout * JACKPOT_RATES.ROLL_CONTRIBUTION

  return {
    payout,
    jackpotContribution,
    multiplier: effectiveMultiplier,
    isBust,
    newStreak: isBust ? 0 : currentStreak + 1
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify auth token
    const authResult = await verifyAuthToken(request)
    if (!authResult.isAuthenticated || !authResult.userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized", code: "AUTH_REQUIRED" },
        { status: 401 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validationResult = RollRequestSchema.safeParse(body)
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Invalid request body",
          details: validationResult.error.errors
        },
        { status: 400 }
      )
    }

    // Generate roll and calculate payout
    const roll = generateRoll()
    const { betAmount, currentBank, currentStreak, previousRolls } = validationResult.data
    
    // Use initial bet if no current bank, otherwise use current bank
    const bankToUse = currentBank || betAmount
    
    // Calculate result
    const result = calculatePayout(
      roll,
      bankToUse,
      currentStreak,
      previousRolls
    )

    // Return roll result
    return NextResponse.json({
      success: true,
      data: {
        roll,
        ...result,
        userId: authResult.userId
      }
    })

  } catch (error) {
    console.error("Error processing roll:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
} 