import { NextResponse, type NextRequest } from "next/server";
import { clearSession } from "@/lib/session";

// POST only — กัน accidental GET (เช่น <Link> prefetch, browser preview, bookmark)
// HTTP semantics: logout เปลี่ยน state ต้องเป็น POST
export async function POST(request: NextRequest) {
  await clearSession();
  const url = request.nextUrl.clone();
  url.pathname = "/login";
  return NextResponse.redirect(url, 303);
}
