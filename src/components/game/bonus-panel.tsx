import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { FireworksEffect } from './animations/fireworks'

interface BonusPanelProps {
  type: 'MEGA_BONUS' | 'MINI_BONUS'
  rolls: number[]
  currentBank: number
  onDismiss: () => void
}

export function BonusPanel({ type, rolls, currentBank, onDismiss }: BonusPanelProps) {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{ duration: 0.5 }}
      className={`absolute inset-0 z-10 flex items-center justify-center
        ${type === 'MEGA_BONUS' ? 'bg-yellow-500/30' : 'bg-blue-500/30'}
        backdrop-blur-sm`}
      onClick={onDismiss}
    >
      {/* Add Fireworks */}
      <FireworksEffect type={type} />
      
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="text-center p-8 rounded-lg bg-background/95 shadow-xl border-2 border-opacity-50"
        style={{
          borderColor: type === 'MEGA_BONUS' ? '#eab308' : '#3b82f6'
        }}
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
          className={`text-4xl font-bold mb-6
            ${type === 'MEGA_BONUS' ? 'text-yellow-500' : 'text-blue-500'}`}
        >
          {type === 'MEGA_BONUS' ? '🌟 MEGA BONUS! 🌟' : '✨ MINI BONUS! ✨'}
        </motion.h2>
        <div className="flex gap-6 mb-4">
          {rolls.map((roll, index) => (
            <motion.div
              key={index}
              initial={{ rotateY: 180, opacity: 0, scale: 0 }}
              animate={{ rotateY: 0, opacity: 1, scale: 1 }}
              transition={{ 
                delay: 0.8 + index * 0.5,
                duration: 0.8,
                type: "spring",
                stiffness: 100
              }}
              className={`w-16 h-16 flex items-center justify-center rounded-lg text-2xl font-bold
                ${type === 'MEGA_BONUS' 
                  ? 'bg-yellow-500 shadow-lg shadow-yellow-500/50' 
                  : 'bg-blue-500 shadow-lg shadow-blue-500/50'}
                text-white transform transition-all hover:scale-110`}
            >
              {roll}
            </motion.div>
          ))}
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 + rolls.length * 0.5 + 0.5 }}
          className={`text-lg font-semibold mb-6
            ${type === 'MEGA_BONUS' ? 'text-yellow-500' : 'text-blue-500'}`}
        >
          Total Payout: {currentBank.toFixed(3)} ETH
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 + rolls.length * 0.5 }}
        >
          <Button
            onClick={onDismiss}
            size="lg"
            className={`${
              type === 'MEGA_BONUS'
                ? 'bg-yellow-500 hover:bg-yellow-600'
                : 'bg-blue-500 hover:bg-blue-600'
            } text-white border-none shadow-lg`}
          >
            Continue Playing
          </Button>
          <div className="mt-2 text-xs text-muted-foreground">
            Click anywhere to continue
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  )
} 