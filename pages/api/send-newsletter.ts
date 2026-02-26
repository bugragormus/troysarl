import { NextApiRequest, NextApiResponse } from "next";
import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";
import { jwtVerify } from "jose";

const resend = new Resend(process.env.RESEND_API_KEY);
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!; // Or service_role if needed
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // 1. Authenticate Admin
  const token = req.cookies.admin_token;
  if (!token) {
    return res.status(401).json({ error: "Unauthorized: Missing admin token" });
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    await jwtVerify(token, secret);
  } catch (error) {
    return res.status(401).json({ error: "Unauthorized: Invalid admin token" });
  }

  // 2. Validate Request Body
  const { subject, htmlBody, testMode } = req.body;

  if (!subject || !htmlBody) {
    return res.status(400).json({ error: "Subject and htmlBody are required" });
  }

  if (!process.env.RESEND_API_KEY) {
    return res.status(500).json({ error: "RESEND_API_KEY is not configured in environment variables." });
  }

  try {
    // 3. Fetch Subscribers
    const { data: profiles, error: fetchError } = await supabase
      .from("profiles")
      .select("id, full_name, email, marketing_consent")
      .eq("marketing_consent", true);

    if (fetchError) {
      console.error("Error fetching subscribers:", fetchError);
      return res.status(500).json({ error: "Failed to fetch subscribers" });
    }

    // Filter profiles that have a valid email (assuming schema uses 'phone' as email temporarily, but let's try 'email' or fallback)
    // Actually, in the current system, the 'email' is obtained from auth.users or profiles if stored there. 
    // Wait, the previous code used `p.phone` for email: `const optedInEmails = profiles.filter(p => p.marketing_consent).map(p => p.phone || "");`
    const validContacts = (profiles || [])
      .map((p) => (p as any).phone || (p as any).email)
      .filter((e) => typeof e === "string" && e.includes("@"));

    if (validContacts.length === 0) {
      return res.status(400).json({ error: "No opted-in users with valid email addresses found." });
    }

    // 4. Dispatch Email
    // In testMode, we only send to the first available contact or a predefined test email to avoid spamming everyone during development.
    const recipients = testMode ? [validContacts[0]] : validContacts;

    // Resend allows sending to multiple recipients (up to 50 per batch via BCC or multiple 'to').
    // For newsletters, it's safer to use BCC or loop through them individually to personalize (if Resend Audience features aren't used).
    // Here we use BCC for a simple newsletter.
    
    // NOTE: Sending from a verified domain is required by Resend (e.g., info@troysarl.com)
    // If you haven't verified a domain, resend limits sends to the email address registered on your Resend account (Usually onboarding@resend.dev to your own email).
    const fromEmail = process.env.NEXT_PUBLIC_SENDER_EMAIL || "info@troysarl.com";

    const { data: resendData, error: resendError } = await resend.emails.send({
      from: `Troy Cars SARL <${fromEmail}>`,
      to: testMode ? recipients : [fromEmail], // Send to self, bcc others
      bcc: testMode ? undefined : recipients,
      subject: subject,
      html: htmlBody,
    });

    if (resendError) {
      console.error("Resend API Error:", resendError);
      return res.status(500).json({ error: resendError.message });
    }

    return res.status(200).json({ 
      success: true, 
      message: `Newsletter queued for ${recipients.length} recipients.`,
      data: resendData
    });

  } catch (error: any) {
    console.error("Newsletter API Error:", error);
    return res.status(500).json({ error: "Failed to dispatch newsletter" });
  }
}
