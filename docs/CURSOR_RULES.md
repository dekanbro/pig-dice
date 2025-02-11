# Cursor Development Rules

## TypeScript and Testing Best Practices

### Testing Setup
- Use Vitest with React Testing Library
- Set up custom render utilities for providers
- Mock external dependencies explicitly
- Use proper TypeScript types for all test files

### Test File Structure
```typescript
// 1. Imports
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '../test/utils'
import { ComponentToTest } from './component-to-test'

// 2. Mocks
vi.mock('external-dependency', () => ({
  useHook: vi.fn(),
}))

// 3. Test Suites
describe('ComponentName', () => {
  // 4. Individual Tests
  it('should do something specific', () => {
    // Arrange
    const mockData = {...}
    
    // Act
    render(<ComponentToTest />)
    
    // Assert
    expect(...).toBe(...)
  })
})
```

### TypeScript Testing Guidelines
1. **Mock Types**
   - Use `Partial<Interface>` for partial mocks
   - Type mock functions with `ReturnType<typeof vi.fn>`
   - Import types from source packages

2. **Custom Render Function**
   ```typescript
   function customRender(ui: ReactElement) {
     return testingLibraryRender(
       <Providers>
         {ui}
       </Providers>
     )
   }
   ```

3. **Testing Library Best Practices**
   - Use `screen` queries when possible
   - Prefer role-based queries (`getByRole`)
   - Use proper matchers (`toBeInTheDocument`, `toHaveClass`)

### ESLint Configuration
```json
{
  "extends": "next/core-web-vitals",
  "rules": {
    "react/no-unescaped-entities": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-empty-interface": "off",
    "@typescript-eslint/no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }]
  }
}
```

### Common Patterns
1. **Mocking Hooks**
   ```typescript
   const mockHook = {
     data: mockData,
     isLoading: false,
     error: null,
   }
   vi.mocked(useHook).mockReturnValue(mockHook)
   ```

2. **Testing Async Code**
   ```typescript
   it('should handle async operations', async () => {
     await act(async () => {
       // async operations
     })
     expect(...).toBe(...)
   })
   ```

3. **User Interactions**
   ```typescript
   fireEvent.click(screen.getByRole('button'))
   await userEvent.type(screen.getByRole('textbox'), 'input')
   ```

### Error Prevention
1. Always type test data and mocks
2. Use proper type assertions when necessary
3. Avoid using `any` in test files
4. Handle async operations properly with `act`
5. Clean up mocks after each test

### File Organization
```
src/
  components/
    component-name/
      index.ts
      component-name.tsx
      component-name.test.tsx
  test/
    setup.ts
    utils.tsx
    mocks/
```

### Git Commit Messages
```
fix: resolve typescript and linting errors in tests
feat: add new test utilities
test: improve test coverage for component
```

### Code Cleanliness
1. **Import Management**
   ```typescript
   // Note: Keep imports clean - remove any unused imports to prevent linting errors
   import { UsedComponent } from '@/components'
   import type { UsedType } from '@/types'
   ```
   - Remove unused imports immediately
   - Use type imports when only importing types
   - Group imports by source (internal/external)
   - Add explanatory comments for non-obvious imports

2. **Dead Code Prevention**
   - Remove commented-out code
   - Delete unused functions and variables
   - Remove placeholder implementations
   - Document TODO items properly
   ```typescript
   // ❌ Bad
   // const oldFunction = () => { ... }
   export function unusedFunction() {
     // Implementation pending
     return null
   }

   // ✅ Good
   // TODO: Implement caching strategy - Issue #123
   export function activeFunction() {
     return data
   }
   ```

3. **Code Organization**
   - Keep files focused and single-purpose
   - Extract reusable logic into hooks or utilities
   - Use barrel exports for clean imports
   - Remove redundant code and duplicates
``` 