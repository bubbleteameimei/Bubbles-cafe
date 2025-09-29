
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from '../../App'

// Mock the router
vi.mock('wouter', () => ({
  Route: ({ children }: any) => children,
  Switch: ({ children }: any) => children,
  useLocation: () => ['/'],
}))

// Mock external dependencies
vi.mock('../../lib/queryClient', () => ({
  queryClient: new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  }),
}))

// Mock all the providers and components that might cause issues
vi.mock('../../components/theme-provider', () => ({
  ThemeProvider: ({ children }: any) => children,
}))

vi.mock('../../hooks/use-auth', () => ({
  AuthProvider: ({ children }: any) => children,
}))

vi.mock('../../hooks/use-cookie-consent', () => ({
  CookieConsentProvider: ({ children }: any) => children,
}))

describe('App', () => {
  it('renders without crashing', () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    })

    render(
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    )

    // Just check that the app renders without throwing
    expect(document.body).toBeDefined()
  })
})
