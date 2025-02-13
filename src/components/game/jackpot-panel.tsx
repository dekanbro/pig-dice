import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { FireworksEffect } from './animations/fireworks'

interface JackpotPanelProps {
  amount: number
  onDismiss: () => void
}

export function JackpotPanel({ amount, onDismiss }: JackpotPanelProps) {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="absolute inset-0 z-10 flex items-center justify-center bg-purple-500/30 backdrop-blur-sm"
      onClick={onDismiss}
    >
      {/* Add Enhanced Fireworks */}
      <FireworksEffect type="JACKPOT" />
      
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="text-center p-8 rounded-lg bg-background/95 shadow-xl border-2 border-purple-500 border-opacity-50"
        onClick={(e) => e.stopPropagation()}
      >
        <motion.h2
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, -5, 5, 0],
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            repeatType: "reverse"
          }}
          className="text-5xl font-bold mb-6 bg-gradient-to-r from-purple-400 via-pink-500 to-purple-600 text-transparent bg-clip-text"
        >
          🎰 JACKPOT! 🎰
        </motion.h2>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="text-3xl font-bold mb-8 text-purple-500"
        >
          {amount.toFixed(3)} PIG
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
        >
          <Button
            onClick={onDismiss}
            size="lg"
            className="bg-purple-500 hover:bg-purple-600 text-white border-none shadow-lg"
          >
            Collect Winnings
          </Button>
          <div className="mt-2 text-xs text-muted-foreground">
            Click anywhere to continue
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  )
} 