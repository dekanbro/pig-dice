'use client'

import { usePrivy } from '@privy-io/react-auth'
import { LoginButton } from '@/components/login-button'
import { ThemeToggle } from '@/components/theme-toggle'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { setCookie } from 'cookies-next'

export function Header() {
  const { authenticated, user, getAccessToken } = usePrivy()
  const router = useRouter()

  const handleGameClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    if (!authenticated) return

    try {
      const token = await getAccessToken()
      if (!token) return

      // Store the token in a cookie
      setCookie('privy-token', token, {
        maxAge: 60 * 60 * 24, // 24 hours
        path: '/',
        secure: true,
        sameSite: 'strict'
      })
      
      router.push('/game')
    } catch (error) {
      console.error('Navigation error:', error)
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-3">
        <div className="flex h-14 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold">One More Roll</span>
            <span className="text-2xl">🎲</span>
          </Link>

          {/* Navigation */}
          <div className="flex items-center gap-6">
            {authenticated && (
              <button 
                onClick={handleGameClick}
                className="text-sm font-medium hover:text-primary"
              >
                Play Game
              </button>
            )}
            
            {/* Auth/Wallet Section */}
            <div className="flex items-center gap-4">
              <ThemeToggle />
              {authenticated && user?.wallet && (
                <div className="hidden md:block text-sm text-muted-foreground font-mono">
                  {user.wallet.address.slice(0, 6)}...{user.wallet.address.slice(-4)}
                </div>
              )}
              <LoginButton />
            </div>
          </div>
        </div>
      </div>
    </header>
  )
} 