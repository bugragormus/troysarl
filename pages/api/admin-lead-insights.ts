import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import { jwtVerify } from "jose";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // 1. Authenticate Admin
  const token = req.cookies.admin_token;
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    await jwtVerify(token, secret);
  } catch (error) {
    return res.status(401).json({ error: "Invalid token" });
  }

  try {
    // 2. Fetch All Data in Parallel
    const [
      profilesRes,
      viewsRes,
      favoritesRes,
      carsRes,
      authRes
    ] = await Promise.all([
      supabase.from("profiles").select("id, full_name, created_at"),
      supabase.from("page_views").select("user_id, car_id"),
      supabase.from("user_favorites").select("user_id, car_id"),
      supabase.from("cars").select("id, brand, model, year, price, photos"),
      supabase.auth.admin.listUsers()
    ]);

    if (profilesRes.error) console.error("Profiles Fetch Error:", profilesRes.error);
    if (viewsRes.error) console.error("Views Fetch Error:", viewsRes.error);
    if (favoritesRes.error) console.error("Favorites Fetch Error:", favoritesRes.error);
    if (carsRes.error) console.error("Cars Fetch Error:", carsRes.error);
    if (authRes.error) console.error("Auth Fetch Error:", authRes.error);

    const profiles = profilesRes.data;
    const views = viewsRes.data;
    const favorites = favoritesRes.data;
    const cars = carsRes.data;
    const authData = authRes.data;

    if (!profiles || !cars) throw new Error("Failed to fetch primary data: Profiles or Cars missing.");

    const authUsers = authData?.users || [];
    const userMap = new Map();

    // Initialize user map with profiles and auth emails
    profiles.forEach(p => {
      const authUser = authUsers.find(u => u.id === p.id);
      userMap.set(p.id, {
        id: p.id,
        full_name: p.full_name || "Guest User",
        email: authUser?.email || "No Email",
        joined_at: p.created_at || authUser?.created_at,
        views: [],
        favorites: []
      });
    });

    // Match Views
    views?.forEach(v => {
      if (!v.user_id) return;
      const user = userMap.get(v.user_id);
      if (user) {
        const car = cars.find(c => c.id === v.car_id);
        if (car) {
          const existingView = user.views.find((vw: any) => vw.car_id === v.car_id);
          if (existingView) {
            existingView.count++;
          } else {
            user.views.push({
              car_id: car.id,
              brand: car.brand,
              model: car.model,
              photo: car.photos?.[0],
              count: 1
            });
          }
        }
      }
    });

    // Match Favorites
    favorites?.forEach(f => {
      const user = userMap.get(f.user_id);
      if (user) {
        const car = cars.find(c => c.id === f.car_id);
        if (car) {
          user.favorites.push({
            car_id: car.id,
            brand: car.brand,
            model: car.model,
            photo: car.photos?.[0],
            year: car.year,
            price: car.price
          });
        }
      }
    });

    // Convert map to sorted array (users with most activity first)
    const result = Array.from(userMap.values())
      .map(user => ({
        ...user,
        total_activity: user.views.reduce((acc: number, v: any) => acc + v.count, 0) + user.favorites.length
      }))
      .sort((a, b) => b.total_activity - a.total_activity);

    return res.status(200).json(result);
  } catch (error: any) {
    console.error("Lead Insights API Error:", error);
    return res.status(500).json({ error: error.message });
  }
}
