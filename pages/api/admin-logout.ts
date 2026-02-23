// pages/api/admin-logout.ts
import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  // admin_token cookie'sini sil (Max-Age=0)
  res.setHeader(
    "Set-Cookie",
    "admin_token=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0"
  );

  return res.status(200).json({ message: "Logged out successfully" });
}
