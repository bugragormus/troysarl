import { createClient } from "@supabase/supabase-js";
import 'dotenv/config';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const result = await supabase.from("blog_posts").insert({
            title: "Test",
            slug: "test-" + Math.random(),
            content: "Test",
            status: "draft"
        });
  console.log("Insert Result:", result);
}
run();
