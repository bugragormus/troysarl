// pages/cars.tsx
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import Link from "next/link";
import Head from "next/head";
import Image from "next/image";
import Car from "@/types/car";
import { Heart } from "lucide-react";
import { format } from "date-fns";
import toast, { Toaster } from "react-hot-toast";
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
  const metaTitle =
    "Troy Cars - Premium Luxury & Used Cars in Luxembourg | Vehicle Catalog | Cars for Sale or Rent | Troy Cars SARL | Troysarl Luxembourg | Troy Cars - Voitures de luxe et d'occasion haut de gamme au Luxembourg | Catalogue de véhicules | Voitures à vendre ou à louer | Troy Cars SARL | Troysarl Luxembourg | Troy Cars - Premium-Luxus- und Gebrauchtwagen in Luxemburg | Fahrzeugkatalog | Autos zum Verkauf oder zur Miete | Troy Cars SARL | Troysarl Luxemburg";

  const metaDescription =
    "Explore certified luxury vehicles and premium used cars at Troysarl. Luxembourg's trusted automotive partner with 200-point quality checks. Browse our premium selection of luxury and second-hand vehicles at Troysarl. Find the perfect car for sale or rent. Découvrez des véhicules de luxe certifiés et des voitures d'occasion haut de gamme chez Troysarl. Le partenaire automobile de confiance du Luxembourg avec 200 contrôles qualité. Parcourez notre sélection haut de gamme de véhicules de luxe et d'occasion chez Troysarl. Trouvez la voiture parfaite à vendre ou à louer. Entdecken Sie zertifizierte Luxusfahrzeuge und hochwertige Gebrauchtwagen bei Troysarl. Luxemburgs vertrauenswürdiger Automobilpartner mit 200-Punkte-Qualitätsprüfung. Durchsuchen Sie unsere Premium-Auswahl an Luxus- und Gebrauchtfahrzeugen bei Troysarl. Finden Sie das perfekte Auto zum Verkauf oder zur Miete.";

  const canonicalUrl = "https://troysarl.com/cars";
  const ogImageUrl = "https://troysarl.com/og-cars.jpg";

  return (
    <div
      className="min-h-screen bg-white dark:bg-gradient-to-b from-premium-light to-white transition-colors duration-300"
      aria-label="Vehicle Catalog"
    >
      <Toaster position="top-right" reverseOrder={false} />
      <Head>
        <title>{metaTitle}</title>
        <meta name="description" content={metaDescription} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:title" content={metaTitle} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:image" content={ogImageUrl} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={metaTitle} />
        <meta name="twitter:description" content={metaDescription} />
        <meta name="twitter:image" content={ogImageUrl} />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: "Vehicle Catalog",
            description: metaDescription,
            url: canonicalUrl,
            image: ogImageUrl,
            mainEntity: filteredCars.map((car) => ({
              "@type": "Car",
              brand: car.brand,
              model: car.model,
              price: car.price,
              mileage: car.mileage,
              bodyType: car.body_type,
              url: `${canonicalUrl}/cars/${car.id}`,
            })),
          })}
        </script>
      </Head>

      <Script
        strategy="afterInteractive"
        src="https://www.googletagmanager.com/gtag/js?id=G-099SZW867E"
      />
      <Script id="gtag-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-099SZW867E');
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

        {/* Filtre Kontrol Butonları */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 hidden md:block">
            Filters
          </h2>
          <div className="flex gap-2">
            {/* Masaüstü Show/Hide Butonu */}
            <button
              onClick={() => setShowFilters((prev) => !prev)}
              className="w-full p-3 hidden md:inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M5 4a1 1 0 00-2 0v7.268a2 2 0 000 3.464V16a1 1 0 102 0v-1.268a2 2 0 000-3.464V4zM11 4a1 1 0 10-2 0v1.268a2 2 0 000 3.464V16a1 1 0 102 0V8.732a2 2 0 000-3.464V4zM16 3a1 1 0 011 1v7.268a2 2 0 010 3.464V16a1 1 0 11-2 0v-1.268a2 2 0 010-3.464V4a1 1 0 011-1z" />
              </svg>
              {showFilters ? "Hide Filters" : "Show Filters"}
            </button>

            {/* Mobil Buton (Halihazırda var olan) */}
            <button
              onClick={() => setShowFilters((prev) => !prev)}
              className="w-full p-3 md:hidden w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center gap-2 h-full"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M5 4a1 1 0 00-2 0v7.268a2 2 0 000 3.464V16a1 1 0 102 0v-1.268a2 2 0 000-3.464V4zM11 4a1 1 0 10-2 0v1.268a2 2 0 000 3.464V16a1 1 0 102 0V8.732a2 2 0 000-3.464V4zM16 3a1 1 0 011 1v7.268a2 2 0 010 3.464V16a1 1 0 11-2 0v-1.268a2 2 0 010-3.464V4a1 1 0 011-1z" />
              </svg>
              {showFilters ? "Hide Filters" : "Show Filters"}
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
              {/* Araç görseli ve favori butonu */}
              <div className="relative h-48 w-full">
                <Image
                  src={car.photos[0]}
                  alt={`${car.brand} ${car.model} for ${car.listing_type}`}
                  fill
                  className="w-full h-full object-cover rounded-t-xl"
                  loading="lazy"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  itemProp="image"
                />
                <button
                  onClick={() => toggleFavorite(car.id)}
                  className={`absolute top-3 right-3 p-2 rounded-full shadow-md transition-all duration-300 ${
                    favorites.includes(car.id)
                      ? "bg-red-500 text-white hover:bg-red-600 scale-110"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-500 hover:bg-gray-300 dark:hover:bg-gray-600"
                  }`}
                >
                  <Heart
                    size={20}
                    fill={favorites.includes(car.id) ? "white" : "none"}
                    strokeWidth={2}
                  />
                </button>
              </div>

              {/* Araç detayları */}
              <div className="p-4 flex flex-col flex-grow">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 truncate">
                  <span itemProp="brand">{car.brand}</span>{" "}
                  <span itemProp="model">{car.model}</span>
                </h3>

                <div className="flex-grow mt-2">
                  <p className="text-gray-600 dark:text-gray-300">
                    <time
                      dateTime={new Date(car.year).toISOString()}
                      itemProp="releaseDate"
                      className="mr-2"
                    >
                      {format(new Date(car.year), "yyyy")}
                    </time>
                    • <span itemProp="transmission">{car.transmission}</span>
                  </p>

                  <div className="flex justify-between items-center mt-4">
                    <div>
                      {car.listing_type === "rental" && (
                        <span className="px-2 py-1 text-[14px] font-semibold bg-blue-100 text-blue-800 rounded-full">
                          Rental
                        </span>
                      )}
                      {car.listing_type === "sale" && (
                        <span className="px-2 py-1 text-[14px] font-semibold bg-green-100 text-green-800 rounded-full">
                          Sale
                        </span>
                      )}
                      {car.listing_type === "sold" && (
                        <span className="px-2 py-1 text-[14px] font-semibold bg-red-100 text-red-800 rounded-full">
                          Sold
                        </span>
                      )}
                      {car.listing_type === "reserved" && (
                        <span className="px-2 py-1 text-[14px] font-semibold bg-purple-100 text-purple-800 rounded-full">
                          Reserved
                        </span>
                      )}
                    </div>
                    {car.listing_type !== "sold" && (
                      <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                        €{car.price.toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>

                <Link
                  href={`/cars/${car.id}`}
                  className="mt-4 text-center bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  aria-label={`View details of ${car.brand} ${car.model}`}
                >
                  View Details
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
