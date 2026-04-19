import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/server/auth/jwt";

const PUBLIC_PATHS = ["/login", "/api/auth/login"];
const ALWAYS_ALLOWED = ["/api/auth/logout"];
const MUST_CHANGE_ALLOWED = [
  "/profile",
  "/api/auth/logout",
  "/api/users/me/password",
];
const SETUP_ALLOWED = [
  "/settings",
  "/api/settings",
  "/api/auth/logout",
];

function isPublic(pathname: string): boolean {
  return PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = token ? await verifySessionToken(token) : null;

  if (pathname === "/login" && session) {
    const url = req.nextUrl.clone();
    url.pathname = session.mustChangePassword ? "/profile" : "/";
    url.search = session.mustChangePassword ? "?first=1" : "";
    return NextResponse.redirect(url);
  }

  if (isPublic(pathname)) {
    return NextResponse.next();
  }

  if (!session) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    return NextResponse.redirect(url);
  }

  if (
    session.mustChangePassword &&
    !MUST_CHANGE_ALLOWED.some(
      (p) => pathname === p || pathname.startsWith(p + "/"),
    ) &&
    !ALWAYS_ALLOWED.includes(pathname)
  ) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { error: "Password change required" },
        { status: 403 },
      );
    }
    const url = req.nextUrl.clone();
    url.pathname = "/profile";
    url.search = "?first=1";
    return NextResponse.redirect(url);
  }

  // Desktop-only: redirect admin to /settings if SERPAPI_KEY is not configured
  if (
    session.role === "admin" &&
    !process.env.SERPAPI_KEY &&
    process.env.LEADVERO_DATA_DIR &&
    !SETUP_ALLOWED.some((p) => pathname === p || pathname.startsWith(p + "/")) &&
    !ALWAYS_ALLOWED.includes(pathname)
  ) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Setup required" }, { status: 503 });
    }
    const url = req.nextUrl.clone();
    url.pathname = "/settings";
    url.search = "?setup=1";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
