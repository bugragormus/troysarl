import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import Link from "next/link";
import Head from "next/head";
import Car from "@/types/car";
import { format } from "date-fns";
import { Trash2, Trash } from "lucide-react";

export default function FavoritesPage() {
  const [cars, setCars] = useState<Car[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);

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
        else setCars(data || []);
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
  };

  // Tüm favorileri temizle
  const clearFavorites = () => {
    setFavorites([]);
    setCars([]);
    localStorage.removeItem("favoriteCars");
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cars.map((car) => (
              <div
                key={car.id}
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-2xl transition-shadow flex flex-col h-full"
              >
                <div className="relative h-48 w-full">
                  <img
                    src={car.photos[0]}
                    alt={`${car.brand} ${car.model}`}
                    className="w-full h-full object-cover rounded-t-xl"
                  />
                  <button
                    onClick={() => removeFavorite(car.id)}
                    className="absolute top-3 right-3 p-2 rounded-full shadow-md bg-red-500 text-white transition-all duration-300 hover:bg-red-600 scale-110"
                  >
                    <Trash size={20} strokeWidth={2} />
                  </button>
                </div>

                <div className="p-4 flex flex-col flex-grow">
                  <h3 className="text-xl text-gray-800 dark:text-gray-100 truncate">
                    <span className="font-bold">{car.brand}</span> {car.model}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mt-1">
                    {format(new Date(car.year), "dd.MM.yyyy")} • {car.body_type}
                  </p>

                  <div className="flex justify-between items-center mt-4">
                    <div>
                      {car.listing_type === "rental" ? (
                        <span className="px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded-full">
                          Rental
                        </span>
                      ) : car.listing_type === "sale" ? (
                        <span className="px-2 py-1 text-xs font-semibold bg-green-100 text-green-800 rounded-full">
                          Sale
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-semibold bg-purple-100 text-purple-800 rounded-full">
                          Sale/Rental
                        </span>
                      )}
                    </div>
                    <div className="min-h-[2.5rem] flex items-center">
                      {car.listing_type !== "rental" && car.price ? (
                        <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                          €{car.price.toLocaleString()}
                        </p>
                      ) : (
                        <div className="h-8"></div>
                      )}
                    </div>
                  </div>

                  <Link
                    href={`/cars/${car.id}`}
                    className="block mt-4 text-center bg-green-500 text-white py-2 rounded-full hover:bg-green-600 transition"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
