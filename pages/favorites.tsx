import { useEffect, useState, useMemo } from "react";
import { supabase } from "../lib/supabaseClient";
import Head from "next/head";
import Car from "@/types/car";
import CarCard from "@/components/CarCard";
import { Trash2, Loader2, Heart } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import Script from "next/script";
import Link from "next/link";
import { useFavorites } from "../hooks/useFavorites";

export default function FavoritesPage() {
  const { favorites, loading: favoritesLoading, toggleFavorite } = useFavorites();
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    const fetchFavoriteCars = async () => {
      if (favorites.length === 0) {
        setCars([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("cars")
          .select("*")
          .eq("is_hidden", false)
          .in("id", favorites);
        
        if (error) throw error;

        // Sort by listing_type and then price
        const sortedData = (data || []).sort((a, b) => {
          const listingOrder = { sale: 0, rental: 1, reserved: 2, sold: 3 };
          const typeComp = listingOrder[a.listing_type as keyof typeof listingOrder] - 
                          listingOrder[b.listing_type as keyof typeof listingOrder];
          if (typeComp !== 0) return typeComp;
          return b.price - a.price;
        });

        setCars(sortedData);
      } catch (error) {
        console.error("Error fetching vehicles:", error);
        toast.error("Failed to load favorite vehicles.");
      } finally {
        setLoading(false);
      }
    };

    if (!favoritesLoading) {
      fetchFavoriteCars();
    }
  }, [favorites, favoritesLoading]);

  const visibleCars = useMemo(() => {
    return cars.slice(0, page * itemsPerPage);
  }, [cars, page]);

  const removeFavorite = async (carId: string) => {
    await toggleFavorite(carId);
  };

  const clearFavorites = async () => {
    // Note: This would need a specific hook method or manual loop
    // For now, let's just toast and suggest individual removal or individual sync
    toast.error("Please remove items individually to ensure cloud sync.");
  };

  const loadMoreCars = () => {
    setPage(prev => prev + 1);
  };

  // SEO Meta Verileri - Favorites
  const metaTitle =
    "Your Favorite Cars - Troy Cars Lux Sarl - Premium Used Cars in Luxembourg 🇱🇺 | Vos voitures préférées - Troy Cars Lux Sarl - Voitures d'occasion haut de gamme au Luxembourg 🇱🇺 | Ihre Lieblingsautos - Troy Cars Lux Sarl - Premium-Gebrauchtwagen in Luxemburg 🇱🇺";

  const metaDescription =
    "Browse and manage your favorite cars. Troy Cars Lux Sarl offers premium used cars in Luxembourg. 🇱🇺 Consultez et gérez vos voitures préférées. Troy Cars Lux Sarl propose des voitures d'occasion haut de gamme au Luxembourg. 🇱🇺 Durchsuchen und verwalten Sie Ihre Lieblingsautos. Troy Cars Lux Sarl bietet Premium-Gebrauchtwagen in Luxemburg an. 🇱🇺";

  const canonicalUrl = "https://troysarl.com/favorites";
  const ogImageUrl = "https://troysarl.com/troysarl-logo.png";

  return (
    <div
      className="min-h-screen bg-white dark:bg-gradient-to-b from-premium-light to-premium-dark transition-colors duration-300"
      aria-label="Favorites Page"
    >
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

        {(favoritesLoading || loading) ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
            <p className="text-gray-500 font-medium">Syncing your collection...</p>
          </div>
        ) : cars.length === 0 ? (
          <div className="text-center py-20 px-4">
             <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="w-10 h-10 text-gray-300" />
             </div>
             <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">No Favorites Yet</h2>
             <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-sm mx-auto">
                Explore our collection and click the heart icon to save the cars you love.
             </p>
             <Link href="/cars" className="px-8 py-3 bg-blue-600 text-white rounded-full font-bold shadow-lg hover:bg-blue-700 transition-all">
                Browse Cars
             </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeIn">
              {visibleCars.map((car) => (
                <CarCard
                  key={car.id}
                  car={car}
                  onRemove={removeFavorite}
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
