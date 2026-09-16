import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";

import { routing } from "@/i18n/routing";
import { updateSession } from "@/lib/supabase/proxy";

const intlMiddleware = createMiddleware(routing);

const PROTECTED_SEGMENTS = ["/owner", "/employee"];

export async function proxy(request: NextRequest) {
  const response = intlMiddleware(request);

  const user = await updateSession(request, response);

  const pathname = request.nextUrl.pathname;
  const isProtected = PROTECTED_SEGMENTS.some((segment) =>
    pathname.includes(segment)
  );

  if (isProtected && !user) {
    const locale =
      routing.locales.find(
        (candidate) =>
          pathname.startsWith(`/${candidate}/`) || pathname === `/${candidate}`
      ) ?? routing.defaultLocale;

    const loginUrl = new URL(`/${locale}/login`, request.url);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
