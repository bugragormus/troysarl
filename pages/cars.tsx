// pages/cars.tsx
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import Head from "next/head";
import Car from "@/types/car";
import { Filter, ArrowDown, X } from "lucide-react";
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

      // İlk olarak car.year'i tam yıl sayısına çeviriyoruz
      const carYear = new Date(car.year).getFullYear();

      // Input'lardan gelen değerleri kontrol edip, boşsa undefined yapıyoruz
      const minYear = filters.minYear.trim()
        ? Number(filters.minYear)
        : undefined;
      const maxYear = filters.maxYear.trim()
        ? Number(filters.maxYear)
        : undefined;

      // Son olarak, karşılaştırmayı carYear üzerinden yapıyoruz
      const matchesYear =
        (minYear === undefined || carYear >= minYear) &&
        (maxYear === undefined || carYear <= maxYear);

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
      // 1. Önce exclusive araçları en üste al
      if (a.is_exclusive && !b.is_exclusive) return -1;
      if (!a.is_exclusive && b.is_exclusive) return 1;

      // 2. Listing type sıralaması
      const listingOrder = {
        sale: 0,
        rental: 1,
        reserved: 2,
        sold: 3,
      };

      const typeComparison =
        listingOrder[a.listing_type] - listingOrder[b.listing_type];
      if (typeComparison !== 0) return typeComparison;

      // 3. Fiyat sıralaması (exclusive olmayanlar için)
      if (!a.is_exclusive && !b.is_exclusive) {
        return sortOrder === "desc" ? b.price - a.price : a.price - b.price;
      }
      return 0;
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
        {/* JSON‑LD Structured Data */}
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
              vehicleModelDate: new Date(car.year).getFullYear().toString(), // Yılı ISO formatında al
              itemCondition:
                car.listing_type === "sold"
                  ? "https://schema.org/UsedCondition"
                  : "https://schema.org/NewCondition",
              numberOfDoors: car.doors,
              vehicleTransmission:
                car.transmission === "automatic"
                  ? "AutomaticTransmission"
                  : "ManualTransmission", // Schema.org uyumlu
              color: car.color,
              brand: {
                "@type": "Brand",
                name: car.brand,
              },
              model: car.model,
              image: car.photos.map((photo) => `${photo}`), // Mutlak URL sağla
              bodyType: car.body_type,
              vehicleEngine: {
                "@type": "EngineSpecification",
                fuelType:
                  car.fuel_type.toLowerCase() === "diesel"
                    ? "https://schema.org/DieselFuel"
                    : "https://schema.org/Gasoline", // Doğru fuelType değerleri
              },
              vehicleSeatingCapacity: 5,
              vehicleIdentificationNumber: "UNKNOWNVIN1234567",
              mileageFromOdometer: {
                "@type": "QuantitativeValue",
                value: car.mileage,
                unitCode: "KMT", // KMH -> KMT olarak düzeltildi
              },
              offers: {
                "@type": "Offer",
                priceCurrency: "EUR",
                price: Number(String(car.price).replace(/[^0-9.-]+/g, "")) || 0, // Sayısal değer garantisi
                availability:
                  car.listing_type === "sold"
                    ? "https://schema.org/OutOfStock"
                    : "https://schema.org/InStock",
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
        {/* Filter & Sort Controls */}
        {/* Sort Controls */}
        <div className="mb-8 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          {/* Arama Çubuğu */}
          <div className="mb-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by brand, model or keyword..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-4 pl-12 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm"
                aria-label="Search vehicles"
              />
              <svg
                className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>

          {/* Filtre ve Sıralama Kontrolleri */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            {/* Sonuç Sayısı */}
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Showing {filteredCars.length} of {cars.length} vehicles
            </div>

            {/* Kontrol Butonları */}
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              {/* Sıralama */}
              <div className="relative flex-1 md:flex-none">
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="w-full p-3 pr-10 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-100 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm"
                >
                  <option value="desc">Price: High to Low</option>
                  <option value="asc">Price: Low to High</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                  <ArrowDown
                    size={18}
                    className="text-gray-500 dark:text-gray-400"
                  />
                </div>
              </div>

              {/* Filtre Butonu */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center justify-center gap-2 p-3 rounded-lg transition-colors ${
                  showFilters
                    ? "bg-blue-600 text-white"
                    : "bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600"
                }`}
              >
                <Filter size={18} />
                <span>{showFilters ? "Hide Filters" : "Show Filters"}</span>
              </button>
            </div>
          </div>

          {/* Filtreler */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Listing Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Listing Type
                  </label>
                  <select
                    value={filters.listingType}
                    onChange={(e) =>
                      setFilters({ ...filters, listingType: e.target.value })
                    }
                    className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 transition-all"
                  >
                    <option value="all">All Listings</option>
                    <option value="sale">For Sale</option>
                    <option value="reserved">Reserved</option>
                    <option value="sold">Sold</option>
                  </select>
                </div>

                {/* Body Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Body Type
                  </label>
                  <select
                    value={filters.bodyType}
                    onChange={(e) =>
                      setFilters({ ...filters, bodyType: e.target.value })
                    }
                    className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 transition-all"
                  >
                    <option value="">All Types</option>
                    {bodyTypeOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Price Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Price Range (€)
                  </label>
                  <div className="flex gap-3">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.minPrice}
                      onChange={(e) =>
                        setFilters({ ...filters, minPrice: e.target.value })
                      }
                      className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.maxPrice}
                      onChange={(e) =>
                        setFilters({ ...filters, maxPrice: e.target.value })
                      }
                      className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                  </div>
                </div>

                {/* Year Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Year
                  </label>
                  <div className="flex gap-3">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.minYear}
                      onChange={(e) =>
                        setFilters({ ...filters, minYear: e.target.value })
                      }
                      className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.maxYear}
                      onChange={(e) =>
                        setFilters({ ...filters, maxYear: e.target.value })
                      }
                      className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* İkinci Filtre Satırı */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-4">
                {/* Transmission */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
                    className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 transition-all"
                  >
                    <option value="">All Types</option>
                    {transmissionOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Mileage */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Mileage (km)
                  </label>
                  <div className="flex gap-3">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.minMileage}
                      onChange={(e) =>
                        setFilters({ ...filters, minMileage: e.target.value })
                      }
                      className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.maxMileage}
                      onChange={(e) =>
                        setFilters({ ...filters, maxMileage: e.target.value })
                      }
                      className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                  </div>
                </div>

                {/* Doors */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Doors
                  </label>
                  <select
                    value={filters.doors}
                    onChange={(e) =>
                      setFilters({ ...filters, doors: e.target.value })
                    }
                    className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 transition-all"
                  >
                    <option value="">All</option>
                    {doorOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Color */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Color
                  </label>
                  <select
                    value={filters.color}
                    onChange={(e) =>
                      setFilters({ ...filters, color: e.target.value })
                    }
                    className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 transition-all"
                  >
                    <option value="">All Colors</option>
                    {colorOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Filtre Temizleme */}
              <div className="flex justify-end mt-6">
                <button
                  onClick={resetFilters}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 transition-colors"
                >
                  <X size={16} />
                  Clear all filters
                </button>
              </div>
            </div>
          )}
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
