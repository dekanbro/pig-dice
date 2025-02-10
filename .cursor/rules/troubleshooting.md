# Troubleshooting Rules

## Common Issues & Solutions

1. Package Manager Issues:
- Use `pnpm` as the primary package manager
- For shadcn-ui installation, use manual setup instead of CLI:
  ```bash
  # Instead of using CLI tools that may fail
  1. Create components.json
  2. Set up tailwind.config.ts
  3. Configure globals.css
  4. Add utils.ts
  ```

2. Git Commit Issues:
- Avoid newlines in commit commands
- Use `-m` flag multiple times for multi-line messages:
  ```bash
  # Correct way to make multi-line commits
  git commit -m "type(scope): subject" -m "- Point 1\n- Point 2\n- Point 3"
  ```

3. Next.js Configuration:
- Always use TypeScript for configuration files
- Use `next.config.ts` instead of `next.config.js`
- Standard configuration template:
  ```typescript
  import type { NextConfig } from "next"
  
  const nextConfig: NextConfig = {
    reactStrictMode: true,
    typescript: {
      ignoreBuildErrors: false,
    },
    eslint: {
      ignoreDuringBuilds: false,
    },
  }
  
  export default nextConfig
  ```
- Delete any duplicate configuration files (e.g., `next.config.js`)
- Keep configuration type-safe and consistent with the project's TypeScript-first approach

4. Interactive CLI Issues:
- Avoid tools that require interactive prompts
- Use non-interactive alternatives with flags:
  ```bash
  # Instead of interactive prompts
  command --flag1 value1 --flag2 value2 --yes
  ```

5. Next.js Project Creation:
- Use non-interactive flags:
  ```bash
  pnpm create next-app . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-pnpm --turbo --yes
  ```

6. Next.js App Router and Client Components:
- Keep route segments (layout.tsx, page.tsx, template.tsx) as server components by default
- Never export metadata from client components
- Move client-side logic to separate components under src/components/
- Standard route segment structure:
  ```typescript
  // layout.tsx or page.tsx (Server Component)
  import { ClientComponent } from "@/components/client-component"
  
  export const metadata = {
    // ... metadata here
  }
  
  export default function Layout({ children }) {
    return (
      <ClientComponent>
        {children}
      </ClientComponent>
    )
  }
  ```
- Common 'use client' locations:
  - Interactive UI components
  - Components using hooks
  - Components using browser APIs
  - Event handlers
- Never use 'use client' in:
  - Route segments (layout, page, template)
  - API routes
  - Server-only utilities
  - Components that don't need interactivity

7. Shadcn UI Component Usage:
- Never modify copied shadcn component files directly
- Keep original components in `src/components/ui` untouched
- Install required dependencies for each component:
  ```bash
  # Common dependencies needed for shadcn components:
  pnpm add @radix-ui/react-slot          # For Button
  pnpm add @radix-ui/react-dialog        # For Dialog
  pnpm add @radix-ui/react-dropdown-menu # For DropdownMenu
  pnpm add @radix-ui/react-tooltip       # For Tooltip
  # etc... Install only what you need for the components you're using
  ```
- Check component documentation for required dependencies
- Install dependencies before copying component files
- Extend components through composition:
  ```typescript
  // ❌ Don't modify src/components/ui/button.tsx
  
  // ✅ Do create wrapper components
  // src/components/custom/my-button.tsx
  import { Button } from "@/components/ui/button"
  
  export function MyButton({ children, ...props }) {
    return (
      <Button {...props} className="custom-styles">
        {children}
      </Button>
    )
  }
  ```
- Installation process:
  1. Copy component files to `src/components/ui`
  2. Never edit these files
  3. Create custom components in separate directories
  4. Use composition to extend functionality

8. Next.js API Routes:
- Place API routes in `src/app/api` directory
- Use the `route.ts` naming convention
- Standard API route structure:
  ```typescript
  // src/app/api/[endpoint]/route.ts
  import { NextRequest, NextResponse } from "next/server"
  
  export async function GET(request: NextRequest) {
    // Handle GET requests
  }
  
  export async function POST(request: NextRequest) {
    try {
      const body = await request.json()
      
      return NextResponse.json({
        success: true,
        data: { /* response data */ }
      })
    } catch (error) {
      return NextResponse.json(
        { success: false, error: "Error message" },
        { status: 500 }
      )
    }
  }
  ```
- Always include error handling
- Use proper HTTP status codes
- Validate request data
- Follow REST conventions for endpoints
- Keep route handlers small and focused

9. Privy Authentication:
- Install required packages:
  ```bash
  pnpm add @privy-io/react-auth    # Client-side auth
  pnpm add @privy-io/server-auth   # Server-side auth
  ```
- Standard auth verification setup:
  ```typescript
  // src/lib/auth.ts
  import { PrivyClient } from "@privy-io/server-auth"
  
  const privy = new PrivyClient(
    process.env.PRIVY_APP_ID!,
    process.env.PRIVY_APP_SECRET!
  )
  
  export async function verifyAuthToken(request: NextRequest) {
    const authHeader = request.headers.get("authorization")
    if (!authHeader?.startsWith("Bearer ")) {
      throw new Error("Missing or invalid authorization header")
    }
    const token = authHeader.split(" ")[1]
    return await privy.verifyAuthToken(token)
  }
  ```
- Required environment variables:
  ```env
  NEXT_PUBLIC_PRIVY_APP_ID=your_app_id
  PRIVY_APP_SECRET=your_app_secret
  ```
- Client-side auth pattern:
  ```typescript
  const { login, user, authenticated } = usePrivy()
  
  // Send auth token in requests
  const response = await fetch("/api/endpoint", {
    headers: {
      Authorization: `Bearer ${user.id}`,
    },
  })
  ```
- Always verify auth in API routes
- Handle auth errors consistently
- Use AuthCheck component for protected routes

10. Next.js Middleware Authentication:
- Create middleware in root `src/middleware.ts`:
  ```typescript
  // src/middleware.ts
  import { NextResponse } from "next/server"
  import type { NextRequest } from "next/server"
  
  // Define protected and public paths
  const PROTECTED_PATHS = ["/protected", "/api/protected"]
  const PUBLIC_PATHS = ["/", "/api/auth"]
  
  // Must be default export
  export default async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl
    
    // Skip middleware for non-protected paths
    const isProtectedPath = PROTECTED_PATHS.some(
      path => pathname.startsWith(path)
    )
    if (!isProtectedPath) return NextResponse.next()
    
    try {
      // Verify auth
      await verifyAuthToken(request)
      return NextResponse.next()
    } catch (error) {
      // Handle API routes
      if (pathname.startsWith("/api/")) {
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 401 }
        )
      }
      // Redirect other routes
      return NextResponse.redirect(new URL("/", request.url))
    }
  }
  
  export const config = {
    matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
  }
  ```
- Middleware requirements:
  - Must be default export
  - Must be in root `src/middleware.ts`
  - Must return NextResponse
  - Can export config object for matchers
- Middleware best practices:
  - Define protected paths explicitly
  - Handle API and page routes differently
  - Skip static files and public paths
  - Use consistent auth verification
  - Return appropriate responses (401 for API, redirect for pages)
- Common middleware patterns:
  - Auth protection
  - Rate limiting
  - Request logging
  - Header manipulation
  - Redirects and rewrites

## Best Practices

1. Installation Order:
- Initialize Git first
- Create project structure
- Install dependencies
- Configure tooling
- Make initial commit

2. Configuration Files:
- Create configuration files manually when CLI tools fail
- Keep configuration in version control
- Document configuration changes
- Always use TypeScript for configuration when possible
- Avoid duplicate configuration files

3. Error Recovery:
- Document errors in this file
- Add solutions as they are discovered
- Update related configuration files

## Project-Specific Solutions

1. Shadcn UI Setup:
- Manual installation process:
  1. Create `components.json`
  2. Set up `tailwind.config.ts`
  3. Configure `globals.css`
  4. Add `utils.ts`
  5. Install components manually

2. Development Environment:
- Use `.env.local` for local environment
- Document required environment variables
- Keep sensitive values out of version control

## Rule Maintenance

1. When to Update Rules:
- Immediately document any encountered issues and their solutions
- Add new rules when discovering configuration inconsistencies
- Update existing rules when finding better solutions
- Document any mistakes that caused time loss or confusion

2. Rule Update Process:
- Add the issue under the appropriate section
- Include clear steps to reproduce and solve
- Add code examples when relevant
- If creating a new category, maintain consistent formatting

3. Common Scenarios to Document:
- Configuration file inconsistencies (like duplicate config files)
- Build or runtime errors
- Development environment issues
- Tooling conflicts
- Best practices violations 