import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const token = req.cookies.admin_token;
    if (!token) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    const jwt = await import("jose");
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || "default_secret_key");
    try {
        await jwt.jwtVerify(token, secret);
    } catch (jwtErr) {
        return res.status(401).json({ error: "Invalid token" });
    }

    if (req.method === "GET") {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return res.status(200).json({ posts: data || [] });
    }

    if (req.method === "POST") {
      const post = req.body;
      const postData = {
        ...post,
        updated_at: new Date().toISOString()
      };

      if (post.status === "published" && !post.published_at) {
        postData.published_at = new Date().toISOString();
      }

      let error;
      if (post.id) {
        const { error: updateError } = await supabase
          .from("blog_posts")
          .update(postData)
          .eq("id", post.id);
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from("blog_posts")
          .insert([postData]);
        error = insertError;
      }

      if (error) throw error;
      return res.status(200).json({ success: true });
    }

    if (req.method === "DELETE") {
      const { id } = req.query;
      const { error } = await supabase.from("blog_posts").delete().eq("id", id);
      if (error) throw error;
      return res.status(200).json({ success: true });
    }

    return res.status(405).end();
  } catch (error: any) {
    console.error("DEBUG Admin-Content Error:", error);
    if (error.code === '23505' && error.message.includes('slug')) {
       return res.status(400).json({ error: "This SEO slug is already in use. Please choose another." });
    }
    return res.status(500).json({ error: error.message });
  }
}
