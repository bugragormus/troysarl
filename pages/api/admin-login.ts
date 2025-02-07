// pages/api/admin-login.ts
import type { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const { password } = req.body;
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

  if (!ADMIN_PASSWORD) {
    return res
      .status(500)
      .json({ message: "Server Error: Missing ADMIN_PASSWORD" });
  }

  if (password !== ADMIN_PASSWORD) {
    return res.status(401).json({ message: "Incorrect password!" });
  }

  // JWT oluştur
  const token = jwt.sign({ role: "admin" }, process.env.JWT_SECRET as string, {
    expiresIn: "1h",
  });

  res.setHeader(
    "Set-Cookie",
    `admin_token=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=3600`
  );

  return res.status(200).json({ message: "Login successful!" });
}
