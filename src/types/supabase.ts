export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type GameState = {
  jackpotAmount: number
  sessionStats: {
    totalGames: number
    wins: number
    highestWin: number
    winRate: number
  }
  sessionBank: number
  recentWinners: Array<{
    address: string
    amount: string
    timestamp: string
  }>
  currentStreak: number
  currentBank: number
  gameStarted: boolean
  previousRolls: number[]
  bonusType: 'MEGA_BONUS' | 'MINI_BONUS' | null
  bonusRolls: number[]
}

export interface Database {
  public: {
    Tables: {
      game_data: {
        Row: {
          id: number
          user_id: string
          game_state: GameState
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          user_id: string
          game_state: GameState
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          user_id?: string
          game_state?: GameState
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
} 