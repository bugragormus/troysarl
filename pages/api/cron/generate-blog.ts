import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";

// Initialize Supabase (Admin Bypass)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Allow GET or POST for easy Cron triggering
  if (req.method !== "GET" && req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed." });
  }

  // Security: Ensure this endpoint isn't abused
  const authHeader = req.headers.authorization;
  const cronSecret = process.env.CRON_SECRET || process.env.WEBHOOK_SECRET;

  if (!cronSecret) {
    return res.status(500).json({ error: "Server misconfiguration. CRON_SECRET is missing." });
  }

  if (!authHeader || authHeader !== `Bearer ${cronSecret}`) {
    return res.status(401).json({ error: "Unauthorized. Invalid Token." });
  }

  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ error: "OPENAI_API_KEY is not set." });
  }

  try {
    console.log("Starting Internal AI SEO Generator...");

    // 1. Generate Topic (European Luxury Car Market)
    const topicResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Cost-effective model
      messages: [
        { role: "system", content: "You are the SEO Director for Troy Cars SARL, a luxury car dealership in Luxembourg." },
        { role: "user", content: "Suggest ONE engaging, SEO-optimized blog topic about European luxury cars, EV trends, or high-end car rentals. Return ONLY the title as plain text." }
      ],
      max_tokens: 50,
      temperature: 0.7,
    });
    
    const topic = topicResponse.choices[0].message.content?.trim() || "European Luxury Car Trends in 2026";
    console.log(`Topic selected: ${topic}`);

    // 2. Generate English Article (JSON output)
    const enResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      response_format: { type: "json_object" },
      messages: [
         { role: "system", content: "You are the Chief SEO Editor for Troy Cars SARL. You output strictly in JSON format." },
         { role: "user", content: `Write a 600-word, highly persuasive SEO article about: "${topic}". 
         Write in ENGLISH. Format the content in clean HTML (<h2>, <p>, <ul>). 
         Return a JSON object with strictly these keys:
         {
           "title": "String",
           "slug": "url-friendly-slug-with-hyphens",
           "content": "HTML string",
           "meta_title": "Max 60 chars",
           "meta_description": "Max 160 chars",
           "keywords": "comma, separated, list"
         }` }
      ],
      temperature: 0.7,
    });

    const enResult = JSON.parse(enResponse.choices[0].message.content || "{}");
    if (!enResult.content) throw new Error("Failed to generate English content.");

    // 3. Translate to French & German (Parallel)
    console.log("Translating to French and German...");
    const [frResponse, deResponse] = await Promise.all([
       openai.chat.completions.create({
          model: "gpt-4o-mini",
          response_format: { type: "json_object" },
          messages: [
             { role: "system", content: "You are an expert native French translator." },
             { role: "user", content: `Translate the values of this JSON object into native French. Keep the HTML tags intact, and adapt the slug. JSON:\n${JSON.stringify(enResult)}` }
          ]
       }),
       openai.chat.completions.create({
          model: "gpt-4o-mini",
          response_format: { type: "json_object" },
          messages: [
             { role: "system", content: "You are an expert native German translator." },
             { role: "user", content: `Translate the values of this JSON object into native German. Keep the HTML tags intact, and adapt the slug. JSON:\n${JSON.stringify(enResult)}` }
          ]
       })
    ]);

    const frResult = JSON.parse(frResponse.choices[0].message.content || "{}");
    const deResult = JSON.parse(deResponse.choices[0].message.content || "{}");

    // Helper function to insert into Supabase
    const insertPost = async (post: any) => {
        let finalSlug = post.slug.toLowerCase().replace(/[^a-z0-9-]/g, '');
        // Collision check
        const { data: existing } = await supabase.from("blog_posts").select("id").eq("slug", finalSlug).maybeSingle();
        if (existing) finalSlug = `${finalSlug}-${Math.random().toString(36).substring(2, 6)}`;

        const { error: insertError } = await supabase.from("blog_posts").insert({
            title: post.title,
            slug: finalSlug,
            content: post.content,
            meta_title: post.meta_title,
            meta_description: post.meta_description,
            keywords: post.keywords,
            status: "draft", // Leave as draft for admin approval
            updated_at: new Date().toISOString(),
        });
        
        if (insertError) {
          console.error(`Failed to insert post [${finalSlug}]:`, insertError);
          throw new Error(`Database insert failed: ${insertError.message}`);
        }
    };

    // 4. Save to Database
    console.log("Saving to Supabase...");
    await Promise.all([
       insertPost(enResult),
       insertPost(frResult),
       insertPost(deResult)
    ]);

    return res.status(200).json({ 
      success: true, 
      message: `Generated and saved 3 localized articles for topic: ${topic}`,
      topic
    });

  } catch (error: any) {
    console.error("Cron AI Generator Failed:", error);
    return res.status(500).json({ error: "Internal server error during AI generation." });
  }
}
