import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function testApi() {
  console.log("Checking profiles count...");
  const profRes = await supabase.from("profiles").select("*", { count: "exact" });
  if (profRes.error) {
     console.error("Profiles error:", profRes.error);
  } else {
     console.log(`Profiles found: ${profRes.data?.length}`);
  }
}
testApi();
