import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return res.status(500).json({ 
      status: "error", 
      message: "Environment variables missing." 
    });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const startTime = Date.now();
    
    // Attempt a lightweight query to test connectivity
    const { error } = await supabase.from('cars').select('id').limit(1);
    
    if (error) {
      throw error;
    }

    const duration = Date.now() - startTime;

    return res.status(200).json({
      status: "healthy",
      message: "System operational.",
      responseTimeMs: duration
    });

  } catch (error: any) {
    console.error("Health Check Error:", error);
    return res.status(500).json({
      status: "error",
      message: "Database connection failed.",
      error: error.message
    });
  }
}
