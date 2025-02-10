import { NextRequest, NextResponse } from "next/server"
import { verifyAuthToken } from "@/lib/auth"

// Mock function to generate a random roll (1-6)
function generateRoll(): number {
  return Math.floor(Math.random() * 6) + 1
}

// Mock function to calculate payout based on roll
function calculatePayout(roll: number, betAmount: number): number {
  // Simple payout logic: higher rolls get better multipliers
  const multipliers = {
    1: 1.2,
    2: 1.5,
    3: 1.8,
    4: 2.1,
    5: 2.5,
    6: 3.0,
  }
  return betAmount * multipliers[roll as keyof typeof multipliers]
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const { userId } = await verifyAuthToken(request)
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { betAmount } = body

    // Validate bet amount
    if (!betAmount || betAmount <= 0) {
      return NextResponse.json(
        { success: false, error: "Invalid bet amount" },
        { status: 400 }
      )
    }

    // Generate roll and calculate payout
    const roll = generateRoll()
    const payout = calculatePayout(roll, betAmount)

    // Return the result
    return NextResponse.json({
      success: true,
      data: {
        roll,
        payout,
        userId,
      },
    })
  } catch (error) {
    console.error("Error processing roll:", error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : "Internal server error" 
      },
      { status: 500 }
    )
  }
} 