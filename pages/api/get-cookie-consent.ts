import { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { cookieConsent } = req.cookies;

  if (!cookieConsent) {
    return res.status(200).json({ consent: null });
  }

  return res.status(200).json({ consent: JSON.parse(cookieConsent) });
}
