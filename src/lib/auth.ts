import { cookies } from "next/headers";
import { PrivyClient, AuthTokenClaims } from "@privy-io/server-auth";
import { NextRequest } from "next/server";

const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID || "";
const PRIVY_APP_SECRET = process.env.PRIVY_APP_SECRET || "";

interface AuthUser {
  id: string;
  email?: string;
  wallet?: {
    address: string;
  };
}

interface AuthResult {
  isAuthenticated: boolean;
  userId?: string;
}

export const privy = new PrivyClient(PRIVY_APP_ID, PRIVY_APP_SECRET);

export async function getUser(token: string): Promise<AuthUser | null> {
  if (!token) return null;
  try {
    const user = await privy.verifyAuthToken(token);
    return user;
  } catch (error) {
    console.error("Error verifying auth token:", error);
    return null;
  }
}

export async function verifyAuthToken(request: NextRequest): Promise<AuthResult> {
  try {
    const token = request.headers.get("authorization")?.split(" ")[1];
    if (!token) {
      return { isAuthenticated: false };
    }

    const user = await privy.verifyAuthToken(token);
    return { isAuthenticated: true, userId: user.userId };
  } catch (error) {
    console.error("Error verifying auth token:", error);
    return { isAuthenticated: false };
  }
} 