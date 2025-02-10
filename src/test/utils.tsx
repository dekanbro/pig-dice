import { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider, createConfig } from '@privy-io/wagmi'
import { base } from 'viem/chains'
import { http } from 'wagmi'
import { vi } from 'vitest'

// Mock Privy modules
vi.mock('@privy-io/react-auth', () => ({
  PrivyProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  usePrivy: vi.fn(),
}))

vi.mock('@privy-io/wagmi', () => ({
  WagmiProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  createConfig: vi.fn().mockReturnValue({}),
}))

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
})

function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

function customRender(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) {
  return render(ui, { wrapper: Providers, ...options })
}

export * from '@testing-library/react'
export { customRender as render } 