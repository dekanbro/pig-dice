export const STANDARD_MULTIPLIERS = {
  1: 0,      // Bust
  2: 0.8,    // Small loss
  3: 1.0,    // Break even
  4: 1.2,    // Small win
  5: 1.5,    // Medium win
  6: 1.0     // Break even
} as const

export const JACKPOT_RATES = {
  ROLL_CONTRIBUTION: 0.02,    // 2% of winnings go to jackpot
  BUST_CONTRIBUTION: 1.0,     // 100% of bust amount goes to jackpot
  INITIAL_AMOUNT: 0          // Starting jackpot amount
} as const

export const GAME_CONFIG = {
  // Streak bonuses
  STREAK_BONUS_PER_LEVEL: 0.05,  // 5% bonus per streak level
  MAX_STREAK_BONUS: 0.5,         // Maximum 50% streak bonus
  
  // Cost per roll (added to jackpot)
  ROLL_COST: 0.01,               // $0.01 per roll
  
  // Game settings
  INITIAL_JACKPOT: 0,          // Starting jackpot amount
  SIGNIFICANT_WIN: 1.0,          // Threshold for recording in recent winners
  
  // Bonus round settings
  MEGA_BONUS: {
    DICE_COUNT: 3,               // Number of bonus dice for MEGA bonus
    TRIGGER_CHANCE: 0.05,        // 5% chance on roll of 6
    MIN_MULTIPLIER: 2.0,         // Minimum 2x multiplier
    MAX_MULTIPLIER: 5.0          // Maximum 5x multiplier
  },
  
  MINI_BONUS: {
    DICE_COUNT: 2,               // Number of bonus dice for MINI bonus
    TRIGGER_CHANCE: 0.01,        // 1% chance on roll of 3
    MIN_MULTIPLIER: 1.5,         // Minimum 1.5x multiplier
    MAX_MULTIPLIER: 3.0          // Maximum 3x multiplier
  }
} as const 