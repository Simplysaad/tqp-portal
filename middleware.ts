// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SOCIAL_CRAWLERS =
  /facebookexternalhit|twitterbot|linkedinbot|whatsapp|telegrambot|discordbot|slackbot|applebot/i;

export function middleware(request: NextRequest) {
  const userAgent = request.headers.get("user-agent") || "";
  const isCrawler = SOCIAL_CRAWLERS.test(userAgent);

  // Check for your session token cookie
  const sessionToken =
    request.cookies.get("next-auth.session-token")?.value ||
    request.cookies.get("__session")?.value;

  // 1. If it's a social media bot, let it bypass the redirect so it can scrape your page's metadata export
  if (isCrawler) {
    return NextResponse.next();
  }

  // 2. Normal human user protection logic
  if (!sessionToken && request.nextUrl.pathname.startsWith("/dashboard")) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/enroll/:path*",
    "/onboarding/:path*",
    "/join/:path*",
    "/:path*"
  ],
};
