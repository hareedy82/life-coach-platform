import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decrypt } from "@/app/lib/session";

const PROTECTED_COACH = ["/dashboard/coach"];
const PROTECTED_CLIENT = ["/dashboard/client"];
const PROTECTED_ANY = [...PROTECTED_COACH, ...PROTECTED_CLIENT, "/messages"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtected = PROTECTED_ANY.some((p) => pathname.startsWith(p));

  if (!isProtected) return NextResponse.next();

  const cookie = request.cookies.get("session")?.value;
  const session = cookie ? await decrypt(cookie) : null;

  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const needsCoach = PROTECTED_COACH.some((p) => pathname.startsWith(p));
  const needsClient = PROTECTED_CLIENT.some((p) => pathname.startsWith(p));

  if (needsCoach && session.role !== "coach") {
    return NextResponse.redirect(new URL("/dashboard/client", request.url));
  }
  if (needsClient && session.role !== "client") {
    return NextResponse.redirect(new URL("/dashboard/coach", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/messages/:path*", "/messages"],
};
