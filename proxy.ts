import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";

const handleI18nRouting = createMiddleware(routing);

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  const localeMatch = pathname.match(/^\/(hi|en)(\/|$)/);
  const locale = localeMatch?.[1] ?? "hi";
  const pathAfterLocale = localeMatch ? pathname.slice(locale.length + 1) : pathname;
  const isLoginPage = pathAfterLocale === "/login" || pathAfterLocale === "/login/";

  if (!isLoginPage) {
    const authToken = request.cookies.get("auth_token");
    if (!authToken) {
      return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
    }
  }

  return handleI18nRouting(request);
}

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)"],
};
