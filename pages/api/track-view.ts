import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import { serialize } from "cookie";
import crypto from "crypto";

// Minimal Supabase client with Service Role or Anon (Service Role preferred if table policies are restrictive for unauthenticated, but anon with Anon insert is fine too)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { carId, userId } = req.body;

    if (!carId) {
      return res.status(400).json({ error: "carId is required" });
    }

    // --- Prevent Admin Views from skewing analytics ---
    if (req.cookies.admin_token) {
      // User is logged into the Admin Panel, silently skip logging this view
      return res.status(200).json({ success: true, message: "Ignored admin view" });
    }

    // Session Management via HttpOnly Cookie to prevent rapid spamming per session
    let sessionId = req.cookies.troy_session_id;

    if (!sessionId) {
      sessionId = crypto.randomUUID();
      // Set the session cookie, expires in 4 hours
      res.setHeader(
        "Set-Cookie",
        serialize("troy_session_id", sessionId, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          maxAge: 60 * 60 * 4, // 4 hours
          path: "/",
        })
      );
    }

    // Check if this session has ALREADY viewed this specific car recently (last 4 hours)
    // To prevent refresh spamming. We'll do a quick lookup.
    const { data: recentView } = await supabase
      .from("page_views")
      .select("id")
      .eq("car_id", carId)
      .eq("session_id", sessionId)
      .gte("viewed_at", new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString())
      .limit(1)
      .maybeSingle();

    if (recentView) {
      // Already viewed recently by this session, don't log a duplicate
      return res.status(200).json({ success: true, message: "View already logged for this session" });
    }

    // Insert the new view
    const { error } = await supabase.from("page_views").insert({
      car_id: carId,
      session_id: sessionId,
      user_id: userId || null, // Optional if user is logged in
    });

    if (error) {
      console.error("Error inserting page view:", error);
      throw error;
    }

    return res.status(200).json({ success: true });
  } catch (error: any) {
    console.error("Track View API Error:", error);
    return res.status(500).json({ error: "Failed to track view" });
  }
}
