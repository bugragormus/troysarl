import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function sync() {
  console.log("Fetching Auth Users...");
  const { data: authData, error: authErr } = await supabase.auth.admin.listUsers();
  if (authErr) { console.error(authErr); return; }
  
  const users = authData.users;
  console.log(`Found ${users.length} users in Auth system.`);

  console.log("Fetching current Profiles...");
  const { data: profiles } = await supabase.from("profiles").select("id");
  const profileIds = new Set(profiles?.map(p => p.id));
  console.log(`Found ${profileIds.size} profiles in DB.`);
  
  let synced = 0;
  for (const user of users) {
     if (!profileIds.has(user.id)) {
        console.log(`Missing profile for ${user.email}. Creating...`);
        const { error: insertErr } = await supabase.from("profiles").insert({
           id: user.id,
           full_name: user.user_metadata?.full_name || user.email?.split('@')[0],
           phone: user.user_metadata?.phone || null,
           marketing_consent: user.user_metadata?.marketing_consent || false
        });
        if (insertErr) console.error("Insert error:", insertErr);
        else synced++;
     }
  }
  console.log(`Successfully synced ${synced} missing profiles!`);
  process.exit(0);
}
sync();
