import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import Head from "next/head";
import Car from "@/types/car";
import CarCard from "@/components/CarCard";
import { Trash2 } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import Script from "next/script";

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
          .eq("is_hidden", false)
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
    toast.error("The car has been removed from favorites.");
  };

  // Tüm favorileri temizle
  const clearFavorites = () => {
    setFavorites([]);
    setCars([]);
    setVisibleCars([]);
    localStorage.removeItem("favoriteCars");
    toast.error("All favorites have been cleared.");
  };

  // Daha fazla araba yükle
  const loadMoreCars = () => {
    const nextPage = page + 1;
    const nextCars = cars.slice(0, nextPage * itemsPerPage);
    setVisibleCars(nextCars);
    setPage(nextPage);
  };

  // SEO Meta Verileri - Favorites
  const metaTitle =
    "Your Favorite Cars - Troy Cars Lux Sarl - Premium Used Cars in Luxembourg 🇱🇺 | Vos voitures préférées - Troy Cars Lux Sarl - Voitures d'occasion haut de gamme au Luxembourg 🇱🇺 | Ihre Lieblingsautos - Troy Cars Lux Sarl - Premium-Gebrauchtwagen in Luxemburg 🇱🇺";

  const metaDescription =
    "Browse and manage your favorite cars. Troy Cars Lux Sarl offers premium used cars in Luxembourg. 🇱🇺 Consultez et gérez vos voitures préférées. Troy Cars Lux Sarl propose des voitures d'occasion haut de gamme au Luxembourg. 🇱🇺 Durchsuchen und verwalten Sie Ihre Lieblingsautos. Troy Cars Lux Sarl bietet Premium-Gebrauchtwagen in Luxemburg an. 🇱🇺";

  const canonicalUrl = "https://troysarl.com/favorites";
  const ogImageUrl = "https://troysarl.com/og-favorites.jpg";

  return (
    <div
      className="min-h-screen bg-white dark:bg-gradient-to-b from-premium-light to-white transition-colors duration-300"
      aria-label="Favorites Page"
    >
      <Toaster position="top-right" reverseOrder={false} />
      <Head>
        {/* Temel SEO Etiketleri */}
        <title>{metaTitle}</title>
        <meta name="description" content={metaDescription} />
        <link rel="canonical" href={canonicalUrl} />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:title" content={metaTitle} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:image" content={ogImageUrl} />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={metaTitle} />
        <meta name="twitter:description" content={metaDescription} />
        <meta name="twitter:image" content={ogImageUrl} />

        {/* Schema.org Markup */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: "Vehicle Catalog",
            description: metaDescription,
            url: canonicalUrl,
            image: ogImageUrl,
          })}
        </script>
      </Head>

      {/* Google Tag Manager */}
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
      />
      <Script id="gtag-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
        `}
      </Script>

      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1
            className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-blue-500"
            aria-label="Page Title"
          >
            My Favorite Cars
          </h1>
          {cars.length > 0 && (
            <button
              onClick={clearFavorites}
              className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-700 text-white font-semibold rounded-full shadow-lg hover:scale-105 transition-transform duration-300 flex items-center space-x-2"
              aria-label="Clear All Favorites"
            >
              <span>Clear All Favorites</span>
              <Trash2 />
            </button>
          )}
        </div>

        {cars.length === 0 ? (
          <p
            className="text-gray-600 dark:text-gray-300 text-lg text-center"
            aria-label="No Favorites Message"
          >
            You haven&apos;t added any favorite cars yet.
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
