import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { validateSessionToken } from "@/lib/auth";

// Routes that require authentication
const PROTECTED_PREFIXES = ["/dashboard", "/train", "/generate", "/history", "/editor"];
// API routes that require authentication
const PROTECTED_API_PREFIXES = ["/api/tone", "/api/drafts", "/api/generate"];
// Routes that should redirect to dashboard if already logged in
const AUTH_ROUTES = ["/login", "/signup"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionToken = request.cookies.get("session_token")?.value;
  const isValidSession = sessionToken ? validateSessionToken(sessionToken) : false;

  // Check if route is protected
  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  const isProtectedApi = PROTECTED_API_PREFIXES.some((p) => pathname.startsWith(p));
  const isAuthRoute = AUTH_ROUTES.some((p) => pathname.startsWith(p));

  // Protect API routes
  if (isProtectedApi && !isValidSession) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Protect page routes
  if (isProtected && !isValidSession) {
    // Not logged in → redirect to login
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect logged-in users away from auth pages
  if (isAuthRoute && isValidSession) {
    // Already logged in → redirect to dashboard
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/train/:path*",
    "/generate/:path*",
    "/history/:path*",
    "/editor/:path*",
    "/login",
    "/signup",
    "/api/tone/:path*",
    "/api/drafts/:path*",
    "/api/generate/:path*",
  ],
};
