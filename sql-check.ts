import { createClient } from "@supabase/supabase-js";
import 'dotenv/config';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data } = await supabaseAdmin.from("blog_posts").select("*");
  console.log("Total blog posts in DB:", data?.length);
  if (data && data.length > 0) {
    console.log("Sample post author_id:", data[0].author_id);
    console.log("Sample post status:", data[0].status);
  }
}
run();
