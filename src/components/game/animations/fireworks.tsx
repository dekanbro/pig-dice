import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// Add a unique ID generator
let particleId = 0
function getUniqueId() {
  return ++particleId
}

interface FireworkProps {
  color: string
  size?: 'small' | 'medium' | 'large'
  initialX?: number
  initialY?: number
}

export function Firework({ color, size = 'medium', initialX = 0, initialY = 0 }: FireworkProps) {
  const sizeClasses = {
    small: 'w-1 h-1',
    medium: 'w-2 h-2',
    large: 'w-3 h-3'
  }

  const distance = Math.random() * 200 + 100
  const angle = Math.random() * Math.PI * 2
  const finalX = Math.cos(angle) * distance + initialX
  const finalY = Math.sin(angle) * distance + initialY

  return (
    <motion.div
      initial={{ 
        scale: 0,
        opacity: 1,
        x: initialX,
        y: initialY
      }}
      animate={{
        scale: [0, 1, 0.5],
        opacity: [1, 1, 0],
        x: finalX,
        y: finalY
      }}
      transition={{
        duration: 1 + Math.random() * 0.5,
        ease: [0.36, 0, 0.66, -0.56],
      }}
      className={`absolute ${sizeClasses[size]} rounded-full ${color}`}
    />
  )
}

interface FireworkBurstProps {
  color: string
  x: number
  y: number
  burstId: number
}

export function FireworkBurst({ color, x, y, burstId }: FireworkBurstProps) {
  return (
    <>
      {Array.from({ length: 12 }).map((_, i) => (
        <Firework 
          key={`burst-${burstId}-particle-${i}`} 
          color={color} 
          size="medium"
          initialX={x}
          initialY={y}
        />
      ))}
    </>
  )
}

interface FireworksEffectProps {
  type: 'MEGA_BONUS' | 'MINI_BONUS' | 'JACKPOT'
}

export function FireworksEffect({ type }: FireworksEffectProps) {
  const [particles, setParticles] = useState<Array<{ id: number, x: number, y: number }>>([])
  const [bursts, setBursts] = useState<Array<{ id: number, x: number, y: number }>>([])
  
  useEffect(() => {
    // Reset particle ID counter on mount
    particleId = 0
    
    // Initial burst
    const centerBurst = { 
      id: getUniqueId(), 
      x: 0,
      y: 0
    }
    setBursts([centerBurst])

    // Continuous fireworks
    const interval = setInterval(() => {
      const newParticle = {
        id: getUniqueId(),
        x: (Math.random() - 0.5) * (type === 'JACKPOT' ? 800 : 600),
        y: (Math.random() - 0.5) * (type === 'JACKPOT' ? 600 : 400)
      }
      setParticles(prev => [...prev, newParticle])
      
      // Increase burst frequency for jackpot
      if (Math.random() < (type === 'JACKPOT' ? 0.5 : 0.3)) {
        setBursts(prev => [...prev, { 
          id: getUniqueId(), 
          x: (Math.random() - 0.5) * (type === 'JACKPOT' ? 600 : 400),
          y: (Math.random() - 0.5) * (type === 'JACKPOT' ? 500 : 300)
        }])
      }

      // Keep more particles for jackpot
      setParticles(prev => prev.slice(-(type === 'JACKPOT' ? 50 : 30)))
      setBursts(prev => prev.slice(-(type === 'JACKPOT' ? 5 : 3)))
    }, type === 'JACKPOT' ? 50 : 100)

    return () => {
      clearInterval(interval)
      // Reset particle ID counter on cleanup
      particleId = 0
    }
  }, [type])

  let baseColor = 'bg-yellow-500'
  let altColor = 'bg-yellow-300'
  let extraColors: string[] = []

  if (type === 'MINI_BONUS') {
    baseColor = 'bg-blue-500'
    altColor = 'bg-blue-300'
  } else if (type === 'JACKPOT') {
    baseColor = 'bg-purple-500'
    altColor = 'bg-purple-300'
    extraColors = [
      'bg-pink-500',
      'bg-indigo-500',
      'bg-emerald-500',
      'bg-amber-500',
      'bg-rose-500'
    ]
  }

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 flex items-center justify-center">
        <AnimatePresence>
          {/* Regular fireworks */}
          {particles.map((particle) => {
            const colors = type === 'JACKPOT' 
              ? [baseColor, altColor, ...extraColors]
              : [baseColor, altColor]
            const randomColor = colors[Math.floor(Math.random() * colors.length)]
            
            return (
              <Firework 
                key={`particle-${particle.id}`}
                color={randomColor}
                size={Math.random() > (type === 'JACKPOT' ? 0.5 : 0.7) ? 'large' : Math.random() > 0.5 ? 'medium' : 'small'}
                initialX={particle.x}
                initialY={particle.y}
              />
            )
          })}
          {/* Bursts */}
          {bursts.map((burst) => (
            <FireworkBurst 
              key={`burst-${burst.id}`}
              burstId={burst.id}
              color={type === 'JACKPOT' ? extraColors[Math.floor(Math.random() * extraColors.length)] : baseColor}
              x={burst.x}
              y={burst.y}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
} 