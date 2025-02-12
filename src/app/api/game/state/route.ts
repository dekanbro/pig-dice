import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { verifyAuthToken } from '@/lib/auth'
import type { Database } from '@/types/supabase'

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL')
}
if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing env.SUPABASE_SERVICE_ROLE_KEY')
}

// Initialize Supabase with service role key for admin access
const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function GET(request: NextRequest) {
  try {
    console.log('GET /api/game/state - Starting request')
    
    const authResult = await verifyAuthToken(request)
    console.log('Auth result:', { isAuthenticated: authResult.isAuthenticated, userId: authResult.userId })
    
    if (!authResult.isAuthenticated || !authResult.userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      )
    }

    // First, get all records for this user
    const { data, error } = await supabase
      .from('game_data')
      .select('*')
      .eq('user_id', authResult.userId)
      .order('updated_at', { ascending: false })

    if (error) {
      console.error('Supabase error:', error)
      throw error
    }

    // If we have multiple records, keep only the most recent one and delete others
    if (data && data.length > 1) {
      console.log(`Found ${data.length} records for user ${authResult.userId}, cleaning up...`)
      
      // Delete all but the most recent record
      const recordsToDelete = data.slice(1).map(record => record.id)
      const { error: deleteError } = await supabase
        .from('game_data')
        .delete()
        .in('id', recordsToDelete)

      if (deleteError) {
        console.error('Error deleting duplicate records:', deleteError)
      } else {
        console.log(`Deleted ${recordsToDelete.length} duplicate records`)
      }
    }

    // Return the most recent record's game state
    const mostRecentRecord = data?.[0]
    console.log('Successfully fetched game state:', mostRecentRecord?.game_state)
    return NextResponse.json({ success: true, data: mostRecentRecord?.game_state || null })

  } catch (error) {
    console.error('Detailed error in GET /api/game/state:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to load game state" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('POST /api/game/state - Starting request')
    
    const authResult = await verifyAuthToken(request)
    console.log('Auth result:', { isAuthenticated: authResult.isAuthenticated, userId: authResult.userId })
    
    if (!authResult.isAuthenticated || !authResult.userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { gameState } = body

    // First try to update
    const { data, error: updateError } = await supabase
      .from('game_data')
      .update({ 
        game_state: gameState,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', authResult.userId)
      .select()

    if (updateError) {
      console.error('Update error:', updateError)
      throw updateError
    }

    // If no record exists, create new one
    if (!data || data.length === 0) {
      console.log('No existing record, creating new one')
      const { error: insertError } = await supabase
        .from('game_data')
        .insert({
          user_id: authResult.userId,
          game_state: gameState,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })

      if (insertError) {
        console.error('Insert error:', insertError)
        throw insertError
      }
    }

    console.log('Successfully saved game state')
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Detailed error in POST /api/game/state:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to save game state" },
      { status: 500 }
    )
  }
} 