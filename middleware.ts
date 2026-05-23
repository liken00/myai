import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "myai-secret-key-change-in-production";
const PROTECTED_ROUTES = ["/dashboard", "/generate"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if route needs protection
  const needsAuth = PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
  if (!needsAuth) {
    return NextResponse.next();
  }

  // Check for auth_token cookie
  const token = request.cookies.get("auth_token")?.value;
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    jwt.verify(token, JWT_SECRET);
    return NextResponse.next();
  } catch {
    // Invalid token - redirect to login
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete("auth_token");
    return response;
  }
}

export const config = {
  matcher: ["/dashboard/:path*", "/generate/:path*"],
};