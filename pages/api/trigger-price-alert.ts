import { NextApiRequest, NextApiResponse } from "next";
import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";
import { jwtVerify } from "jose";

const resend = new Resend(process.env.RESEND_API_KEY);
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!; // service_role is better but anon is fine for now
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

  const { carId, oldPrice, newPrice, brand, model } = req.body;

  if (!carId || !newPrice || !oldPrice) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // Sanity check: ensure price actually dropped
  if (newPrice >= oldPrice) {
    return res.status(200).json({ message: "Price did not drop. No alerts sent." });
  }

  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY is not configured.");
    return res.status(200).json({ message: "Resend not configured, skipped alerts." });
  }

  try {
    // 2. Find all users who favorited this car
    const { data: favorites, error: favError } = await supabase
      .from("user_favorites")
      .select("user_id")
      .eq("car_id", carId);

    if (favError || !favorites || favorites.length === 0) {
      return res.status(200).json({ message: "No users favorited this car." });
    }

    const userIds = favorites.map((f: any) => f.user_id);

    // 3. Fetch profiles for these users to check alert preferences and get emails
    const { data: profiles, error: profError } = await supabase
      .from("profiles")
      .select("id, full_name, email, phone, price_drop_alerts")
      .in("id", userIds)
      .eq("price_drop_alerts", true);

    if (profError || !profiles || profiles.length === 0) {
      return res.status(200).json({ message: "No users with price drop alerts configured favorited this car." });
    }

    // Attempt to extract emails (schema uses phone as email typically, fallback to email)
    const validEmails = profiles
      .map((p: any) => p.phone || p.email)
      .filter((e: any) => typeof e === "string" && e.includes("@"));

    if (validEmails.length === 0) {
      return res.status(200).json({ message: "No valid email addresses found." });
    }

    const fromEmail = process.env.NEXT_PUBLIC_SENDER_EMAIL || "info@troysarl.com";
    const subject = `Price Drop Alert: ${brand} ${model}`;
    const discountAmount = oldPrice - newPrice;
    
    // Formatting currency locally, assuming EUR for now
    const formatCurrency = (amount: number) => `€${amount.toLocaleString('de-DE')}`;

    const htmlBody = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px;">
        <h2 style="color: #ef4444; margin-top: 0;">🔥 Price Drop Alert: The ${brand} ${model} you loved is now cheaper!</h2>
        <p style="font-size: 16px; color: #374151;">Great news! A vehicle you recently favorited has just dropped in price.</p>
        
        <div style="background-color: #f9fafb; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0; font-size: 15px; color: #6b7280; text-decoration: line-through;">Old Price: ${formatCurrency(oldPrice)}</p>
          <p style="margin: 5px 0 0 0; font-size: 20px; font-weight: bold; color: #10b981;">New Price: ${formatCurrency(newPrice)}</p>
          <p style="margin: 10px 0 0 0; font-size: 14px; font-weight: bold; color: #ef4444;">You Save: ${formatCurrency(discountAmount)}!</p>
        </div>
        
        <a href="https://troysarl.com/cars/${carId}" style="display: inline-block; background-color: #2563eb; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">View Car Details</a>
        
        <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 30px 0 20px 0;" />
        <p style="font-size: 12px; color: #9ca3af; margin: 0;">You are receiving this email because you favorited this car and opted into price drop alerts. You can manage your preferences in your profile settings.</p>
        <p style="font-size: 12px; color: #9ca3af; margin: 5px 0 0 0;">Troy Cars SARL</p>
      </div>
    `;

    // 4. Dispatch Email
    // Using BCC so users don't see each other's emails
    const { data: resendData, error: resendError } = await resend.emails.send({
      from: `Troy Cars SARL <${fromEmail}>`,
      to: [fromEmail], // Send to self
      bcc: validEmails,
      subject: subject,
      html: htmlBody,
    });

    if (resendError) {
      console.error("Resend API Error (Price Alert):", resendError);
      return res.status(500).json({ error: resendError.message });
    }

    return res.status(200).json({ 
      success: true, 
      message: `Price drop alert sent to ${validEmails.length} users.`,
      dispatchedEmails: validEmails.length 
    });

  } catch (error: any) {
    console.error("Price Alert API Error:", error);
    return res.status(500).json({ error: "Failed to dispatch price drop alert" });
  }
}
