import { NextApiRequest, NextApiResponse } from "next";
import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";
import { jwtVerify } from "jose";
import { generateVipEmailHtml } from "@/lib/emailTemplates";

const resend = new Resend(process.env.RESEND_API_KEY);
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!; // Or service_role if needed
const supabase = createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseKey);

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
    // 3. Fetch Subscribers from Profiles Table (Consent Check)
    const { data: profileEntries, error: profileErr } = await supabase
      .from("profiles")
      .select("id, full_name, marketing_consent")
      .eq("marketing_consent", true);

    if (profileErr) {
      console.error("Error fetching subscribers:", profileErr);
      return res.status(500).json({ error: "Failed to fetch subscriber profiles." });
    }

    if (!profileEntries || profileEntries.length === 0) {
      return res.status(200).json({ success: true, message: "No subscribers found with marketing consent." });
    }

    // 4. Match with Auth Users to Get Real Email Addresses
    const { data: authUsers, error: authErr } = await supabase.auth.admin.listUsers();
    
    if (authErr) {
      console.error("Auth Fetch Error:", authErr);
      return res.status(500).json({ error: "Critical: Database authentication match failed." });
    }

    const consentIds = new Set(profileEntries.map(p => p.id));
    const validContacts = authUsers.users
      .filter(u => consentIds.has(u.id) && u.email)
      .map(u => u.email as string);

    if (validContacts.length === 0) {
      return res.status(400).json({ error: "No opted-in users with verified email addresses found." });
    }

    // 5. Wrap Content in Template
    const premiumHtml = generateVipEmailHtml(subject, htmlBody);

    // 6. Dispatch Email
    const recipients = testMode ? [validContacts[0]] : validContacts;
    const fromEmail = process.env.NEXT_PUBLIC_SENDER_EMAIL || "info@troysarl.com";

    const { data: resendData, error: resendError } = await resend.emails.send({
      from: `Troy Cars SARL <${fromEmail}>`,
      to: testMode ? recipients : [fromEmail],
      bcc: testMode ? undefined : recipients,
      subject: subject,
      html: premiumHtml,
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
