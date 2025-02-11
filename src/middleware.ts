import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyAuthToken } from "./lib/auth";

export async function middleware(request: NextRequest) {
  // Only protect /api/game routes
  if (request.nextUrl.pathname.startsWith("/api/game")) {
    const authResult = await verifyAuthToken(request);
    if (!authResult.isAuthenticated) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/api/game/:path*"],
}; 