import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Türkiye'den erişimi engelle - Vercel X-Vercel-IP-Country header'ı kullan (geo bazen dolu gelmeyebilir)
  const country =
    request.headers.get("x-vercel-ip-country") ??
    (request as NextRequest & { geo?: { country?: string } }).geo?.country;
  if (country === "TR") {
    return new NextResponse(
      "Web sitemiz şu anda bakım çalışması nedeniyle geçici olarak kullanılamıyor.",
      {
        status: 503,
      },
    );
  }

  // Dashboard için Basic Auth (mevcut mantık)
  const pathname = request.nextUrl.pathname;
  if (pathname.startsWith("/super-secret-dashboard-98765")) {
    const basicAuth = request.headers.get("authorization");
    if (!basicAuth) {
      return new Response("Authorization required", {
        status: 401,
        headers: { "WWW-Authenticate": 'Basic realm="Secure Area"' },
      });
    }
    const auth = basicAuth.split(" ")[1];
    const decoded = Buffer.from(auth, "base64").toString();
    const [username, password] = decoded.split(":");
    // const allowedIps = ["123.45.67.89", "98.76.54.32"];
    // const userIp = request.headers.get("x-forwarded-for")?.split(",")[0] || request.ip;

    if (
      username !== process.env.ADMIN_USERNAME ||
      password !== process.env.ADMIN_PASSWORD
    ) {
      return new Response("Invalid credentials", {
        status: 401,
        headers: { "WWW-Authenticate": 'Basic realm="Secure Area"' },
      });
    }
  }

  return NextResponse.next();
}

export const config = {
  // Tüm sayfa isteklerinde çalış (geo engeli + dashboard auth)
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
