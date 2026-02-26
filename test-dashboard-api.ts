import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function testApi() {
  console.log("Fetching profiles using role key directly...");
  const profRes = await supabase.from("profiles").select("*");
  console.log("Profile data length:", profRes.data?.length);

  try {
     const req = await fetch("http://localhost:3000/api/admin-stats", {
         headers: {
             cookie: "admin_token=bypass_test" // just want to hit the JWT error or beyond
         }
     });
     console.log("API Status:", req.status);
  } catch(e) { console.error("Fetch err:", e)}
}
testApi();
