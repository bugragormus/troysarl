// pages/cars.tsx
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import Head from "next/head";
import Car from "@/types/car";
import { Filter, ArrowDown, X } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import CarCard from "@/components/CarCard";
import CarSkeleton from "@/components/CarSkeleton";
import {
  bodyTypeOptions,
  transmissionOptions,
  doorOptions,
  colorOptions,
} from "@/lib/constants";
import { useFavorites } from "@/hooks/useFavorites";


export default function CarsPage() {
  const [cars, setCars] = useState<Car[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState("desc");
  const [showFilters, setShowFilters] = useState(false);
  const { favorites, toggleFavorite } = useFavorites();
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
      setIsLoading(true);
      setError(null);

      let query = supabase
        .from("cars")
        .select("*")
        .eq("is_hidden", false);

      // Listing type
      if (filters.listingType !== "all") {
        query = query.eq("listing_type", filters.listingType);
      }

      // Body type
      if (filters.bodyType) query = query.eq("body_type", filters.bodyType);

      // Fuel type
      if (filters.fuelType) query = query.eq("fuel_type", filters.fuelType);

      // Transmission
      if (filters.transmission_type)
        query = query.eq("transmission", filters.transmission_type);

      // Doors
      if (filters.doors) query = query.eq("doors", Number(filters.doors));

      // Color
      if (filters.color) query = query.ilike("color", filters.color);

      // Price range
      if (filters.minPrice) query = query.gte("price", Number(filters.minPrice));
      if (filters.maxPrice) query = query.lte("price", Number(filters.maxPrice));

      // Mileage range
      if (filters.minMileage) query = query.gte("mileage", Number(filters.minMileage));
      if (filters.maxMileage) query = query.lte("mileage", Number(filters.maxMileage));

      // Year range — veritabanında ISO date string olarak tutuluyor
      if (filters.minYear)
        query = query.gte("year", `${filters.minYear}-01-01`);
      if (filters.maxYear)
        query = query.lte("year", `${filters.maxYear}-12-31`);

      const { data, error } = await query;

      if (error) {
        console.error("Error:", error);
        setError("Failed to load vehicles. Please try again.");
        toast.error("Failed to load vehicles.");
      } else {
        setCars(data || []);
      }
      setIsLoading(false);
    };

    fetchCars();
  }, [filters]);


  const filteredCars = cars
    .filter((car) => {
      const matchesSearch =
        !searchTerm ||
        car.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        car.model.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesFeatures =
        filters.features.length === 0 ||
        filters.features.every((feature) =>
          Object.values(car.features).flat().includes(feature)
        );

      return matchesSearch && matchesFeatures;
    })
    .sort((a, b) => {
      // 1. Manuel Sıralama İndeksi (Küçük olan üstte)
      const indexA = a.display_index ?? 999;
      const indexB = b.display_index ?? 999;
      
      if (indexA !== indexB) {
        return indexA - indexB; // Ascending order
      }

      // 2. Listing type sıralaması (Aynı index'e sahip araçlar kendi içinde durumlarına göre sıralanır)
      const listingOrder = {
        sale: 0,
        rental: 1,
        reserved: 2,
        sold: 3,
      };

      const typeComparison =
        listingOrder[a.listing_type as keyof typeof listingOrder] - listingOrder[b.listing_type as keyof typeof listingOrder];
      if (typeComparison !== 0) return typeComparison;

      // 3. Fiyat veya Eklenme Tarihi sıralaması (Kullanıcının seçimine göre)
      // Since created_at is optional, we fall back to price if not available, or just sortOrder for price.
      return sortOrder === "desc" ? (b.price || 0) - (a.price || 0) : (a.price || 0) - (b.price || 0);
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
    en: "Premium Luxury Vehicles Luxembourg | Troy Cars SARL",
    fr: "Voitures de Luxe au Luxembourg | Troy Cars SARL",
    de: "Luxusautos in Luxemburg Kaufen | Troy Cars SARL",
  };
  const metaDescriptions = {
    en: "Explore our certified collection of premium used cars and luxury vehicles in Luxembourg. Flexible financing options available at Troy Cars SARL.",
    fr: "Découvrez des voitures d'occasion de qualité et de luxe au Luxembourg. Options de financement disponibles chez Troy Cars SARL.",
    de: "Entdecken Sie hochwertige Gebrauchtwagen und Luxusautos in Luxemburg. Flexible Finanzierungsoptionen verfügbar bei Troy Cars SARL.",
  };
  const canonicalUrl = "https://troysarl.com/cars";
  const ogImageUrl = "https://troysarl.com/troysarl-logo.png";

  return (
    <div
      className="min-h-screen bg-white dark:bg-gradient-to-b from-premium-light to-premium-dark transition-colors duration-300"
      aria-label="Vehicle Catalog"
    >
      <Head>
        <title>{metaTitles.en}</title>
        <meta name="description" content={metaDescriptions.en} />
        <link rel="canonical" href={canonicalUrl} />
        <link rel="alternate" href={canonicalUrl} hrefLang="en-LU" />
        <link rel="alternate" href={canonicalUrl} hrefLang="fr-LU" />
        <link rel="alternate" href={canonicalUrl} hrefLang="de-LU" />
        <link rel="alternate" href={canonicalUrl} hrefLang="x-default" />
        <meta name="author" content="Troy Cars SARL" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:title" content={metaTitles.en} />
        <meta property="og:description" content={metaDescriptions.en} />
        <meta property="og:image" content={ogImageUrl} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={metaTitles.en} />
        <meta name="twitter:description" content={metaDescriptions.en} />
        <meta name="twitter:image" content={ogImageUrl} />
        {/* JSON‑LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
              {
                "@context": "https://schema.org",
                "@type": "BreadcrumbList",
                "itemListElement": [
                  {
                    "@type": "ListItem",
                    "position": 1,
                    "name": "Home",
                    "item": "https://troysarl.com"
                  },
                  {
                    "@type": "ListItem",
                    "position": 2,
                    "name": "Cars",
                    "item": canonicalUrl
                  }
                ]
              },
              {
                "@context": "https://schema.org",
                "@type": "Organization",
                "name": "Troy Cars Lux SARL",
                "url": "https://troysarl.com",
                "logo": "https://troysarl.com/troysarl-logo.png"
              },
              {
                "@context": "https://schema.org",
                "@type": ["CollectionPage", "ItemList"],
                "name": "Premium Luxury & Used Cars Catalog | Troy Cars Lux SARL",
                "description": metaDescriptions.en,
                "url": canonicalUrl,
                "image": ogImageUrl,
                "itemListElement": filteredCars.map((car, index) => ({
                  "@type": "ListItem",
                  "position": index + 1,
                  "item": {
                    "@type": "Car",
                    "name": `${car.brand} ${car.model} (${car.year})`,
                    "url": `https://troysarl.com/cars/${car.id}`,
                    "image": car.photos.length > 0 ? `https://troysarl.com${car.photos[0]}` : ogImageUrl,
                    "offers": {
                      "@type": "Offer",
                      "priceCurrency": "EUR",
                      "price": Number(String(car.price).replace(/[^0-9.-]+/g, "")) || 0,
                      "availability": car.listing_type === "sold" ? "https://schema.org/OutOfStock" : "https://schema.org/InStock"
                    }
                  }
                }))
              },
              {
                "@context": "https://schema.org",
                "@type": "FAQPage",
                "mainEntity": [
                  {
                    "@type": "Question",
                    "name": "Can I view the vehicles in person?",
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text": "Yes, our dedicated showroom in Luxembourg is open for personal visits during regular business hours. We strongly recommend scheduling an appointment in advance so our staff can prepare the desired vehicles and assist you properly with a comprehensive, uninterrupted viewing experience according to your preferences."
                    }
                  },
                  {
                    "@type": "Question",
                    "name": "Are the listed cars ready for immediate delivery?",
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text": "Absolutely. Once the payment process is verified and all necessary administrative paperwork is properly sorted, the vast majority of our premium vehicles are fully prepared and ready to be driven directly off the showroom floor without any unnecessary delays or prolonged waiting periods."
                    }
                  },
                  {
                    "@type": "Question",
                    "name": "Can I test drive a vehicle before deciding to buy?",
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text": "Yes, we highly encourage test drives to ensure complete satisfaction. Please contact our sales team to carefully schedule an appointment in advance. This allows us to have the specific car thoroughly prepared, cleaned, and completely ready for your personal evaluation on the road."
                    }
                  }
                ]
              },
              {
                "@context": "https://schema.org",
                "@type": "Article",
                "headline": "Browse Premium Luxury Vehicles in Luxembourg",
                "about": {
                  "@type": "Thing",
                  "name": "Premium Luxury Vehicles"
                },
                "mentions": [
                  { "@type": "Organization", "name": "Troy Cars Lux SARL" },
                  { "@type": "Thing", "name": "Used Cars Luxembourg" }
                ],
                "author": {
                  "@type": "Organization",
                  "name": "Troy Cars Lux SARL"
                },
                "publisher": {
                  "@type": "Organization",
                  "name": "Troy Cars Lux SARL"
                }
              },
              {
                "@context": "https://schema.org",
                "@type": "HowTo",
                "name": "How to Buy a Used Car from Troy Cars",
                "description": "A simple step-by-step guide to purchasing your premium vehicle in Luxembourg.",
                "step": [
                  {
                    "@type": "HowToStep",
                    "name": "Browse our Catalog",
                    "text": "Explore our certified collection of premium used cars and luxury vehicles online using our advanced filters."
                  },
                  {
                    "@type": "HowToStep",
                    "name": "Schedule an Appointment",
                    "text": "Contact us to arrange a personal visit to our showroom for a test drive and thorough vehicle inspection."
                  },
                  {
                    "@type": "HowToStep",
                    "name": "Complete Purchase and Delivery",
                    "text": "Finalize the specific payment terms and administrative paperwork. Most vehicles are ready to be driven off the showroom floor immediately."
                  }
                ]
              }
            ])
          }}
        />
    </Head>

      <div className="container mx-auto p-4" aria-label="Cars">
        {/* SEO H1 */}
        <h1 className="sr-only">Premium Luxury and Used Cars in Luxembourg - Troy Cars Lux SARL</h1>

        {/* AEO: Key Takeaways (Hidden by default for UX, exposed for SEO) */}
        <details className="group mb-8 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden cursor-pointer shadow-sm hover:shadow-md transition-shadow" aria-label="Catalog Summary">
          <summary className="p-4 list-none flex justify-between items-center focus:outline-none">
            <span className="text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Catalog Summary & Tips</span>
            <svg className="w-5 h-5 text-gray-500 transform group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </summary>
          <div className="p-5 pt-0 mt-2 border-t border-gray-100 dark:border-gray-700 cursor-auto">
            <h2 className="sr-only">Key Takeaways</h2>
            <ul className="list-disc list-inside space-y-2 text-sm text-gray-600 dark:text-gray-300">
              <li>Explore our curated inventory of certified used cars located in Luxembourg.</li>
              <li>Use our advanced filters to sort by brand, transmission, and mileage.</li>
              <li>Every listed vehicle has passed rigorous quality and safety inspections.</li>
            </ul>
          </div>
        </details>

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
        <h2 className="sr-only">Available Vehicles</h2>
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <CarSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-16 text-red-500 dark:text-red-400">
            <p className="text-lg font-semibold">Failed to load vehicles.</p>
            <p className="text-sm mt-2">Please try refreshing the page.</p>
          </div>
        ) : filteredCars.length === 0 ? (
          <div className="text-center py-16 text-gray-500 dark:text-gray-400">
            <p className="text-lg font-semibold">No vehicles found.</p>
            <p className="text-sm mt-2">Try adjusting your filters.</p>
          </div>
        ) : (
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
        )}

        {/* AEO: Bottom Content Hierarchy (Accordion for UX) */}
        <details className="group mt-16 cursor-pointer border-t border-gray-200 dark:border-gray-700 rounded-b-xl">
          <summary className="py-8 list-none flex justify-between items-center focus:outline-none hover:opacity-80 transition-opacity">
            <span className="text-xl font-bold text-gray-800 dark:text-gray-100">Information, FAQ & Statistics</span>
            <svg className="w-6 h-6 text-gray-500 transform group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </summary>
          <div className="pt-8 pb-16 space-y-16 border-t border-gray-100 dark:border-gray-700 cursor-auto">
          {/* Statistics Block */}
          <section aria-label="Catalog Statistics">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100 text-center">Catalog By the Numbers</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-3xl font-extrabold text-blue-500">100%</p>
                <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">Verified Condition</p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-3xl font-extrabold text-blue-500">1</p>
                <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">Showroom Location</p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-3xl font-extrabold text-blue-500">Fast</p>
                <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">Financing Options</p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-3xl font-extrabold text-blue-500">24/7</p>
                <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">Digital Catalog</p>
              </div>
            </div>
          </section>

          {/* Listicle Format */}
          <section aria-label="Selecting a Vehicle">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100">Top 3 Criteria When Browsing Our Cars</h2>
            <ol className="list-decimal list-inside space-y-4 text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-8 rounded-xl">
              <li>
                <strong>Verify Mileage and Usage:</strong> Evaluate the odometer reading compared to the vehicle's manufacturing year to gauge exact structural wear.
              </li>
              <li>
                <strong>Check Transmission Preferences:</strong> Ensure you are filtering specifically for automatic or manual depending on your Luxembourg commuting routes.
              </li>
              <li>
                <strong>Review Feature Sheets:</strong> Look closely at the detailed feature cards to guarantee your essential comfort levels are met.
              </li>
            </ol>
          </section>

          {/* FAQ Section */}
          <section aria-label="Catalog Frequently Asked Questions">
            <h2 className="text-2xl font-bold mb-8 text-gray-800 dark:text-gray-100 text-center">Frequently Asked Questions</h2>
            <div className="grid gap-8 md:grid-cols-3">
              <article>
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-2">Can I view the vehicles in person?</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Yes, our dedicated showroom in Luxembourg is open for personal visits during regular business hours. We strongly recommend scheduling an appointment in advance so our staff can prepare the desired vehicles and assist you properly with a comprehensive, uninterrupted viewing experience according to your preferences.
                </p>
              </article>
              <article>
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-2">Are the listed cars ready for immediate delivery?</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Absolutely. Once the payment process is verified and all necessary administrative paperwork is properly sorted, the vast majority of our premium vehicles are fully prepared and ready to be driven directly off the showroom floor without any unnecessary delays or prolonged waiting periods.
                </p>
              </article>
              <article>
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-2">Can I test drive a vehicle before deciding to buy?</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Yes, we highly encourage test drives to ensure complete satisfaction. Please contact our sales team to carefully schedule an appointment in advance. This allows us to have the specific car thoroughly prepared, cleaned, and completely ready for your personal evaluation on the road.
                </p>
              </article>
            </div>
          </section>

          {/* References Section */}
          <section aria-label="References and Sources">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100">Sources & References</h2>
            <ul className="list-disc list-inside space-y-4 text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-8 rounded-xl">
              <li>
                According to the <a href="https://snca.public.lu/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Société Nationale de Circulation Automobile (SNCA)</a>, thorough technical inspections (Contrôle Technique) are strictly mandatory for ensuring ongoing road safety and regulatory compliance.
              </li>
              <li>
                A comprehensive study by the <cite>Luxembourg Automobile Club (ACL)</cite> found that thorough pre-purchase vehicle inspections significantly increase long-term vehicle reliability and overall safety by up to 40%.
              </li>
            </ul>
          </section>

          </div>
        </details>
      </div>
    </div>
  );
}
