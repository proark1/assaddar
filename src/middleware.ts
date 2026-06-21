import { NextResponse, type NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const accept = req.headers.get("accept-language")?.toLowerCase() ?? "";
  const locale = accept.startsWith("en") ? "en" : "de";
  // Rewrite (not redirect) so "/" returns 200 and serves the locale homepage.
  // Canonical/hreflang on the page point crawlers to the prefixed URLs.
  return NextResponse.rewrite(new URL(`/${locale}`, req.url));
}

export const config = {
  matcher: ["/"],
};
