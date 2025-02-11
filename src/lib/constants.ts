export const STANDARD_MULTIPLIERS = {
  1: 0,    // Bust - lose everything (100% goes to jackpot)
  2: 0.8,  // Small loss - keep 80%
  3: 0,    // Break even
  4: 1.2,  // Small win - get 120%
  5: 1.5,  // Medium win - get 150%
  6: 0,    // Break even
} as const

export const JACKPOT_RATES = {
  INITIAL_DEPOSIT: 0.05,    // 5% of initial deposit
  ROLL_CONTRIBUTION: 0.02,  // 2% of potential winnings
  BUST_CONTRIBUTION: 1,     // 100% of lost amount goes to jackpot
  MEGA_BONUS_WIN_CHANCE: 0.05, // 5% chance
  MINI_BONUS_WIN_CHANCE: 0.01, // 1% chance
} as const

export const GAME_CONFIG = {
  // Basic game settings
  ROLL_COST: 0.01,         // Cost per roll in PIG
  INITIAL_JACKPOT: 5.5,    // Starting jackpot amount
  MAX_BET: 1,              // Maximum bet amount
  SIGNIFICANT_WIN: 1,      // Threshold for recording in recent winners
  
  // Streak bonus settings
  STREAK_BONUS_PER_LEVEL: 0.05,  // 5% bonus per streak level
  MAX_STREAK_BONUS: 0.5,         // Maximum 50% streak bonus
  
  // Bonus round settings
  MEGA_BONUS: {
    REQUIRED_ROLLS: 3,           // Number of 6's needed
    MIN_MULTIPLIER: 2,           // Minimum 2x multiplier
    MAX_MULTIPLIER: 10,          // Maximum 10x multiplier
    DICE_COUNT: 3,               // Number of dice for bonus roll
  },
  
  MINI_BONUS: {
    REQUIRED_ROLLS: 3,           // Number of 3's needed
    MIN_MULTIPLIER: 1.2,         // Minimum 1.2x multiplier
    MAX_MULTIPLIER: 3,           // Maximum 3x multiplier
    DICE_COUNT: 2,               // Number of dice for bonus roll
  }
} as const 