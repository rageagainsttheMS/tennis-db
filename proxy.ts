// Next.js 16 renamed `middleware.ts` to `proxy.ts`.
// This is the first layer of admin protection. The admin layout and every Server Action
// check the role again on the server, so a bypass here doesn't expose anything.
import { auth } from "@/auth";
import { ADMINROLE, ROUTES } from "@/types/constants";
import { NextResponse } from "next/server";

export default auth((req) => {
  if (!req.auth) {
    const signInUrl = new URL(ROUTES.SIGNIN, req.nextUrl.origin);
    signInUrl.searchParams.set("callbackUrl", req.nextUrl.pathname + req.nextUrl.search);
    return NextResponse.redirect(signInUrl);
  }

  if (req.auth.user?.role !== ADMINROLE) {
    return NextResponse.redirect(new URL("/", req.nextUrl.origin));
  }

  return NextResponse.next();
});

export const config = {
  // Only admin pages. Public pages and /api/health are never matched.
  matcher: ["/admin/:path*"],
};
