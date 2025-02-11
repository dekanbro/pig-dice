'use client'

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"

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
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const completedRef = useRef(false)
  
  useEffect(() => {
    if (rolling) {
      completedRef.current = false
    }
  }, [rolling])

  useEffect(() => {
    if (!rolling && value !== null && !completedRef.current) {
      console.log('Setting final face value:', value)
      setCurrentFace(value - 1)
      completedRef.current = true
      onRollComplete()
    }
  }, [value, rolling, onRollComplete])

  useEffect(() => {
    console.log('MegaDice rolling effect:', { rolling, value })

    if (rolling) {
      // Start rolling animation
      intervalRef.current = setInterval(() => {
        setCurrentFace(Math.floor(Math.random() * 6))
      }, 50)

      // Stop rolling after 2 seconds
      const timeoutId = setTimeout(() => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
          intervalRef.current = null
        }
      }, 2000)

      return () => {
        clearInterval(intervalRef.current!)
        clearTimeout(timeoutId)
      }
    }
  }, [rolling])

  return (
    <div className="relative w-full h-full">
      <motion.div 
        className="absolute inset-0 flex items-center justify-center"
        animate={rolling ? {
          scale: [1, 1.2, 0.9, 1.1, 1],
          rotate: [0, 360, 720, 1080, 1440],
          y: [0, -30, 0, -20, 0],
          x: [0, 20, -20, 10, 0]
        } : {
          scale: 1,
          rotate: 0,
          y: 0,
          x: 0
        }}
        transition={rolling ? {
          duration: 2.5,
          times: [0, 0.4, 0.6, 0.8, 1],
          ease: "easeInOut"
        } : {
          duration: 0.5,
          ease: "backOut"
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentFace}
            initial={{ opacity: 0, scale: 0.8, rotateX: -180 }}
            animate={{ opacity: 1, scale: 1, rotateX: 0 }}
            exit={{ opacity: 0, scale: 0.8, rotateX: 180 }}
            transition={{ duration: 0.2 }}
          >
            {diceFaces[Math.max(0, Math.min(5, currentFace))]}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  )
} 