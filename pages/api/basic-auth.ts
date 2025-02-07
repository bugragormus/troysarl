// pages/api/basic-auth.ts
import { NextApiRequest, NextApiResponse } from "next";

const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const authHeader = req.headers.authorization;
  const redirectUrl = req.query.redirect || "/admin";

  if (!authHeader) {
    res.setHeader("WWW-Authenticate", 'Basic realm="Secure Area"');
    return res.status(401).end("Authorization required");
  }

  // "Basic base64encoded(username:password)"
  const base64Credentials = authHeader.split(" ")[1];
  const credentials = Buffer.from(base64Credentials, "base64").toString(
    "ascii"
  );
  const [username, password] = credentials.split(":");

  // Doğrulama
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    // Doğrulama başarılı: yönlendir
    res.writeHead(302, { Location: String(redirectUrl) });
    return res.end();
  } else {
    res.setHeader("WWW-Authenticate", 'Basic realm="Secure Area"');
    return res.status(401).end("Invalid credentials");
  }
}
