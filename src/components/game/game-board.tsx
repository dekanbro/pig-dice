'use client'

import { usePrivy } from '@privy-io/react-auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { MegaDice } from './mega-dice'
import { RulesDialog } from './rules-dialog'
import { motion, AnimatePresence } from 'framer-motion'
import type { UseGameStateReturn } from '@/hooks/use-game-state'
import { BonusPanel } from './bonus-panel'
import { BustEffect } from './animations/rain'
import { DebugPanel } from './debug-panel'
import { useEffect } from 'react'
import { toast } from '@/components/ui/use-toast'
import { getRollDescription, getRollVariant } from '@/hooks/use-game-state'
import { GAME_CONFIG } from '@/lib/constants'

type GameBoardProps = UseGameStateReturn

export function GameBoard({
  isRolling,
  currentRoll,
  currentBank,
  sessionBank,
  currentStreak,
  previousRolls,
  gameStarted,
  bonusType,
  bonusRolls,
  showBust,
  handleStartGame,
  handleRoll,
  handleBust,
  handleCashout,
  handleRollComplete,
  handleBonusDismiss,
  handleBustDismiss,
  simulateMegaBonus,
  simulateMiniBonusBonus,
  handleDeposit,
}: GameBoardProps) {
  const { user } = usePrivy()

  // Add effect to auto-roll when game starts
  useEffect(() => {
    if (gameStarted && !isRolling && previousRolls.length === 0) {
      handleRoll()
    }
  }, [gameStarted, isRolling, previousRolls.length, handleRoll])

  // Handle game start with toast
  const onStartGame = async () => {
    if (!user?.id) {
      toast({
        title: "Not Connected",
        description: "Please connect your wallet to play.",
        variant: "destructive"
      })
      return
    }

    if (sessionBank < GAME_CONFIG.ROLL_COST) {
      toast({
        title: "Insufficient Balance",
        description: "You need at least 0.01 PIG to start a game.",
        variant: "destructive"
      })
      return
    }

    await handleStartGame()
  }

  // Handle debug top up
  const handleDebugTopUp = () => {
    handleDeposit(1)
  }

  // Handle cashout with toast
  const onCashout = () => {
    if (currentBank <= 0) {
      toast({
        title: "Nothing to Cash Out",
        description: "Your current bank is empty.",
        variant: "destructive"
      })
      return
    }

    handleCashout()
    toast({
      title: "Cashed Out!",
      description: `Successfully cashed out ${currentBank.toFixed(3)} PIG!`,
    })
  }

  // Handle roll complete with toast for special outcomes
  const onRollComplete = () => {
    console.log('GameBoard onRollComplete called', { currentRoll, isRolling })
    
    handleRollComplete()
    
    const roll = currentRoll[0]
    console.log('Current roll value:', roll)
    
    if (roll) {
      console.log('Showing toast for roll:', roll)
      toast({
        title: "Roll Complete",
        description: getRollDescription(roll, (currentStreak - 1) * GAME_CONFIG.STREAK_BONUS_PER_LEVEL),
        variant: getRollVariant(roll)
      })
    }
  }

  return (
    <Card className="w-full relative">
      <RulesDialog />
      <CardHeader>
        <CardTitle className="text-center">Push Your Luck!</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-6">
        {/* Bonus Round Animations */}
        <AnimatePresence>
          {bonusType && !isRolling && (
            <BonusPanel
              type={bonusType}
              rolls={bonusRolls}
              currentBank={currentBank}
              onDismiss={handleBonusDismiss}
            />
          )}
        </AnimatePresence>

        <div className="w-32 h-32 md:w-48 md:h-48">
          <MegaDice
            rolling={isRolling}
            value={currentRoll[0] || null}
            onRollComplete={onRollComplete}
          />
        </div>

        {/* Current Bank and Streak */}
        <div className="grid grid-cols-2 gap-4 w-full max-w-xs">
          <motion.div
            className="text-center p-4 border rounded-lg"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 0.3 }}
          >
            <div className="text-sm text-muted-foreground">Current Bank</div>
            <div className="text-2xl font-bold">
              {Number(currentBank).toFixed(3)}
            </div>
          </motion.div>
          <motion.div
            className="text-center p-4 border rounded-lg relative overflow-hidden"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 0.3 }}
          >
            <div className="text-sm text-muted-foreground">Streak</div>
            <div className="text-2xl font-bold">{currentStreak}</div>
            {currentStreak > 1 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs text-green-500 font-medium"
              >
                +{Math.min((currentStreak - 1) * (GAME_CONFIG.STREAK_BONUS_PER_LEVEL * 100), GAME_CONFIG.MAX_STREAK_BONUS * 100)}% Bonus
              </motion.div>
            )}
            {currentStreak > 0 && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-t from-green-500/5 to-transparent -z-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: Math.min(currentStreak * 0.1, 1) }}
              />
            )}
          </motion.div>
        </div>

        {/* Previous Rolls */}
        <AnimatePresence>
          {!isRolling && !bonusType && !showBust && previousRolls.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex gap-2 overflow-x-auto p-2 w-full max-w-xs"
            >
              {previousRolls.map((roll, index) => (
                <motion.div
                  key={index}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1 * index }}
                  className={`w-8 h-8 flex items-center justify-center rounded-full border
                    ${roll === 6 ? 'bg-yellow-500 text-white' :
                      roll === 3 ? 'bg-blue-500 text-white' :
                        roll === 1 ? 'bg-red-500 text-white' : 'bg-secondary'}`}
                >
                  {roll}
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Debug Panel */}
        <DebugPanel
          onTriggerMegaBonus={simulateMegaBonus}
          onTriggerMiniBonus={simulateMiniBonusBonus}
          onTriggerBust={handleBust}
          setCurrentBank={handleBust}
          currentBank={currentBank}
          onTopUpSession={handleDebugTopUp}
        />

        {/* Add Bust Animation */}
        <AnimatePresence>
          {showBust && !isRolling && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-20"
              onClick={handleBustDismiss}
            >
              <BustEffect onDismiss={handleBustDismiss} />
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
      <CardFooter className="flex justify-center gap-4">
        {!gameStarted ? (
          <Button
            size="lg"
            onClick={onStartGame}
            disabled={isRolling || !user?.id || sessionBank < GAME_CONFIG.ROLL_COST}
          >
            Start Game ({GAME_CONFIG.ROLL_COST} PIG)
          </Button>
        ) : (
          <>
            <Button
              size="lg"
              variant="outline"
              onClick={onCashout}
              disabled={isRolling || currentBank <= 0}
            >
              Cash Out
            </Button>
            <Button
              size="lg"
              onClick={() => handleRoll()}
              disabled={isRolling || !user?.id || sessionBank < GAME_CONFIG.ROLL_COST}
            >
              {isRolling ? 'Rolling...' : `Roll Again (${GAME_CONFIG.ROLL_COST} PIG)`}
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  )
} 