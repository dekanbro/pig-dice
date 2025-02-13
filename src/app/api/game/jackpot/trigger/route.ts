import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { verifyAuthToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const authResult = await verifyAuthToken(request)
    if (!authResult.isAuthenticated || !authResult.userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const supabase = createServerClient()

    // First, check if jackpot is already won
    const { data: jackpotState, error: stateError } = await supabase
      .from('jackpot')
      .select('amount, jackpot_won')
      .single()

    console.log('Current jackpot state:', jackpotState)

    if (stateError) {
      console.error('Error checking jackpot state:', stateError)
      return NextResponse.json(
        { error: 'Failed to check jackpot state' },
        { status: 500 }
      )
    }

    if (jackpotState?.jackpot_won) {
      console.log('Jackpot already won, resetting first')
      // Reset jackpot first
      const { data: resetData, error: resetError } = await supabase
        .rpc('reset_jackpot')

      if (resetError) {
        console.error('Error resetting jackpot:', resetError)
        return NextResponse.json(
          { error: 'Failed to reset jackpot' },
          { status: 500 }
        )
      }
      console.log('Jackpot reset result:', resetData)
    }

    // Now trigger jackpot win
    const { data: jackpotData, error: jackpotError } = await supabase
      .rpc('trigger_jackpot_win')

    if (jackpotError) {
      console.error('Error triggering jackpot:', jackpotError)
      return NextResponse.json(
        { error: 'Failed to trigger jackpot' },
        { status: 500 }
      )
    }

    console.log('Raw jackpot trigger result:', jackpotData)

    if (!jackpotData || typeof jackpotData.won_amount !== 'number' || typeof jackpotData.amount !== 'number') {
      console.error('Invalid jackpot data:', jackpotData)
      return NextResponse.json(
        { error: 'Invalid jackpot data' },
        { status: 500 }
      )
    }

    const response = {
      won_amount: jackpotData.won_amount,
      amount: jackpotData.amount,
      jackpot_won: jackpotData.jackpot_won
    }

    console.log('Sending jackpot response:', response)

    // Return the won amount
    return NextResponse.json(response)

  } catch (error) {
    console.error('Error in POST /api/game/jackpot/trigger:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 