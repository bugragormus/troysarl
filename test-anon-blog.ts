import { createClient } from "@supabase/supabase-js";
import 'dotenv/config';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  const { data, error } = await supabase
      .from("blog_posts")
      .select(`*, author:author_id ( email, raw_user_meta_data )`)
      .eq("status", "published");
  console.log("Anon Fetch Result:", JSON.stringify(data, null, 2));
  if (error) console.error("Error:", error);
}
run();
