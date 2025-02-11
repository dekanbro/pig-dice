import { NextRequest, NextResponse } from "next/server"
import { verifyAuthToken } from "@/lib/auth"
import { z } from "zod"

// Specify Node.js runtime for API routes
export const runtime = 'nodejs'

// Validation schema for request body
const RollRequestSchema = z.object({
  betAmount: z.number().min(0.01).max(1),
  currentStreak: z.number().min(0).default(0),
  currentBank: z.number().min(0).default(0),
  previousRolls: z.array(z.number()).default([]),
})

// Payout multipliers for standard rolls
const STANDARD_MULTIPLIERS = {
  1: 0, // Bust - 50% to jackpot
  2: 0.2, // Small loss
  3: 0, // Break even
  4: 1.2, // Small win
  5: 1.5, // Medium win
  6: 0, // Break even
} as const

// Jackpot contribution rates
const JACKPOT_RATES = {
  INITIAL_DEPOSIT: 0.05, // 5% of initial deposit
  ROLL_CONTRIBUTION: 0.02, // 2% of potential winnings
  BUST_CONTRIBUTION: 0.5, // 50% of lost amount
  MEGA_BONUS_WIN_CHANCE: 0.05, // 5% chance
  MINI_BONUS_WIN_CHANCE: 0.01, // 1% chance
} as const

// Bonus types
type BonusType = 'MEGA_BONUS' | 'MINI_BONUS' | null

// Check for bonus round triggers
function checkBonusRound(previousRolls: number[]): BonusType {
  if (previousRolls.length < 3) return null
  const lastThree = previousRolls.slice(-3)
  
  // Check for MEGA BONUS (three 6's in a row)
  if (lastThree.every(roll => roll === 6)) {
    return 'MEGA_BONUS'
  }
  
  // Check for MINI BONUS (three 3's in a row)
  if (previousRolls.length >= 3) {
    if (lastThree.every(roll => roll === 3)) {
      return 'MINI_BONUS'
    }
  }
  
  return null
}

// Calculate mega bonus multiplier (3d6)
function calculateMegaBonusMultiplier(): { rolls: number[], multiplier: number, wonJackpot: boolean } {
  const rolls = Array.from({ length: 3 }, () => Math.floor(Math.random() * 6) + 1)
  const sum = rolls.reduce((a, b) => a + b, 0)
  
  // Scale multiplier based on sum (3-18)
  // Min sum = 3 (1+1+1) = 2x
  // Max sum = 18 (6+6+6) = 10x
  const multiplier = 2 + ((sum - 3) * (10 - 2) / (18 - 3))
  
  // 5% chance to win jackpot
  const wonJackpot = Math.random() < JACKPOT_RATES.MEGA_BONUS_WIN_CHANCE
  
  return { 
    rolls, 
    multiplier: Number(multiplier.toFixed(2)),
    wonJackpot
  }
}

// Calculate mini bonus multiplier (2d6)
function calculateMiniBonusMultiplier(): { rolls: number[], multiplier: number, wonJackpot: boolean } {
  const rolls = Array.from({ length: 2 }, () => Math.floor(Math.random() * 6) + 1)
  const sum = rolls.reduce((a, b) => a + b, 0)
  
  // Scale multiplier based on sum (2-12)
  // Min sum = 2 (1+1) = 1.2x
  // Max sum = 12 (6+6) = 3x
  const multiplier = 1.2 + ((sum - 2) * (3 - 1.2) / (12 - 2))
  
  // 1% chance to win jackpot
  const wonJackpot = Math.random() < JACKPOT_RATES.MINI_BONUS_WIN_CHANCE
  
  return { 
    rolls, 
    multiplier: Number(multiplier.toFixed(2)),
    wonJackpot
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
  
  // Add streak bonus (5% per streak, max 50%)
  const streakBonus = Math.min(currentStreak * 0.05, 0.5)
  
  // Apply risk increase (-10% per 5 streak levels)
  const riskPenalty = Math.floor(currentStreak / 5) * 0.1
  
  // Calculate final multiplier
  const finalMultiplier = Math.max(0, baseMultiplier + streakBonus - riskPenalty)

  // Check if bust
  const isBust = roll === 1
  const payout = currentBank * finalMultiplier

  // Calculate jackpot contribution
  const jackpotContribution = isBust 
    ? currentBank * JACKPOT_RATES.BUST_CONTRIBUTION
    : payout * JACKPOT_RATES.ROLL_CONTRIBUTION

  return {
    payout,
    jackpotContribution,
    multiplier: finalMultiplier,
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