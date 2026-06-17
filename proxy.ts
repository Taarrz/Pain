import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_PATHS = ["/login", "/logout"];

export default function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const session = req.cookies.get("mock_session")?.value;

  if (PUBLIC_PATHS.includes(pathname)) {
    if (session && pathname === "/login") {
      const url = req.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  if (!session && pathname !== "/") {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|favicon.ico|.*\\.).*)"],
};
