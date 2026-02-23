import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const DASHBOARD_PATH = "/super-secret-dashboard-98765";
const LOGIN_PATH = "/admin-login";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Türkiye'den erişimi engelle
  const country =
    request.headers.get("x-vercel-ip-country") ??
    (request as NextRequest & { geo?: { country?: string } }).geo?.country;
  if (country === "TR") {
    return new NextResponse(
      "Web sitemiz şu anda bakım çalışması nedeniyle geçici olarak kullanılamıyor.",
      { status: 503 }
    );
  }

  // Admin dashboard koruması — JWT cookie kontrolü
  if (pathname.startsWith(DASHBOARD_PATH)) {
    const token = request.cookies.get("admin_token")?.value;

    if (!token) {
      // Cookie yok — login sayfasına yönlendir
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = LOGIN_PATH;
      return NextResponse.redirect(loginUrl);
    }

    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET);
      await jwtVerify(token, secret);
      // Token geçerli — devam et
      return NextResponse.next();
    } catch {
      // Token geçersiz veya süresi dolmuş — login sayfasına yönlendir
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = LOGIN_PATH;
      const response = NextResponse.redirect(loginUrl);
      // Geçersiz cookie'yi temizle
      response.cookies.delete("admin_token");
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
