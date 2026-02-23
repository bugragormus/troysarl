// hooks/useFavorites.ts
import { useState, useEffect } from "react";
import toast from "react-hot-toast";

const STORAGE_KEY = "favoriteCars";

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);

  // LocalStorage'dan yükle (sadece client tarafında)
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    setFavorites(saved);
  }, []);

  const toggleFavorite = (carId: string) => {
    setFavorites((prev) => {
      const updated = prev.includes(carId)
        ? prev.filter((id) => id !== carId)
        : [...prev, carId];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      if (prev.includes(carId))
        toast.error("The car has been removed from favorites.");
      else toast.success("The car has been added to favorites.");
      return updated;
    });
  };

  const isFavorite = (carId: string) => favorites.includes(carId);

  return { favorites, toggleFavorite, isFavorite };
}
