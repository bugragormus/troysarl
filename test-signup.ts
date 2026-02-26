import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testSignup() {
  console.log("Testing Supabase Signup...");
  
  const testEmail = `test_${Date.now()}@example.com`;
  
  const { data, error } = await supabase.auth.signUp({
    email: testEmail,
    password: "TestPassword123!",
    options: {
      data: {
        full_name: "Test User",
        phone: "123456789",
        marketing_consent: true,
      }
    }
  });

  if (error) {
    console.error("Signup Failed with 500/400 Error:", error);
  } else {
    console.log("Signup Succeeded:", data.user?.id);
  }
}

testSignup();
