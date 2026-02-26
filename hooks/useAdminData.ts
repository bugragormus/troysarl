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
  updated_at: string;
}

export interface FavoriteStat {
  car_id: string;
  count: number;
}

export interface PageViewStat {
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
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [hotLeads, setHotLeads] = useState<FavoriteStat[]>([]);
  const [trendingTraffic, setTrendingTraffic] = useState<PageViewStat[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAdminData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin-stats");
      if (!res.ok) {
         if (res.status === 401) {
            console.error("Unauthorized: Please log in again");
            return;
         }
         throw new Error("Failed to fetch admin data from secure API");
      }
      
      const { stats: newStats, profiles: newProfiles, cars: newCars, transactions: newTrans, hotLeads: newLeads, trendingTraffic: newTraffic } = await res.json();

      setStats(newStats);
      setProfiles(newProfiles || []);
      setCars(newCars || []);
      setTransactions(newTrans || []);
      setHotLeads(newLeads || []);
      setTrendingTraffic(newTraffic || []);
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
    transactions,
    hotLeads,
    trendingTraffic,
    loading,
    fetchAdminData
  };
}
