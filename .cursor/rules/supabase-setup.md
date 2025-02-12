# Supabase Setup Guide

## Database Structure

### Game Data Table
```sql
CREATE TABLE game_data (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  game_state JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### Security
- Row Level Security (RLS) enabled
- Users can only access their own data
- Automatic timestamp updates
- Index on user_id for performance

## Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key      # Safe for client
SUPABASE_SERVICE_ROLE_KEY=your_service_key       # Server-side only
```

## Architecture

### API Routes
- `/api/game/state` handles all game state operations
- Uses service role key for admin access
- Authenticated via Privy tokens
- Proper error handling and type safety

### Client-Side
- Uses public anon key only
- Real-time subscriptions via Supabase client
- Protected by RLS policies
- Type-safe with GameState interface

### Security Model
1. Sensitive operations through API routes only
2. Service role key never exposed to client
3. RLS policies protect direct Supabase access
4. Authentication required for all operations

## Type Definitions
```typescript
type GameState = {
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
```

## Verification Steps
1. Check table creation in Supabase dashboard
2. Verify RLS policies are active
3. Test authentication flow
4. Verify data isolation between users
5. Test real-time updates
6. Confirm state persistence 