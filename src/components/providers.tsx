'use client'

import { type ReactNode } from 'react'
import { PrivyProvider } from '@privy-io/react-auth'
import { createConfig, WagmiProvider } from '@privy-io/wagmi'
import { base, baseGoerli } from 'viem/chains'
import { http } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from '@/components/theme-provider'

// Configure Wagmi with Privy's createConfig
const config = createConfig({
  chains: [base, baseGoerli],
  transports: {
    [base.id]: http(),
    [baseGoerli.id]: http(),
  },
})

// Create a client
const queryClient = new QueryClient()

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="one-more-roll-theme">
      <PrivyProvider
        appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID!}
        config={{
          loginMethods: ['email', 'wallet'],
          appearance: {
            theme: 'dark',
            accentColor: '#F5A524',
            showWalletLoginFirst: true,
          },
          embeddedWallets: {
            createOnLogin: 'users-without-wallets',
          },
          defaultChain: base,
          supportedChains: [base, baseGoerli],
        }}
      >
        <QueryClientProvider client={queryClient}>
          <WagmiProvider config={config}>
            {children}
          </WagmiProvider>
        </QueryClientProvider>
      </PrivyProvider>
    </ThemeProvider>
  )
} 