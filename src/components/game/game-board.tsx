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
import { JackpotPanel } from './jackpot-panel'
import { useEffect, useState } from 'react'
import { toast } from '@/components/ui/use-toast'
import { getRollDescription, getRollVariant } from '@/hooks/use-game-state'
import { GAME_CONFIG } from '@/lib/constants'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { CashOutEffect } from './animations/cash-out'

type GameBoardProps = UseGameStateReturn & {
  onTriggerJackpot?: () => void
  onClearWallet?: () => void
  jackpotAmount?: number
  setJackpotAmount?: (amount: number) => void
}

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
  onTriggerJackpot,
  onClearWallet,
  jackpotAmount,
  setJackpotAmount,
}: GameBoardProps) {
  const { user } = usePrivy()
  const [showJackpot, setShowJackpot] = useState(false)
  const [jackpotWinAmount, setJackpotWinAmount] = useState(0)
  const [showCashOut, setShowCashOut] = useState(false)
  const [cashOutAmount, setCashOutAmount] = useState(0)

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

  // Handle cashout with animation
  const onCashout = () => {
    if (currentBank <= 0) {
      toast({
        title: "Nothing to Cash Out",
        description: "Your current bank is empty.",
        variant: "destructive"
      })
      return
    }

    setCashOutAmount(currentBank)
    setShowCashOut(true)
  }

  const handleCashOutDismiss = () => {
    setShowCashOut(false)
    handleCashout()
    toast({
      title: "Cashed Out!",
      description: `Successfully cashed out ${cashOutAmount.toFixed(3)} PIG!`,
    })
  }

  // Handle roll complete with toast for special outcomes
  const onRollComplete = () => {
    // Wait for any animations to complete before showing result
    requestAnimationFrame(() => {
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
    })
  }

  // Handle jackpot win
  const handleJackpotTrigger = () => {
    if (onTriggerJackpot) {
      setJackpotWinAmount(jackpotAmount || 0)
      setShowJackpot(true)
      onTriggerJackpot()
    }
  }

  const handleJackpotDismiss = () => {
    setShowJackpot(false)
  }

  // Handle adding to jackpot
  const handleAddToJackpot = () => {
    if (setJackpotAmount && jackpotAmount !== undefined) {
      setJackpotAmount(jackpotAmount + 1)
      toast({
        title: "💎 Jackpot Increased",
        description: `Added 1 PIG to jackpot. New total: ${(jackpotAmount + 1).toFixed(3)} PIG`,
        variant: "default"
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

        {/* Jackpot Animation */}
        <AnimatePresence>
          {showJackpot && !isRolling && (
            <JackpotPanel
              amount={jackpotWinAmount}
              onDismiss={handleJackpotDismiss}
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
        <AnimatePresence mode="wait">
          <motion.div
            key={previousRolls.length > 0 ? 'history' : 'placeholder'}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="h-12 flex items-center gap-2 overflow-x-auto p-2 w-full max-w-xs"
          >
            {previousRolls.length > 0 ? (
              previousRolls.map((roll, index) => (
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
              ))
            ) : (
              <div className="flex gap-2">
                {[1, 2, 3].map((i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={{ 
                      opacity: [0, 0.3, 0.1],
                      scale: [1, 1.05, 1]
                    }}
                    transition={{ 
                      duration: 2,
                      delay: i * 0.2,
                      repeat: Infinity,
                      repeatType: "reverse"
                    }}
                    className="w-8 h-8 flex items-center justify-center rounded-full border border-muted-foreground/80 bg-muted/10"
                  >
                    <div className="w-2 h-2 rounded-full bg-muted-foreground/20" />
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Debug Panel */}
        <DebugPanel
          onTriggerMegaBonus={simulateMegaBonus}
          onTriggerMiniBonus={simulateMiniBonusBonus}
          onTriggerBust={handleBust}
          onTriggerJackpot={handleJackpotTrigger}
          onClearWallet={onClearWallet || (() => {})}
          onAddToJackpot={handleAddToJackpot}
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

        {/* Add Cash Out Animation */}
        <AnimatePresence>
          {showCashOut && !isRolling && (
            <CashOutEffect
              amount={cashOutAmount}
              onDismiss={handleCashOutDismiss}
            />
          )}
        </AnimatePresence>
      </CardContent>
      <CardFooter className="flex justify-center gap-4">
        {!gameStarted ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <Button
                    size="lg"
                    onClick={onStartGame}
                    disabled={isRolling || !user?.id || sessionBank < GAME_CONFIG.ROLL_COST}
                    className={sessionBank < GAME_CONFIG.ROLL_COST ? "bg-destructive/80 hover:bg-destructive/80 text-destructive-foreground border-destructive-foreground/50" : ""}
                  >
                    Start Game ({GAME_CONFIG.ROLL_COST} PIG)
                  </Button>
                </div>
              </TooltipTrigger>
              {sessionBank < GAME_CONFIG.ROLL_COST && (
                <TooltipContent>
                  <p>Insufficient PIG in session bank</p>
                  <p className="text-xs text-muted-foreground">Need: {GAME_CONFIG.ROLL_COST} PIG</p>
                  <p className="text-xs text-muted-foreground">Have: {sessionBank.toFixed(3)} PIG</p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
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
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <Button
                      size="lg"
                      onClick={() => handleRoll()}
                      disabled={isRolling || !user?.id || sessionBank < GAME_CONFIG.ROLL_COST}
                      className={sessionBank < GAME_CONFIG.ROLL_COST ? "bg-destructive/80 hover:bg-destructive/80 text-destructive-foreground border-destructive-foreground/50" : ""}
                    >
                      {isRolling ? 'Rolling...' : `Roll Again (${GAME_CONFIG.ROLL_COST} PIG)`}
                    </Button>
                  </div>
                </TooltipTrigger>
                {sessionBank < GAME_CONFIG.ROLL_COST && (
                  <TooltipContent>
                    <p>Insufficient PIG in session bank</p>
                    <p className="text-xs text-muted-foreground">Need: {GAME_CONFIG.ROLL_COST} PIG</p>
                    <p className="text-xs text-muted-foreground">Have: {sessionBank.toFixed(3)} PIG</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          </>
        )}
      </CardFooter>
    </Card>
  )
} 