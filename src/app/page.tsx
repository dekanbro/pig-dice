'use client'

import { usePrivy } from '@privy-io/react-auth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { LoginButton } from '@/components/login-button'

export default function HomePage() {
  const { authenticated, ready } = usePrivy()
  const router = useRouter()

  useEffect(() => {
    if (ready && authenticated) {
      router.push('/game')
    }
  }, [ready, authenticated, router])

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center gap-8 px-4">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="flex items-center gap-4">
          <h1 className="text-4xl font-bold">One More Roll</h1>
          <span className="text-4xl">🎲</span>
        </div>
        <p className="max-w-[600px] text-xl text-muted-foreground">
          A decentralized dice game on Base. Connect your wallet to start playing!
        </p>
      </div>
      
      <LoginButton className="text-lg px-8" size="lg" />
      
      <div className="mt-8 grid gap-4 text-center text-sm text-muted-foreground">
        <p>Built with Next.js, Privy, and Base</p>
        <p>Minimum bet: {process.env.NEXT_PUBLIC_MIN_BET} ETH</p>
      </div>
    </div>
  )
}
