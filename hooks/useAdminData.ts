import { useState, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import Car from "@/types/car";
import { Transaction } from "@/types/transaction";

export interface AdminStats {
  totalCars: number;
  liveListings: number;
  totalUsers: number;
  totalRevenue: number;
  totalProfit: number;
  marketingOptInCount: number;
}

export interface UserProfile {
  id: string;
  full_name: string | null;
  phone: string | null;
  marketing_consent: boolean;
  price_drop_alerts: boolean;
  new_arrival_alerts: boolean;
  created_at: string;
}

export interface FavoriteStat {
  car_id: string;
  count: number;
}

export function useAdminData() {
  const [stats, setStats] = useState<AdminStats>({
    totalCars: 0,
    liveListings: 0,
    totalUsers: 0,
    totalRevenue: 0,
    totalProfit: 0,
    marketingOptInCount: 0,
  });
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [cars, setCars] = useState<Car[]>([]);
  const [hotLeads, setHotLeads] = useState<FavoriteStat[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAdminData = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Fetch Cars
      const { data: carsData, error: carsError } = await supabase.from("cars").select("*");
      if (carsError) throw carsError;

      // 2. Fetch Transactions
      const { data: transactions, error: transError } = await supabase.from("transactions").select("*");
      if (transError) throw transError;

      // 3. Fetch Profiles
      const { data: userProfiles, error: profError } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });
      if (profError) throw profError;

      // 4. Fetch Favorites for "Hot Leads"
      const { data: favoritesData, error: favError } = await supabase
        .from("user_favorites")
        .select("car_id");
      
      if (favError) throw favError;

      const typedCars = (carsData || []) as Car[];
      const typedTrans = (transactions || []) as Transaction[];
      const typedProfiles = (userProfiles || []) as UserProfile[];

      const revenue = typedTrans.reduce((sum, t) => sum + (t.total_price || 0), 0);
      const profit = typedTrans.reduce((sum, t) => {
          const buyPrice = t.purchase_amount || 0;
          return sum + (t.total_price - buyPrice);
      }, 0);

      // Aggregate favorites
      const favCounts: { [key: string]: number } = {};
      favoritesData?.forEach(f => {
        favCounts[f.car_id] = (favCounts[f.car_id] || 0) + 1;
      });
      
      const sortedLeads = Object.entries(favCounts)
        .map(([car_id, count]) => ({ car_id, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      setStats({
        totalCars: typedCars.length,
        liveListings: typedCars.filter(c => c.listing_type !== 'sold').length,
        totalUsers: typedProfiles.length,
        totalRevenue: revenue,
        totalProfit: profit,
        marketingOptInCount: typedProfiles.filter(p => p.marketing_consent).length,
      });

      setProfiles(typedProfiles);
      setCars(typedCars);
      setHotLeads(sortedLeads);
    } catch (error) {
      console.error("Admin data fetch error:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    stats,
    profiles,
    cars,
    hotLeads,
    loading,
    fetchAdminData
  };
}
