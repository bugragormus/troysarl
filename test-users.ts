import { createClient } from "@supabase/supabase-js";
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function run() {
  const { data: profiles, error } = await supabaseAdmin
    .from("profiles")
    .select("id, full_name, marketing_consent, created_at");
  if (error) console.error("Query error:", JSON.stringify(error));
  else {
    console.log("Profile count:", profiles?.length);
    console.log("Has created_at?:", profiles?.[0]?.created_at !== undefined);
    console.log("Full profile:", JSON.stringify(profiles?.[0]));
  }
}
run();
