import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'

interface CoinProps {
  delay: number
  x: number
}

function Coin({ delay, x }: CoinProps) {
  return (
    <motion.div
      initial={{ y: 0, x, opacity: 0 }}
      animate={{ 
        y: [0, -500],
        opacity: [0, 1, 1, 0],
        rotate: [0, 360]
      }}
      transition={{
        duration: 2,
        delay,
        ease: "easeOut",
        times: [0, 0.1, 0.8, 1]
      }}
      className="absolute bottom-0 text-2xl"
    >
      💰
    </motion.div>
  )
}

interface CashOutEffectProps {
  amount: number
  onDismiss: () => void
}

export function CashOutEffect({ amount, onDismiss }: CashOutEffectProps) {
  // Generate random positions for coins
  const coins = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: (Math.random() - 0.5) * 300, // Spread coins across 300px
    delay: Math.random() * 0.5 // Stagger animation up to 0.5s
  }))

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onDismiss}
      className="absolute inset-0 z-10 flex items-center justify-center bg-green-500/20 backdrop-blur-sm overflow-hidden"
    >
      {/* Coin animations */}
      {coins.map(coin => (
        <Coin key={coin.id} x={coin.x} delay={coin.delay} />
      ))}

      {/* Success message */}
      <motion.div
        initial={{ scale: 0, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ 
          type: "spring",
          delay: 0.2,
          bounce: 0.5
        }}
        onClick={(e) => e.stopPropagation()}
        className="relative z-20 bg-background/95 p-8 rounded-lg shadow-xl border-2 border-green-500/50 text-center"
      >
        <motion.h2
          animate={{ 
            scale: [1, 1.1, 1],
          }}
          transition={{ 
            duration: 1,
            repeat: Infinity,
            repeatType: "reverse"
          }}
          className="text-4xl font-bold mb-4 bg-gradient-to-r from-green-400 to-emerald-600 text-transparent bg-clip-text"
        >
          💰 Cashed Out! 💰
        </motion.h2>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-2xl font-bold mb-6 text-green-500"
        >
          {amount.toFixed(3)} PIG
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <Button
            onClick={onDismiss}
            size="lg"
            className="bg-green-500 hover:bg-green-600 text-white border-none shadow-lg"
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