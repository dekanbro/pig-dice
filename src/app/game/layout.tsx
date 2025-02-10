import { type ReactNode } from 'react'

export default function GameLayout({ children }: { children: ReactNode }) {
  return (
    <div className="container mx-auto px-4 py-8">
      {children}
    </div>
  )
} 