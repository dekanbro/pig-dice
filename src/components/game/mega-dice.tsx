'use client'

import { useState, useEffect } from "react"

interface MegaDiceProps {
  rolling: boolean
  value: number | null
  onRollComplete: () => void
}

const diceFaces = [
  // Dice 1: Center dot
  <svg key="1" viewBox="0 0 100 100" className="w-full h-full drop-shadow-xl">
    <rect x="5" y="5" width="90" height="90" rx="15" className="fill-primary stroke-primary dark:fill-white dark:stroke-white" strokeWidth="2" />
    <circle cx="50" cy="50" r="10" className="fill-white dark:fill-background" />
  </svg>,
  // Dice 2: Top right and bottom left dots
  <svg key="2" viewBox="0 0 100 100" className="w-full h-full drop-shadow-xl">
    <rect x="5" y="5" width="90" height="90" rx="15" className="fill-primary stroke-primary dark:fill-white dark:stroke-white" strokeWidth="2" />
    <circle cx="30" cy="30" r="10" className="fill-white dark:fill-background" />
    <circle cx="70" cy="70" r="10" className="fill-white dark:fill-background" />
  </svg>,
  // Dice 3: Diagonal dots plus center
  <svg key="3" viewBox="0 0 100 100" className="w-full h-full drop-shadow-xl">
    <rect x="5" y="5" width="90" height="90" rx="15" className="fill-primary stroke-primary dark:fill-white dark:stroke-white" strokeWidth="2" />
    <circle cx="30" cy="30" r="10" className="fill-white dark:fill-background" />
    <circle cx="50" cy="50" r="10" className="fill-white dark:fill-background" />
    <circle cx="70" cy="70" r="10" className="fill-white dark:fill-background" />
  </svg>,
  // Dice 4: Four corners
  <svg key="4" viewBox="0 0 100 100" className="w-full h-full drop-shadow-xl">
    <rect x="5" y="5" width="90" height="90" rx="15" className="fill-primary stroke-primary dark:fill-white dark:stroke-white" strokeWidth="2" />
    <circle cx="30" cy="30" r="10" className="fill-white dark:fill-background" />
    <circle cx="70" cy="30" r="10" className="fill-white dark:fill-background" />
    <circle cx="30" cy="70" r="10" className="fill-white dark:fill-background" />
    <circle cx="70" cy="70" r="10" className="fill-white dark:fill-background" />
  </svg>,
  // Dice 5: Four corners plus center
  <svg key="5" viewBox="0 0 100 100" className="w-full h-full drop-shadow-xl">
    <rect x="5" y="5" width="90" height="90" rx="15" className="fill-primary stroke-primary dark:fill-white dark:stroke-white" strokeWidth="2" />
    <circle cx="30" cy="30" r="10" className="fill-white dark:fill-background" />
    <circle cx="70" cy="30" r="10" className="fill-white dark:fill-background" />
    <circle cx="50" cy="50" r="10" className="fill-white dark:fill-background" />
    <circle cx="30" cy="70" r="10" className="fill-white dark:fill-background" />
    <circle cx="70" cy="70" r="10" className="fill-white dark:fill-background" />
  </svg>,
  // Dice 6: Six dots
  <svg key="6" viewBox="0 0 100 100" className="w-full h-full drop-shadow-xl">
    <rect x="5" y="5" width="90" height="90" rx="15" className="fill-primary stroke-primary dark:fill-white dark:stroke-white" strokeWidth="2" />
    <circle cx="30" cy="30" r="10" className="fill-white dark:fill-background" />
    <circle cx="70" cy="30" r="10" className="fill-white dark:fill-background" />
    <circle cx="30" cy="50" r="10" className="fill-white dark:fill-background" />
    <circle cx="70" cy="50" r="10" className="fill-white dark:fill-background" />
    <circle cx="30" cy="70" r="10" className="fill-white dark:fill-background" />
    <circle cx="70" cy="70" r="10" className="fill-white dark:fill-background" />
  </svg>,
]

export function MegaDice({ rolling, value, onRollComplete }: MegaDiceProps) {
  const [currentFace, setCurrentFace] = useState(0)

  useEffect(() => {
    if (rolling) {
      const interval = setInterval(() => {
        setCurrentFace((prev) => (prev + 1) % 6)
      }, 100)

      setTimeout(() => {
        clearInterval(interval)
        if (value !== null) {
          setCurrentFace(value - 1)
        }
        onRollComplete()
      }, 2000)

      return () => clearInterval(interval)
    }
  }, [rolling, value, onRollComplete])

  return (
    <div className={`w-full h-full transition-transform duration-100 ${rolling ? "animate-bounce" : ""}`}>
      <div className="w-full h-full">{diceFaces[currentFace]}</div>
    </div>
  )
} 