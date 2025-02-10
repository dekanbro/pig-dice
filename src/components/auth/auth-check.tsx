'use client'

import { ReactNode } from 'react'
import { usePrivy } from '@privy-io/react-auth'
import { Button } from '@/components/ui/button'

interface AuthCheckProps {
  children: ReactNode
}

export function AuthCheck({ children }: AuthCheckProps) {
  const { login, authenticated, ready } = usePrivy()

  if (!ready) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    )
  }

  if (!authenticated) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
        <h2 className="text-2xl font-bold">Connect Wallet to Play</h2>
        <Button onClick={login} size="lg">
          Connect Wallet
        </Button>
      </div>
    )
  }

  return <>{children}</>
} 