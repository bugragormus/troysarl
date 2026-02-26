import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import { serialize } from "cookie";
import crypto from "crypto";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { slug } = req.body;

    if (!slug) {
      return res.status(400).json({ error: "Slug is required" });
    }

    // --- Prevent Admin Views from skewing analytics ---
    if (req.cookies.admin_token) {
      return res.status(200).json({ success: true, message: "Ignored admin view" });
    }

    // Session Management to prevent rapid spamming
    let sessionId = req.cookies.troy_blog_session_id;

    if (!sessionId) {
      sessionId = crypto.randomUUID();
      res.setHeader(
        "Set-Cookie",
        serialize("troy_blog_session_id", sessionId, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          maxAge: 60 * 60 * 4, // 4 hours
          path: "/",
        })
      );
    }

    // Simple rate limiting/duplicate check per session using a cookie-based approach or just a simple increment
    // For blog posts, we'll do a simple increment but we could also track in a separate table if unique views are strictly required.
    // To keep it simple as requested, we'll increment the views_count in blog_posts.

    const { data: post, error: fetchError } = await supabase
      .from("blog_posts")
      .select("id, views_count")
      .eq("slug", slug)
      .single();

    if (fetchError || !post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const { error: updateError } = await supabase
      .from("blog_posts")
      .update({ views_count: (post.views_count || 0) + 1 })
      .eq("id", post.id);

    if (updateError) {
      throw updateError;
    }

    return res.status(200).json({ success: true });
  } catch (error: any) {
    console.error("Track Blog View API Error:", error);
    return res.status(500).json({ error: "Failed to track view" });
  }
}
