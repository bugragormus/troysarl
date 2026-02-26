import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import { Transaction } from "@/types/transaction";
import Car from "@/types/car";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).end();

  try {
    const token = req.cookies.admin_token;
    if (!token) {
        console.error("DEBUG Admin-Stats: No admin_token cookie found");
        return res.status(401).json({ error: "Unauthorized" });
    }

    const jwt = await import("jose");
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || "default_secret_key");
    try {
        await jwt.jwtVerify(token, secret);
    } catch (jwtErr) {
        console.error("DEBUG Admin-Stats: JWT Verify Failed:", jwtErr);
        return res.status(401).json({ error: "Invalid token" });
    }

    const [carsRes, transRes, profRes, favRes, viewsRes] = await Promise.all([
      supabase.from("cars").select("*"),
      supabase.from("transactions").select("*"),
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("user_favorites").select("car_id"),
      supabase.from("page_views").select("car_id")
    ]);

    const cars = (carsRes.data || []) as Car[];
    const transactions = (transRes.data || []) as Transaction[];
    const profiles = profRes.data || [];
    const favoritesData = favRes.data || [];
    const pageViewsData = viewsRes.data || [];

    const revenue = transactions.reduce((sum, t) => sum + (t.total_price || 0), 0);
    const profit = transactions.reduce((sum, t) => sum + (t.total_price - (t.purchase_amount || 0)), 0);

    const favCounts: { [key: string]: number } = {};
    favoritesData.forEach(f => { favCounts[f.car_id] = (favCounts[f.car_id] || 0) + 1; });
    const sortedLeads = Object.entries(favCounts).map(([car_id, count]) => ({ car_id, count })).sort((a, b) => b.count - a.count).slice(0, 5);

    const viewCounts: { [key: string]: number } = {};
    pageViewsData.forEach(v => { viewCounts[v.car_id] = (viewCounts[v.car_id] || 0) + 1; });
    const sortedTraffic = Object.entries(viewCounts).map(([car_id, count]) => ({ car_id, count })).sort((a, b) => b.count - a.count).slice(0, 5);

    const stats = {
      totalCars: cars.length,
      liveListings: cars.filter(c => c.listing_type !== 'sold').length,
      totalUsers: profiles.length,
      totalRevenue: revenue,
      totalProfit: profit,
      marketingOptInCount: profiles.filter(p => p.marketing_consent).length,
    };

    console.log(`DEBUG Admin-Stats: Processed Data - Cars: ${cars.length}, Users: ${profiles.length}`);
    return res.status(200).json({ stats, profiles, cars, transactions, hotLeads: sortedLeads, trendingTraffic: sortedTraffic });
  } catch (error: any) {
    console.error("DEBUG Admin-Stats CRASH:", error);
    return res.status(500).json({ error: error.message });
  }
}
