# Authentication System

## Overview

One More Roll uses Privy for authentication and wallet management. The system implements a token-based authentication flow with middleware protection for game routes.

## Setup

1. Environment Variables
```env
NEXT_PUBLIC_PRIVY_APP_ID="your-privy-app-id"
PRIVY_APP_SECRET="your-privy-secret"
```

2. Required Dependencies
```json
{
  "@privy-io/react-auth": "^2.4.2",
  "@privy-io/server-auth": "^1.18.7",
  "@privy-io/wagmi": "^1.0.3"
}
```

## Authentication Flow

1. **Client-Side Login**
   - User clicks "Connect Wallet"
   - Privy modal opens for wallet selection
   - On successful connection, token is stored in cookie

2. **Route Protection**
   - Middleware checks for `privy-token` cookie
   - Unauthenticated users are redirected to home
   - Protected routes: `/game/*`, `/api/game/*`

3. **API Authentication**
   - API routes verify token using `verifyAuthToken`
   - Invalid tokens return 401 Unauthorized
   - Valid tokens include userId in responses

## Code Examples

### Protected API Route
```typescript
export async function POST(request: NextRequest) {
  try {
    const { userId } = await verifyAuthToken(request)
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      )
    }
    // ... route logic
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    )
  }
}
```

### Client-Side Auth Check
```typescript
function ProtectedComponent() {
  const { authenticated, user } = usePrivy()
  
  if (!authenticated) {
    return <LoginPrompt />
  }
  
  return <YourComponent />
}
```

## Security Considerations

1. **Token Storage**
   - Tokens stored in HTTP-only cookies
   - Secure and SameSite flags enabled
   - 24-hour expiration

2. **Route Protection**
   - All game routes protected by middleware
   - API routes require valid tokens
   - Invalid tokens are cleared automatically

3. **Error Handling**
   - Failed auth redirects to home
   - API errors return appropriate status codes
   - Detailed error logging for debugging

## Testing

1. **Authentication Tests**
   - Token validation
   - Route protection
   - API authentication

2. **Integration Tests**
   - Login flow
   - Protected route access
   - API access with tokens

## Troubleshooting

1. **Invalid Token Errors**
   - Check token expiration
   - Verify Privy configuration
   - Clear cookies and reconnect wallet

2. **Route Access Issues**
   - Confirm middleware configuration
   - Check token presence in cookies
   - Verify protected route patterns 