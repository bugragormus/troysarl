import { createClient } from "@supabase/supabase-js";
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function run() {
  const { data, error } = await supabaseAdmin
      .from("blog_posts")
      .select(`slug, status, author_id, author:author_id ( email )`);
  if (error) console.error(error);
  else console.log("Posts:", JSON.stringify(data, null, 2));
}
run();
