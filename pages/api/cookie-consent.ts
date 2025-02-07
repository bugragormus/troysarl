import { NextApiRequest, NextApiResponse } from "next";
import { serialize } from "cookie";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    const { essential, marketing, analytics } = req.body;

    // Çerezleri HTTP-only cookie olarak ayarla (30 gün)
    res.setHeader("Set-Cookie", [
      serialize(
        "cookieConsent",
        JSON.stringify({ essential, marketing, analytics }),
        {
          httpOnly: true, // Tarayıcıdan erişilemez (XSS'e karşı koruma)
          secure: process.env.NODE_ENV === "production", // Prod'da sadece HTTPS üzerinde çalışır
          sameSite: "strict", // CSRF saldırılarını önlemek için
          path: "/", // Tüm site için geçerli
          maxAge: 30 * 24 * 60 * 60, // 30 gün
        }
      ),
    ]);

    return res.status(200).json({ message: "Cookie preferences saved" });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
