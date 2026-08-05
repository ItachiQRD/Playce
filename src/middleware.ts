import { NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Simple locale cookie
  const locale = request.cookies.get("PLAYCE_LOCALE")?.value ?? "fr";
  const response = await updateSession(request);
  response.cookies.set("PLAYCE_LOCALE", locale, { path: "/" });

  // Protect app routes in non-demo when needed — demo mode is open
  if (pathname.startsWith("/admin")) {
    // Admin gate handled client-side in demo
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
