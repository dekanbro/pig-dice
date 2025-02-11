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
  1: 0, // Bust - lose everything
  2: 0.5, // Small loss
  3: 1, // Break even
  4: 1.5, // Small win
  5: 2, // Medium win
  6: 1, // Break even (but potential bonus trigger)
} as const

// Bonus types
type BonusType = 'MEGA_BONUS' | 'MINI_BONUS' | null

// Check for bonus round triggers
function checkBonusRound(previousRolls: number[]): BonusType {
  if (previousRolls.length < 2) return null
  const lastTwo = previousRolls.slice(-2)
  
  // Check for MEGA BONUS (two 6's in a row)
  if (lastTwo.every(roll => roll === 6)) {
    return 'MEGA_BONUS'
  }
  
  // Check for MINI BONUS (three 3's in a row)
  if (previousRolls.length >= 3) {
    const lastThree = previousRolls.slice(-3)
    if (lastThree.every(roll => roll === 3)) {
      return 'MINI_BONUS'
    }
  }
  
  return null
}

// Calculate mega bonus multiplier (3d6)
function calculateMegaBonusMultiplier(): { rolls: number[], multiplier: number } {
  const rolls = Array.from({ length: 3 }, () => Math.floor(Math.random() * 6) + 1)
  const sum = rolls.reduce((a, b) => a + b, 0)
  
  // Scale multiplier based on sum (3-18)
  // Min sum = 3 (1+1+1) = 3x
  // Max sum = 18 (6+6+6) = 15x
  const multiplier = 3 + ((sum - 3) * (15 - 3) / (18 - 3))
  
  return { rolls, multiplier: Number(multiplier.toFixed(2)) }
}

// Calculate mini bonus multiplier (2d6)
function calculateMiniBonusMultiplier(): { rolls: number[], multiplier: number } {
  const rolls = Array.from({ length: 2 }, () => Math.floor(Math.random() * 6) + 1)
  const sum = rolls.reduce((a, b) => a + b, 0)
  
  // Scale multiplier based on sum (2-12)
  // Min sum = 2 (1+1) = 1.5x
  // Max sum = 12 (6+6) = 5x
  const multiplier = 1.5 + ((sum - 2) * (5 - 1.5) / (12 - 2))
  
  return { rolls, multiplier: Number(multiplier.toFixed(2)) }
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
  bonusType?: BonusType
  bonusRolls?: number[]
  multiplier: number
  isBust: boolean
  newStreak: number
} {
  // Check for bonus rounds first
  const bonusType = checkBonusRound([...previousRolls, roll])
  
  if (bonusType === 'MEGA_BONUS') {
    const bonus = calculateMegaBonusMultiplier()
    return {
      payout: currentBank * bonus.multiplier,
      bonusType: 'MEGA_BONUS',
      bonusRolls: bonus.rolls,
      multiplier: bonus.multiplier,
      isBust: false,
      newStreak: currentStreak + 1
    }
  }

  if (bonusType === 'MINI_BONUS') {
    const bonus = calculateMiniBonusMultiplier()
    return {
      payout: currentBank * bonus.multiplier,
      bonusType: 'MINI_BONUS',
      bonusRolls: bonus.rolls,
      multiplier: bonus.multiplier,
      isBust: false,
      newStreak: currentStreak + 1
    }
  }

  // Get base multiplier
  const baseMultiplier = STANDARD_MULTIPLIERS[roll as keyof typeof STANDARD_MULTIPLIERS]
  
  // Add streak bonus (10% extra per streak)
  const streakBonus = currentStreak * 0.1
  const finalMultiplier = baseMultiplier + streakBonus

  // Check if bust
  const isBust = roll === 1

  return {
    payout: currentBank * finalMultiplier,
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