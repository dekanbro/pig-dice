# Testing Rules

## Test Structure

1. Test File Organization:
```typescript
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ComponentName } from './ComponentName'

describe('ComponentName', () => {
  it('should render successfully', () => {
    // Arrange
    const props = {}
    
    // Act
    render(<ComponentName {...props} />)
    
    // Assert
    expect(screen.getByRole('button')).toBeInTheDocument()
  })
})
```

2. Test Coverage Requirements:
- Minimum 80% coverage for all files
- 100% coverage for critical game logic
- 100% coverage for smart contract functions
- Test all error conditions

3. Testing Patterns:
- Use Arrange-Act-Assert pattern
- Test component rendering
- Test user interactions
- Test error states
- Test loading states

4. Component Testing:
- Test props handling
- Test user interactions
- Test accessibility
- Test responsive behavior

5. Game Logic Testing:
- Test all game rules
- Test edge cases
- Test random number generation
- Test win/lose conditions

6. Contract Testing:
- Test all contract functions
- Test access control
- Test fund management
- Test error conditions

7. API Testing:
- Test successful responses
- Test error handling
- Test input validation
- Test rate limiting

## Test Types

1. Unit Tests:
- Test individual components
- Test utility functions
- Test game logic
- Mock external dependencies

2. Integration Tests:
- Test component interactions
- Test API integrations
- Test contract interactions
- Test authentication flow

3. E2E Tests:
- Test complete user flows
- Test game rounds
- Test wallet connection
- Test transactions

## Mocking Guidelines

1. API Mocks:
```typescript
vi.mock('api', () => ({
  fetchData: vi.fn().mockResolvedValue({ data: 'mocked' })
}))
```

2. Web3 Mocks:
```typescript
vi.mock('@privy-io/react-auth', () => ({
  usePrivy: vi.fn().mockReturnValue({
    user: mockUser,
    login: vi.fn(),
    logout: vi.fn()
  })
}))
```

3. Contract Mocks:
```typescript
vi.mock('viem', () => ({
  createPublicClient: vi.fn().mockReturnValue({
    readContract: vi.fn().mockResolvedValue('0x')
  })
}))
```

## Test Environment

1. Setup:
- Use Vitest for unit/integration tests
- Use Playwright for E2E tests
- Use testing-library for component tests
- Use MSW for API mocking

2. CI Integration:
- Run tests on every PR
- Block merging if tests fail
- Generate coverage reports
- Run E2E tests on staging 