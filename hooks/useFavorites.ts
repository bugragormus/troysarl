import { useState, useEffect } from "react";
import Car from "@/types/car";
import toast from "react-hot-toast";
import * as Sentry from "@sentry/react";

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    try {
      const savedFavorites = localStorage.getItem("favorites");
      if (savedFavorites) {
        setFavorites(JSON.parse(savedFavorites));
      }
    } catch (error) {
      console.error("Error loading favorites from localStorage", error);
    }
  }, []);

  const toggleFavorite = (carId: string) => {
    try {
      const newFavorites = favorites.includes(carId)
        ? favorites.filter((id) => id !== carId)
        : [...favorites, carId];
        
      setFavorites(newFavorites);
      localStorage.setItem("favorites", JSON.stringify(newFavorites));
      
      if (favorites.includes(carId)) {
        toast.error("Removed from favorites", { icon: "😢" });
      } else {
        toast.success("Added to favorites!", { icon: "❤️" });
      }
    } catch (error) {
      console.error("Error toggling favorite", error);
      toast.error("Failed to update favorites");
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

  return { favorites, toggleFavorite, handleShare };
}
