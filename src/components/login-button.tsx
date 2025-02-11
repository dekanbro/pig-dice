'use client'

import { Button } from '@/components/ui/button'
import { usePrivy } from '@privy-io/react-auth'
import { type ButtonProps } from '@/components/ui/button'

export function LoginButton({ className, size = 'sm' }: Pick<ButtonProps, 'className' | 'size'>) {
  const { login, logout, authenticated, ready } = usePrivy()

  if (!ready) {
    return null
  }

  return (
    <Button
      onClick={authenticated ? logout : login}
      variant={authenticated ? 'outline' : 'default'}
      className={className}
      size={size}
    >
      {authenticated ? 'Disconnect Wallet' : 'Connect Wallet'}
    </Button>
  )
} 