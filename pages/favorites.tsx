import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import Head from "next/head";
import Car from "@/types/car";
import CarCard from "@/components/CarCard";
import { Trash2 } from "lucide-react";

export default function FavoritesPage() {
  const [cars, setCars] = useState<Car[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [visibleCars, setVisibleCars] = useState<Car[]>([]);
  const [page, setPage] = useState(1);
  const itemsPerPage = 6; // Sayfa başına gösterilecek araba sayısı

  useEffect(() => {
    // Favorileri localStorage'dan al
    const savedFavorites = JSON.parse(
      localStorage.getItem("favoriteCars") || "[]"
    );
    setFavorites(savedFavorites);

    if (savedFavorites.length > 0) {
      const fetchFavoriteCars = async () => {
        const { data, error } = await supabase
          .from("cars")
          .select("*")
          .in("id", savedFavorites);
        if (error) console.error("Error:", error);
        else {
          setCars(data || []);
          setVisibleCars(data?.slice(0, itemsPerPage) || []); // İlk sayfayı yükle
        }
      };

      fetchFavoriteCars();
    }
  }, []);

  // Favoriden araç kaldır
  const removeFavorite = (carId: string) => {
    const updatedFavorites = favorites.filter((id) => id !== carId);
    setFavorites(updatedFavorites);
    localStorage.setItem("favoriteCars", JSON.stringify(updatedFavorites));
    setCars((prevCars) => prevCars.filter((car) => car.id !== carId));
    setVisibleCars((prevVisibleCars) =>
      prevVisibleCars.filter((car) => car.id !== carId)
    );
  };

  // Tüm favorileri temizle
  const clearFavorites = () => {
    setFavorites([]);
    setCars([]);
    setVisibleCars([]);
    localStorage.removeItem("favoriteCars");
  };

  // Daha fazla araba yükle
  const loadMoreCars = () => {
    const nextPage = page + 1;
    const nextCars = cars.slice(0, nextPage * itemsPerPage);
    setVisibleCars(nextCars);
    setPage(nextPage);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gradient-to-b from-premium-light to-white transition-colors duration-300">
      <Head>
        <title>My Favorite Cars - Troysarl</title>
      </Head>

      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-blue-500">
            My Favorite Cars
          </h1>
          {cars.length > 0 && (
            <button
              onClick={clearFavorites}
              className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-700 text-white font-semibold rounded-full shadow-lg hover:scale-105 transition-transform duration-300 flex items-center space-x-2"
            >
              <span>Clear All Favorites</span>
              <Trash2 />
            </button>
          )}
        </div>

        {cars.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-300 text-lg text-center">
            You haven't added any favorite cars yet.
          </p>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {visibleCars.map((car) => (
                <CarCard
                  key={car.id}
                  car={car}
                  onRemove={removeFavorite} // Bu sayfada favori ikonu yerine çöp (remove) ikonu görünsün
                />
              ))}
            </div>

            {/* Load More Butonu */}
            {visibleCars.length < cars.length && (
              <div className="flex justify-center mt-8">
                <button
                  onClick={loadMoreCars}
                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white p-3 rounded-full hover:scale-105 transition-transform font-semibold"
                >
                  Load More
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
