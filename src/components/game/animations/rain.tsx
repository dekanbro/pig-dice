import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'

// Add a unique ID generator for rain drops
let rainDropId = 0
function getRainDropId() {
  return ++rainDropId
}

interface RainDropProps {
  delay?: number
}

function RainDrop({ delay = 0 }: RainDropProps) {
  const startX = Math.random() * 100 // Random start position
  const speed = 0.6 + Math.random() * 0.4 // Random speed variation
  
  return (
    <motion.div
      initial={{ 
        x: `${startX}vw`,
        y: -20,
        opacity: 0,
        scale: 0
      }}
      animate={{ 
        y: '100vh',
        opacity: [0, 1, 1, 0],
        scale: [0, 1, 1, 0]
      }}
      transition={{
        duration: speed * 2,
        delay: delay,
        ease: "linear",
        times: [0, 0.1, 0.9, 1]
      }}
      className="absolute w-0.5 h-4 bg-blue-400/30 rounded-full"
      style={{
        boxShadow: '0 0 4px rgba(96, 165, 250, 0.5)'
      }}
    />
  )
}

interface BustEffectProps {
  onDismiss: () => void
}

export function BustEffect({ onDismiss }: BustEffectProps) {
  const [raindrops, setRaindrops] = useState<number[]>([])
  
  useEffect(() => {
    // Reset raindrop counter
    rainDropId = 0
    
    // Create initial raindrops
    setRaindrops(Array.from({ length: 20 }, () => getRainDropId()))
    
    // Add more raindrops over time
    const interval = setInterval(() => {
      setRaindrops(prev => [...prev, getRainDropId()].slice(-50))
    }, 200)

    return () => {
      clearInterval(interval)
      rainDropId = 0
    }
  }, [])

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-blue-900/20 backdrop-blur-sm" />
      {raindrops.map((id) => (
        <RainDrop key={id} delay={Math.random() * 0.5} />
      ))}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="text-center p-8 rounded-lg bg-background/95 shadow-xl border-2 border-blue-500/20"
        >
          <motion.div
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [-2, 2, -2]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
            }}
            className="text-6xl mb-4"
          >
            😢
          </motion.div>
          <h2 className="text-4xl font-bold text-blue-500 mb-4">BUST!</h2>
          <p className="text-lg text-muted-foreground mb-6">
            Better luck next time...
          </p>
          <Button
            onClick={onDismiss}
            size="lg"
            className="bg-blue-500 hover:bg-blue-600 text-white border-none shadow-lg"
          >
            Try Again
          </Button>
        </motion.div>
      </div>
    </div>
  )
} 