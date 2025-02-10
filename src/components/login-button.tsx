'use client'

import { usePrivy } from '@privy-io/react-auth'
import { Button } from '@/components/ui/button'
import { type ButtonProps } from '@/components/ui/button'

interface LoginButtonProps extends Pick<ButtonProps, 'className' | 'size'> {}

export function LoginButton({ className, size = 'sm' }: LoginButtonProps) {
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