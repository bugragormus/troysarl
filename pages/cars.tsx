// pages/cars.tsx
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import Head from "next/head";
import Car from "@/types/car";
import { Filter, ArrowDown } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import CarCard from "@/components/CarCard";
import Script from "next/script";

const bodyTypeOptions = [
  "Sedan",
  "Coupe",
  "Hatchback",
  "Pickup",
  "Off-Road",
  "Sport",
  "Van",
  "Convertible",
  "Crossover",
  "SUV",
  "Station Wagon",
  "Muscle",
  "Roadster",
  "Cabriolet",
  "Compact",
];
const transmissionOptions = ["Automatic", "Manual", "Semi-Automatic"];
const doorOptions = ["3", "4", "5"];
const colorOptions = [
  "White",
  "Black",
  "Gray",
  "Silver",
  "Red",
  "Blue",
  "Other",
];

export default function CarsPage() {
  const [cars, setCars] = useState<Car[]>([]);
  const [sortOrder, setSortOrder] = useState("desc"); // varsayılan: yüksekten düşüğe
  const [showFilters, setShowFilters] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    listingType: "all",
    bodyType: "",
    fuelType: "",
    minPrice: "",
    maxPrice: "",
    minYear: "",
    maxYear: "",
    minMileage: "",
    maxMileage: "",
    features: [] as string[],
    transmission_type: "",
    doors: "",
    color: "",
  });

  useEffect(() => {
    const fetchCars = async () => {
      const { data, error } = await supabase
        .from("cars")
        .select("*")
        .eq("is_hidden", false);

      if (error) console.error("Error:", error);
      else setCars(data || []);
    };

    fetchCars();

    const savedFavorites = JSON.parse(
      localStorage.getItem("favoriteCars") || "[]"
    );
    setFavorites(savedFavorites);
  }, []);

  const toggleFavorite = (carId: string) => {
    let updatedFavorites = [...favorites];
    if (updatedFavorites.includes(carId)) {
      updatedFavorites = updatedFavorites.filter((id) => id !== carId);
      toast.error("The car has been removed from favorites.");
    } else {
      updatedFavorites.push(carId);
      toast.success("The car has been added to favorites.");
    }

    setFavorites(updatedFavorites);
    localStorage.setItem("favoriteCars", JSON.stringify(updatedFavorites));
  };

  const filteredCars = cars
    .filter((car) => {
      const matchesSearch =
        car.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        car.model.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesListingType =
        filters.listingType === "all" ||
        car.listing_type === filters.listingType ||
        (filters.listingType === "reserved" && car.listing_type === "reserved");

      const matchesBodyType =
        !filters.bodyType || car.body_type === filters.bodyType;
      const matchesFuelType =
        !filters.fuelType || car.fuel_type === filters.fuelType;

      const matchesPrice =
        (!filters.minPrice || car.price >= Number(filters.minPrice)) &&
        (!filters.maxPrice || car.price <= Number(filters.maxPrice));

      const matchesYear =
        (!filters.minYear || car.year >= Number(filters.minYear)) &&
        (!filters.maxYear || car.year <= Number(filters.maxYear));

      const matchesMileage =
        (!filters.minMileage || car.mileage >= Number(filters.minMileage)) &&
        (!filters.maxMileage || car.mileage <= Number(filters.maxMileage));

      const matchesFeatures =
        filters.features.length === 0 ||
        filters.features.every((feature) =>
          Object.values(car.features).flat().includes(feature)
        );

      const matchesTransmission =
        !filters.transmission_type ||
        car.transmission === filters.transmission_type;

      const matchesDoors =
        !filters.doors || car.doors === Number(filters.doors);

      const matchesColor =
        !filters.color ||
        car.color.toLowerCase() === filters.color.toLowerCase();

      return (
        matchesSearch &&
        matchesListingType &&
        matchesBodyType &&
        matchesFuelType &&
        matchesPrice &&
        matchesYear &&
        matchesMileage &&
        matchesFeatures &&
        matchesTransmission &&
        matchesDoors &&
        matchesColor
      );
    })
    .sort((a, b) => {
      if (a.listing_type === "sold" && b.listing_type !== "sold") return 1;
      if (a.listing_type !== "sold" && b.listing_type === "sold") return -1;
      // Fiyat sıralaması, sortOrder durumuna göre
      if (sortOrder === "desc") {
        return b.price - a.price;
      } else {
        return a.price - b.price;
      }
    });

  const resetFilters = () => {
    setFilters({
      listingType: "all",
      bodyType: "",
      fuelType: "",
      minPrice: "",
      maxPrice: "",
      minYear: "",
      maxYear: "",
      minMileage: "",
      maxMileage: "",
      features: [] as string[],
      transmission_type: "",
      doors: "",
      color: "",
    });
  };

  // SEO Meta Verileri
  const metaTitles = {
    en: "Buy Quality Used Cars in Luxembourg | Troy Cars SARL | Affordable Prices",
    fr: "Acheter des Voitures d'Occasion au Luxembourg | Luxembourg cars | Luxembourg car sale",
    de: "Gebrauchtwagen in Luxemburg kaufen | Troy Cars SARL | Günstige Preise",
  };
  const metaDescriptions = {
    en: "Find your next car at Troy Cars! Browse affordable used cars in Luxembourg. Financing options available. Visit us today!",
    fr: "Trouvez votre prochaine voiture chez Troy Cars! Découvrez des voitures d'occasion de qualité au Luxembourg. Options de financement disponibles.",
    de: "Finden Sie Ihr nächstes Auto bei Troy Cars! Entdecken Sie hochwertige Gebrauchtwagen in Luxemburg. Finanzierungsoptionen verfügbar.",
  };
  const canonicalUrl = "https://troysarl.com/cars";
  const ogImageUrl = "https://troysarl.com/og-cars.jpg";

  return (
    <div
      className="min-h-screen bg-white dark:bg-gradient-to-b from-premium-light to-white transition-colors duration-300"
      aria-label="Vehicle Catalog"
    >
      <Toaster position="top-right" reverseOrder={false} />
      <Head>
        <title>{metaTitles.fr}</title>
        <meta name="description" content={metaDescriptions.fr} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:title" content={metaTitles.fr} />
        <meta property="og:description" content={metaDescriptions.fr} />
        <meta property="og:image" content={ogImageUrl} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={metaTitles.fr} />
        <meta name="twitter:description" content={metaDescriptions.fr} />
        <meta name="twitter:image" content={ogImageUrl} />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: "Vehicle Catalog",
            description: metaDescriptions.fr,
            url: canonicalUrl,
            image: ogImageUrl,
            mainEntity: filteredCars.map((car) => ({
              "@type": "Car",
              name: `${car.brand} ${car.model}`,
              offers: {
                "@type": "Offer",
                priceCurrency: "EUR",
                price: car.price,
              },
            })),
          })}
        </script>
      </Head>

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

      <div className="container mx-auto p-4" aria-label="Cars">
        {/* Search Bar */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="🔍 Search by brand or model..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-3 rounded-xl border-2 border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm focus:ring-4 focus:ring-blue-300 focus:border-blue-500 transition-all"
            aria-label="Search vehicles"
          />
        </div>

        {/* Filter & Sort Controls */}
        {/* Sort Controls */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
          <div className="mt-4 md:mt-0 mb-4">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 hidden md:block">
                Sort by Price
              </h2>
              <div className="relative w-full md:w-auto">
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="w-full p-3 pr-10 bg-blue-600  px-4 py-2 hover:bg-blue-700 text-white rounded-lg appearance-none focus:outline-none transition-all"
                >
                  <option value="desc">High to Low</option>
                  <option value="asc">Low to High</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                  <ArrowDown
                    size={20}
                    strokeWidth={2}
                    className="h-5 w-5 mr-1"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 hidden md:block">
              Filters
            </h2>
            {/* Desktop Show/Hide Button */}
            <button
              onClick={() => setShowFilters((prev) => !prev)}
              className="p-3 hidden md:inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all"
            >
              {showFilters ? "Hide Filters" : "Show Filters"}
              <Filter size={20} strokeWidth={2} className="h-5 w-5 ml-2" />
            </button>
            {/* Mobile Button */}
            <button
              onClick={() => setShowFilters((prev) => !prev)}
              className="p-3 md:hidden pr-2 bg-blue-600 px-4 py-2 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center gap-2 flex-grow"
            >
              {showFilters ? "Hide Filters" : "Show Filters"}
              <Filter size={20} strokeWidth={2} />
            </button>
          </div>
        </div>

        {/* Filtreler */}
        <div className={`${showFilters ? "block" : "hidden"} mb-8`}>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700">
            <div className="flex flex-col gap-6">
              {/* İlk Filtre Grubu */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Listing Type */}
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Listing Type
                  </label>
                  <select
                    value={filters.listingType}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        listingType: e.target.value,
                      })
                    }
                    className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 transition-all"
                  >
                    <option value="all">All Listings</option>
                    <option value="sale">For Sale</option>
                    <option value="rental">For Rent</option>
                    <option value="reserved">Reserved</option>
                    <option value="sold">Sold</option>
                  </select>
                </div>

                {/* Body Type */}
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Body Type
                  </label>
                  <select
                    value={filters.bodyType}
                    onChange={(e) =>
                      setFilters({ ...filters, bodyType: e.target.value })
                    }
                    className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 transition-all"
                  >
                    <option value="">All Types</option>
                    {bodyTypeOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Transmission Type */}
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Transmission
                  </label>
                  <select
                    value={filters.transmission_type}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        transmission_type: e.target.value,
                      })
                    }
                    className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 transition-all"
                  >
                    <option value="">All</option>
                    {transmissionOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Doors */}
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Doors
                  </label>
                  <select
                    value={filters.doors}
                    onChange={(e) =>
                      setFilters({ ...filters, doors: e.target.value })
                    }
                    className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 transition-all"
                  >
                    <option value="">All</option>
                    {doorOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* İkinci Filtre Grubu */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Price Range */}
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Price (€)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.minPrice}
                      onChange={(e) =>
                        setFilters({ ...filters, minPrice: e.target.value })
                      }
                      className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.maxPrice}
                      onChange={(e) =>
                        setFilters({ ...filters, maxPrice: e.target.value })
                      }
                      className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                  </div>
                </div>

                {/* Year Range*/}
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Year
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.minYear}
                      onChange={(e) =>
                        setFilters({ ...filters, minYear: e.target.value })
                      }
                      className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.maxYear}
                      onChange={(e) =>
                        setFilters({ ...filters, maxYear: e.target.value })
                      }
                      className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                  </div>
                </div>

                {/* Mileage Range*/}
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Mileage (km)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.minMileage}
                      onChange={(e) =>
                        setFilters({
                          ...filters,
                          minMileage: e.target.value,
                        })
                      }
                      className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.maxMileage}
                      onChange={(e) =>
                        setFilters({
                          ...filters,
                          maxMileage: e.target.value,
                        })
                      }
                      className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                  </div>
                </div>

                {/* Color */}
                <div className="space-y-0.5">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Color
                  </label>
                  <select
                    value={filters.color}
                    onChange={(e) =>
                      setFilters({ ...filters, color: e.target.value })
                    }
                    className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 transition-all"
                  >
                    <option value="">All</option>
                    {colorOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Clear Button*/}
              <div className="flex justify-end">
                <button
                  onClick={resetFilters}
                  className="w-full md:w-auto px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg transition-colors flex items-center gap-2"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                  Clear Filters
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Araç Listesi */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCars.map((car) => (
            <article
              key={car.id}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-shadow flex flex-col h-full"
              itemScope
              itemType="https://schema.org/Car"
            >
              <CarCard
                key={car.id}
                car={car}
                onFavoriteToggle={toggleFavorite}
                isFavorite={favorites.includes(car.id)}
              />
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
