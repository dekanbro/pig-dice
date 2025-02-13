'use client'

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"

const TOTAL_DURATION = 1500 // 1.5 seconds total
const PHASE_DURATIONS = {
  fast: 600,    // 0.6 seconds
  medium: 400,  // 0.4 seconds
  slow: 300,    // 0.3 seconds
  final: 200    // 0.2 seconds
}

interface MegaDiceProps {
  rolling: boolean
  value: number | null
  onRollComplete: () => void
}

const diceFaces = [
  // Dice 1: Center dot
  <svg key="1" viewBox="0 0 100 100" className="w-full h-full">
    <rect x="5" y="5" width="90" height="90" rx="15" className="fill-white dark:fill-slate-900 stroke-primary" strokeWidth="2" />
    <circle cx="50" cy="50" r="10" className="fill-primary dark:fill-white" />
  </svg>,
  // Dice 2: Top right and bottom left dots
  <svg key="2" viewBox="0 0 100 100" className="w-full h-full">
    <rect x="5" y="5" width="90" height="90" rx="15" className="fill-white dark:fill-slate-900 stroke-primary" strokeWidth="2" />
    <circle cx="30" cy="30" r="10" className="fill-primary dark:fill-white" />
    <circle cx="70" cy="70" r="10" className="fill-primary dark:fill-white" />
  </svg>,
  // Dice 3: Diagonal dots plus center
  <svg key="3" viewBox="0 0 100 100" className="w-full h-full">
    <rect x="5" y="5" width="90" height="90" rx="15" className="fill-white dark:fill-slate-900 stroke-primary" strokeWidth="2" />
    <circle cx="30" cy="30" r="10" className="fill-primary dark:fill-white" />
    <circle cx="50" cy="50" r="10" className="fill-primary dark:fill-white" />
    <circle cx="70" cy="70" r="10" className="fill-primary dark:fill-white" />
  </svg>,
  // Dice 4: Four corners
  <svg key="4" viewBox="0 0 100 100" className="w-full h-full">
    <rect x="5" y="5" width="90" height="90" rx="15" className="fill-white dark:fill-slate-900 stroke-primary" strokeWidth="2" />
    <circle cx="30" cy="30" r="10" className="fill-primary dark:fill-white" />
    <circle cx="70" cy="30" r="10" className="fill-primary dark:fill-white" />
    <circle cx="30" cy="70" r="10" className="fill-primary dark:fill-white" />
    <circle cx="70" cy="70" r="10" className="fill-primary dark:fill-white" />
  </svg>,
  // Dice 5: Four corners plus center
  <svg key="5" viewBox="0 0 100 100" className="w-full h-full">
    <rect x="5" y="5" width="90" height="90" rx="15" className="fill-white dark:fill-slate-900 stroke-primary" strokeWidth="2" />
    <circle cx="30" cy="30" r="10" className="fill-primary dark:fill-white" />
    <circle cx="70" cy="30" r="10" className="fill-primary dark:fill-white" />
    <circle cx="50" cy="50" r="10" className="fill-primary dark:fill-white" />
    <circle cx="30" cy="70" r="10" className="fill-primary dark:fill-white" />
    <circle cx="70" cy="70" r="10" className="fill-primary dark:fill-white" />
  </svg>,
  // Dice 6: Six dots
  <svg key="6" viewBox="0 0 100 100" className="w-full h-full">
    <rect x="5" y="5" width="90" height="90" rx="15" className="fill-white dark:fill-slate-900 stroke-primary" strokeWidth="2" />
    <circle cx="30" cy="30" r="10" className="fill-primary dark:fill-white" />
    <circle cx="70" cy="30" r="10" className="fill-primary dark:fill-white" />
    <circle cx="30" cy="50" r="10" className="fill-primary dark:fill-white" />
    <circle cx="70" cy="50" r="10" className="fill-primary dark:fill-white" />
    <circle cx="30" cy="70" r="10" className="fill-primary dark:fill-white" />
    <circle cx="70" cy="70" r="10" className="fill-primary dark:fill-white" />
  </svg>,
]

export function MegaDice({ rolling, value, onRollComplete }: MegaDiceProps) {
  const [currentFace, setCurrentFace] = useState(() => value !== null ? value - 1 : 0)
  const [rollPhase, setRollPhase] = useState<'fast' | 'medium' | 'slow' | 'final'>('fast')
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const startTimeRef = useRef<number>(0)
  const completedRef = useRef(false)

  // Reset and start animation
  useEffect(() => {
    if (rolling) {
      // Reset state
      completedRef.current = false
      startTimeRef.current = Date.now()
      setRollPhase('fast')
      console.log('Roll animation started at:', new Date().toISOString(), {
        startTime: startTimeRef.current,
        totalDuration: TOTAL_DURATION,
        phases: PHASE_DURATIONS
      })

      // Clear any existing timer
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }

      // Start the animation loop with a fixed interval
      const INTERVAL = 50 // 50ms update interval
      timerRef.current = setInterval(() => {
        const elapsed = Date.now() - startTimeRef.current
        const remainingTime = TOTAL_DURATION - elapsed

        // Update face more frequently during faster phases
        const shouldUpdateFace = elapsed < PHASE_DURATIONS.fast + PHASE_DURATIONS.medium + PHASE_DURATIONS.slow

        if (shouldUpdateFace) {
          setCurrentFace(Math.floor(Math.random() * 6))
        }

        // Determine current phase based on elapsed time
        if (elapsed < PHASE_DURATIONS.fast) {
          setRollPhase(current => {
            if (current !== 'fast') {
              console.log('Entering FAST phase at:', elapsed, 'ms')
              return 'fast'
            }
            return current
          })
        } else if (elapsed < PHASE_DURATIONS.fast + PHASE_DURATIONS.medium) {
          setRollPhase(current => {
            if (current !== 'medium') {
              console.log('Entering MEDIUM phase at:', elapsed, 'ms')
              return 'medium'
            }
            return current
          })
        } else if (elapsed < PHASE_DURATIONS.fast + PHASE_DURATIONS.medium + PHASE_DURATIONS.slow) {
          setRollPhase(current => {
            if (current !== 'slow') {
              console.log('Entering SLOW phase at:', elapsed, 'ms')
              return 'slow'
            }
            return current
          })
        } else if (elapsed < TOTAL_DURATION) {
          setRollPhase(current => {
            if (current !== 'final') {
              console.log('Entering FINAL phase at:', elapsed, 'ms')
              return 'final'
            }
            return current
          })
          // Stop changing faces during final phase
          if (value !== null) {
            setCurrentFace(value - 1)
          }
        } else {
          // Animation complete
          console.log('Animation interval complete at:', elapsed, 'ms')
          if (timerRef.current) {
            clearInterval(timerRef.current)
          }
        }

        // Log every second for debugging
        if (elapsed % 1000 < INTERVAL) {
          console.log('Animation progress:', {
            elapsed,
            remainingTime,
            phase: rollPhase,
            currentFace: value !== null ? value : 'random'
          })
        }
      }, INTERVAL)

      // Cleanup function
      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current)
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rolling, value])

  // Handle final value and completion
  useEffect(() => {
    if (rolling && value !== null && !completedRef.current) {
      setCurrentFace(value - 1)
      completedRef.current = true
      
      // Calculate exact remaining time
      const elapsed = Date.now() - startTimeRef.current
      const remainingTime = Math.max(TOTAL_DURATION - elapsed, 0)
      
      console.log('Preparing roll completion:', {
        elapsed,
        remainingTime,
        value,
        shouldComplete: !completedRef.current
      })
      
      // Schedule completion callback
      const timeoutId = setTimeout(() => {
        console.log('Executing scheduled roll completion')
        onRollComplete()
      }, remainingTime)

      // Cleanup timeout if component unmounts
      return () => clearTimeout(timeoutId)
    }
  }, [value, rolling, onRollComplete])

  // Reset completion state when rolling starts
  useEffect(() => {
    if (rolling) {
      completedRef.current = false
    }
  }, [rolling])

  // Get animation parameters based on roll phase
  const getAnimationParams = () => {
    if (!rolling) return {
      scale: 1,
      rotate: 0,
      y: 0,
      x: 0
    }

    switch (rollPhase) {
      case 'fast':
        return {
          scale: [1, 1.3, 0.8, 1.2, 0.9],
          rotate: [0, 360, 720, 1080, 1440],
          y: [0, -50, 0, -30, 0],
          x: [0, 30, -30, 15, 0]
        }
      case 'medium':
        return {
          scale: [0.9, 1.2, 0.85, 1.1, 0.95],
          rotate: [0, 180, 360, 540, 720],
          y: [0, -30, 0, -20, 0],
          x: [0, 20, -20, 10, 0]
        }
      case 'slow':
        return {
          scale: [0.95, 1.1, 0.9, 1.05, 1],
          rotate: [0, 90, 180, 270, 360],
          y: [0, -20, 0, -10, 0],
          x: [0, 10, -10, 5, 0]
        }
      case 'final':
        return {
          scale: [1, 1.4, 1],
          rotate: [0, 360, 0],
          y: [0, -20, 0],
          x: [0, 0, 0]
        }
    }
  }

  // Get animation timing based on roll phase
  const getAnimationTiming = () => {
    if (!rolling) return {
      duration: 0.2,
      ease: "backOut"
    }

    switch (rollPhase) {
      case 'fast':
        return {
          duration: 0.6,
          times: [0, 0.25, 0.5, 0.75, 1],
          ease: "linear",
          repeat: 1
        }
      case 'medium':
        return {
          duration: 0.4,
          times: [0, 0.25, 0.5, 0.75, 1],
          ease: "easeInOut",
          repeat: 1
        }
      case 'slow':
        return {
          duration: 0.3,
          times: [0, 0.25, 0.5, 0.75, 1],
          ease: "easeInOut",
          repeat: 1
        }
      case 'final':
        return {
          duration: 0.2,
          times: [0, 0.5, 1],
          ease: [0.19, 1, 0.22, 1]
        }
    }
  }

  return (
    <div className="relative w-full h-full">
      {/* Add glow effect during rolling */}
      {rolling && (
        <motion.div 
          className="absolute inset-0 bg-primary/20 rounded-full blur-xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 0.8, 0.5]
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      )}
      
      <motion.div 
        className="absolute inset-0 flex items-center justify-center"
        animate={getAnimationParams()}
        transition={getAnimationTiming()}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentFace}
            initial={{ opacity: 0, scale: 0.8, rotateX: -180 }}
            animate={{ 
              opacity: 1, 
              scale: 1, 
              rotateX: 0,
              filter: rolling ? "brightness(1.2) contrast(1.1)" : "none"
            }}
            exit={{ opacity: 0, scale: 0.8, rotateX: 180 }}
            transition={{ 
              duration: rolling ? 0.1 : 0.3,
              ease: rolling ? "linear" : "backOut"
            }}
          >
            {diceFaces[Math.max(0, Math.min(5, currentFace))]}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  )
} 