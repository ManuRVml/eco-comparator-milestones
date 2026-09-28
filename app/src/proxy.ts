import { jwtVerify } from "jose";
import { NextRequest, NextResponse } from "next/server";
import { COOKIE_NAME, USER_ROLES, type UserRole } from "@/lib/auth-constants";

function toLogin(request: NextRequest) {
  // Las rutas de API responden 401 en JSON; las páginas redirigen al login.
  if (request.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Sesión requerida" }, { status: 401 });
  }
  return NextResponse.redirect(new URL("/login", request.url));
}

export async function proxy(request: NextRequest) {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  const secret = process.env.SESSION_SECRET;
  if (!token || !secret || secret.length < 32) return toLogin(request);

  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret), { algorithms: ["HS256"] });
    if (typeof payload.role !== "string" || !USER_ROLES.includes(payload.role as UserRole)) return toLogin(request);
    return NextResponse.next();
  } catch {
    return toLogin(request);
  }
}

export const config = {
  matcher: ["/((?!login(?:/|$)|_next/static|_next/image|favicon.ico|brand/|.*\\..*).*)"],
};