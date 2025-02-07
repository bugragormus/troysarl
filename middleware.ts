import { NextResponse } from "next/server";

export function middleware(req: any) {
  const basicAuth = req.headers.get("authorization");

  if (!basicAuth) {
    return new Response("Authorization required", {
      status: 401,
      headers: { "WWW-Authenticate": 'Basic realm="Secure Area"' },
    });
  }

  const auth = basicAuth.split(" ")[1];
  const decoded = Buffer.from(auth, "base64").toString();
  const [username, password] = decoded.split(":");
  //const allowedIps = ["123.45.67.89", "98.76.54.32"]; // Senin IP'lerin
  //const userIp = req.headers.get("x-forwarded-for")?.split(",")[0] || req.ip; terminalde bunu çalıştır curl ifconfig.me

  if (
    username !== process.env.ADMIN_USERNAME ||
    password !== process.env.ADMIN_PASSWORD
  ) {
    return new Response("Invalid credentials", {
      status: 401,
      headers: { "WWW-Authenticate": 'Basic realm="Secure Area"' },
    });
  }

  {
    /* IP Whitelist 
  if (!allowedIps.includes(userIp)) {
    return new Response("Unauthorized", { status: 403 });
  }
  */
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/admin/:path*",
};
