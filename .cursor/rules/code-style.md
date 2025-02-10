# Code Style Rules

## TypeScript & React Guidelines

1. Component Structure:
```typescript
// Imports order
import { type FC } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

// Types/Interfaces
interface Props {
  // Props with descriptions
}

// Component declaration
export const ComponentName: FC<Props> = ({ prop1, prop2 }) => {
  // Implementation
}
```

2. File Organization:
- One component per file
- Export component as named export
- Group related components in feature folders
- Keep utils and types in separate files

3. React Patterns:
- Use functional components
- Prefer Server Components unless client interactivity needed
- Use composition over inheritance
- Keep components small and focused

4. TypeScript Usage:
- Use interfaces over types for objects
- Use type for unions and primitives
- Avoid `any`, use proper typing
- Use generics when appropriate

5. State Management:
- Use React Server Components where possible
- Prefer URL state with `nuqs` for shareable state
- Use `useState` only for local UI state
- Keep state as close to usage as possible

6. Styling:
- Use Tailwind CSS with consistent patterns
- Follow mobile-first approach
- Use Shadcn UI components when available
- Use CSS variables for theming

7. Performance:
- Lazy load non-critical components
- Use proper keys in lists
- Memoize expensive calculations
- Optimize images and assets

## API & Backend Rules

1. API Routes:
- Use Next.js App Router conventions
- Implement proper error handling
- Validate inputs with Zod
- Return consistent response format

2. Error Handling:
```typescript
try {
  // Operation
} catch (error) {
  if (error instanceof CustomError) {
    // Handle specific error
  }
  // Log and return appropriate error
}
```

3. Data Fetching:
- Use React Server Components
- Implement proper caching
- Handle loading and error states
- Use TypeScript for response types

## Web3 Integration Rules

1. Wallet Connection:
- Use Privy for authentication
- Handle connection states properly
- Implement proper error handling
- Support multiple chains

2. Contract Interaction:
- Use type-safe contract calls
- Implement proper error handling
- Show loading states during transactions
- Handle transaction failures gracefully 