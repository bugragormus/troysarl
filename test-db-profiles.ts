import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function testApi() {
  console.log("Checking profiles table...");
  const profRes = await supabase.from("profiles").select("*");
  console.log("Profiles count:", profRes.data?.length);

  
  console.log("Checking auth.users table (admin only)...");
  const { data: users, error } = await supabase.auth.admin.listUsers();
  if (error) {
     console.log("Cannot read auth users:", error.message);
  } else {
     console.log("Auth Users count:", users?.users.length);
  }
}
testApi();
