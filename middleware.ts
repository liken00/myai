import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value;

  // Public paths that don't need auth
  const publicPaths = ["/", "/login", "/register", "/api/auth", "/api/generate", "/api/webhook"];
  const pathname = request.nextUrl.pathname;

  // Allow public paths
  for (const path of publicPaths) {
    if (pathname === path || pathname.startsWith(path + "/")) {
      return NextResponse.next();
    }
  }

  // Check auth token
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/generate/:path*", "/pricing/:path*"],
};