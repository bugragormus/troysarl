import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase with the service_role key to bypass RLS for admin-level insertions
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow POST requests from n8n / Make
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  // 1. Security Verification: Check the Webhook Secret
  const authHeader = req.headers.authorization;
  const expectedSecret = process.env.WEBHOOK_SECRET;

  if (!expectedSecret) {
    console.error("WEBHOOK_SECRET is not set in the server environment variables.");
    return res.status(500).json({ error: "Server misconfiguration. Webhook secret is missing." });
  }

  if (!authHeader || authHeader !== `Bearer ${expectedSecret}`) {
    console.warn("Unauthorized webhook attempt blocked.");
    return res.status(401).json({ error: "Unauthorized. Invalid Token." });
  }

  try {
    // 2. Parse the AI-generated Payload
    const { 
      title, 
      slug, 
      content, 
      excerpt, 
      meta_title, 
      meta_description, 
      keywords,
      language, // Optional: for future multi-lingual categorization
      status = "draft" // Default to draft for safety, AI can pass "published"
    } = req.body;

    // Validate required fields
    if (!title || !slug || !content) {
      return res.status(400).json({ error: "Missing required fields: title, slug, or content." });
    }

    // 3. Prevent Slug Collisions (SEO safety check)
    let finalSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, '');
    const { data: existingPost } = await supabase
      .from("blog_posts")
      .select("id")
      .eq("slug", finalSlug)
      .maybeSingle();

    if (existingPost) {
      // Append a short random string or date snippet if the slug already exists
      finalSlug = `${finalSlug}-${Math.random().toString(36).substring(2, 6)}`;
    }

    // 4. Insert into Supabase
    const { data, error } = await supabase.from("blog_posts").insert({
      title,
      slug: finalSlug,
      content,
      excerpt,
      meta_title,
      meta_description,
      keywords,
      status,
      published_at: status === "published" ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    }).select().single();

    if (error) {
      console.error("Supabase Insertion Error:", error);
      throw error;
    }

    // 5. Respond Success to n8n/Make
    return res.status(200).json({ 
      success: true, 
      message: "AI Blog post successfully created.", 
      post_id: data.id,
      slug: data.slug,
      status: data.status
    });

  } catch (error: any) {
    console.error("AI Webhook Failed:", error);
    return res.status(500).json({ error: "Internal server error during blog creation." });
  }
}
