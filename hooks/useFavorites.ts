import { useState, useEffect } from "react";
import Car from "@/types/car";
import toast from "react-hot-toast";
import * as Sentry from "@sentry/react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "./useAuth";

export function useFavorites() {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Load initial favorites
  useEffect(() => {
    const loadFavorites = async () => {
      setLoading(true);
      if (user) {
        // Cloud Sync: Fetch from Supabase
        try {
          const { data, error } = await supabase
            .from("user_favorites")
            .select("car_id")
            .eq("user_id", user.id);

          if (error) throw error;
          setFavorites(data.map((fav: any) => fav.car_id));
        } catch (error) {
          console.error("Error fetching cloud favorites:", error);
          Sentry.captureException(error);
        }
      } else {
        // Fallback to LocalStorage for guests
        try {
          const savedFavorites = localStorage.getItem("favorites");
          if (savedFavorites) {
            setFavorites(JSON.parse(savedFavorites));
          }
        } catch (error) {
          console.error("Error loading local favorites:", error);
        }
      }
      setLoading(false);
    };

    loadFavorites();
  }, [user]);

  const toggleFavorite = async (carId: string) => {
    const isCurrentlyFavorite = favorites.includes(carId);
    
    // Optimistic Update
    const newFavorites = isCurrentlyFavorite
      ? favorites.filter((id) => id !== carId)
      : [...favorites, carId];
    
    setFavorites(newFavorites);

    if (user) {
      // Cloud Sync
      try {
        if (isCurrentlyFavorite) {
          await supabase
            .from("user_favorites")
            .delete()
            .match({ user_id: user.id, car_id: carId });
        } else {
          await supabase
            .from("user_favorites")
            .insert({ user_id: user.id, car_id: carId });
        }
      } catch (error) {
        console.error("Error syncing favorite to cloud:", error);
        toast.error("Cloud sync failed, using local temporary state.");
        // Revert on error if needed, but for now we keep the local state
      }
    } else {
      // Local Only
      localStorage.setItem("favorites", JSON.stringify(newFavorites));
    }

    if (isCurrentlyFavorite) {
      toast.error("Removed from favorites", { icon: "😢" });
    } else {
      toast.success("Added to favorites!", { icon: "❤️" });
    }
  };

  const handleShare = async (car: Car) => {
    const url = `${window.location.origin}/cars/${car.id}`;
    const text = `Check out this ${car.brand} ${car.model} on Troy Cars!`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: "Troy Cars - Vehicle Details",
          text: text,
          url: url,
        });
        toast.success("Eylem paylaşıldı!");
      } else {
        await navigator.clipboard.writeText(`${text} ${url}`);
        toast.success("Link panoya kopyalandı!");
      }
    } catch (error: any) {
      if (error.name !== "AbortError") {
        console.error("Error sharing:", error);
        Sentry.captureException(error);
        toast.error("Paylaşım sırasında bir hata oluştu.");
      }
    }
  };

  return { favorites, toggleFavorite, handleShare, loading };
}
