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

const fuelTypeOptions = ["Petrol", "Diesel", "Electric", "Hybrid"];

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
      updatedFavorites = updatedFavorites.filter((id) => id !== carId); // Favoriden çıkar
      toast.error("The car has been removed from favorites.");
    } else {
      updatedFavorites.push(carId); // Favorilere ekle
      toast.success("The car has been added to favorites.");
    }

    setFavorites(updatedFavorites);
    localStorage.setItem("favoriteCars", JSON.stringify(updatedFavorites));
  };

  const filteredCars = cars.filter((car) => {
    const matchesSearch =
      car.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      car.model.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesListingType =
      filters.listingType === "all" ||
      car.listing_type === filters.listingType ||
      (filters.listingType === "both" && car.listing_type === "both");

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

    return (
      matchesSearch &&
      matchesListingType &&
      matchesBodyType &&
      matchesFuelType &&
      matchesPrice &&
      matchesYear &&
      matchesMileage &&
      matchesFeatures
    );
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
    });
  };

  // SEO Meta Verileri
  const metaTitle =
    "Vehicle Catalog - Troy Cars | Vehicle Catalog | Cars for Sale or Rent | Troysarl";
  const metaDescription =
    "Browse our premium selection of luxury and second-hand vehicles at Troysarl. Find the perfect car for sale or rent.";
  const canonicalUrl = "https://troysarl.com/cars";
  const ogImageUrl = "https://troysarl.com/og-cars.jpg";

  return (
    <div
      className="min-h-screen bg-white dark:bg-gradient-to-b from-premium-light to-white transition-colors duration-300"
      aria-label="Vehicle Catalog"
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

      {/* Google Tag Manager */}
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

      <div className="container mx-auto p-4 lg:flex lg:gap-8" aria-label="Cars">
        {/* Mobil Filtre Toggle Butonu */}
        <div className="md:hidden mb-4">
          <button
            onClick={() => setShowFilters((prev) => !prev)}
            className="w-full py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors"
            aria-label="Toggle filters"
          >
            {showFilters ? "Hide Filters" : "Show Filters"}
          </button>
        </div>

        {/* Filters Sidebar */}
        <aside
          className={`lg:w-80 mb-8 lg:mb-0 bg-gray-50 dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 ${
            showFilters ? "block" : "hidden md:block"
          } top-20 max-h-[calc(80vh)] overflow-y-auto`}
          aria-label="Filters sidebar"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
              Filters
            </h2>
            <button
              onClick={resetFilters}
              className="text-sm text-blue-600 hover:underline dark:text-blue-400"
              aria-label="Clear all filters"
            >
              Clear All
            </button>
          </div>

          <div className="space-y-6">
            {/* Listing Type */}
            <div>
              <h3 className="font-semibold mb-2 text-gray-700 dark:text-gray-300">
                Listing Type
              </h3>
              <select
                value={filters.listingType}
                onChange={(e) =>
                  setFilters({ ...filters, listingType: e.target.value })
                }
                className="w-full p-2 rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                aria-label="Select listing type"
              >
                <option value="all">All Listings</option>
                <option value="sale">For Sale</option>
                <option value="rental">For Rent</option>
                <option value="both">Both</option>
                <option value="sold">Sold</option>
              </select>
            </div>

            {/* Body Type */}
            <div>
              <h3 className="font-semibold mb-2 text-gray-700 dark:text-gray-300">
                Body Type
              </h3>
              <select
                value={filters.bodyType}
                onChange={(e) =>
                  setFilters({ ...filters, bodyType: e.target.value })
                }
                className="w-full p-2 rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                aria-label="Select body type"
              >
                <option value="">All Body Types</option>
                {bodyTypeOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Range */}
            <div>
              <h3 className="font-semibold mb-2 text-gray-700 dark:text-gray-300">
                Price Range (€)
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.minPrice}
                  onChange={(e) =>
                    setFilters({ ...filters, minPrice: e.target.value })
                  }
                  className="p-2 rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                  aria-label="Minimum price"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.maxPrice}
                  onChange={(e) =>
                    setFilters({ ...filters, maxPrice: e.target.value })
                  }
                  className="p-2 rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                  aria-label="Maximum price"
                />
              </div>
            </div>

            {/* Year Range */}
            <div>
              <h3 className="font-semibold mb-2 text-gray-700 dark:text-gray-300">
                Year
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.minYear}
                  onChange={(e) =>
                    setFilters({ ...filters, minYear: e.target.value })
                  }
                  className="p-2 rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                  aria-label="Minimum year"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.maxYear}
                  onChange={(e) =>
                    setFilters({ ...filters, maxYear: e.target.value })
                  }
                  className="p-2 rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                  aria-label="Maximum year"
                />
              </div>
            </div>

            {/* Fuel Type */}
            <div>
              <h3 className="font-semibold mb-2 text-gray-700 dark:text-gray-300">
                Fuel Type
              </h3>
              <select
                value={filters.fuelType}
                onChange={(e) =>
                  setFilters({ ...filters, fuelType: e.target.value })
                }
                className="w-full p-2 rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                aria-label="Select fuel type"
              >
                <option value="">All Fuel Types</option>
                {fuelTypeOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            {/* Mileage Range */}
            <div>
              <h3 className="font-semibold mb-2 text-gray-700 dark:text-gray-300">
                Mileage (km)
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.minMileage}
                  onChange={(e) =>
                    setFilters({ ...filters, minMileage: e.target.value })
                  }
                  className="p-2 rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                  aria-label="Minimum mileage"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.maxMileage}
                  onChange={(e) =>
                    setFilters({ ...filters, maxMileage: e.target.value })
                  }
                  className="p-2 rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                  aria-label="Maximum mileage"
                />
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          <div className="mb-8">
            <input
              type="text"
              placeholder="Search by brand or model..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-3 rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
              aria-label="Search vehicles"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCars.map((car) => (
              <article
                key={car.id}
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-2xl transition-shadow flex flex-col h-full"
                itemScope
                itemType="https://schema.org/Car"
              >
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
                    aria-label={`${
                      favorites.includes(car.id) ? "Remove from" : "Add to"
                    } favorites`}
                  >
                    <Heart
                      size={20}
                      fill={favorites.includes(car.id) ? "white" : "none"}
                      strokeWidth={2}
                    />
                  </button>
                </div>
                <div className="p-4 flex flex-col flex-grow">
                  <h3 className="text-xl text-gray-800 dark:text-gray-100 truncate">
                    <span className="font-bold" itemProp="brand">
                      {car.brand}
                    </span>{" "}
                    <span itemProp="model">{car.model}</span>
                  </h3>

                  <div className="flex-grow">
                    <p className="text-gray-600 dark:text-gray-300 truncate mt-1">
                      <time
                        dateTime={new Date(car.year).toISOString()}
                        itemProp="releaseDate"
                      >
                        {format(new Date(car.year), "dd.MM.yyyy")}
                      </time>{" "}
                      • <span itemProp="bodyType">{car.body_type}</span>
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
                        ) : car.listing_type === "both" ? (
                          <span className="px-2 py-1 text-xs font-semibold bg-purple-100 text-purple-800 rounded-full">
                            Sale/Rental
                          </span>
                        ) : (
                          <span className="px-2 py-1 text-xs font-semibold bg-red-100 text-red-800 rounded-full">
                            Sold
                          </span>
                        )}
                      </div>
                      <div className="min-h-[2.5rem] flex items-center">
                        {car.listing_type !== "rental" && car.price && (
                          <p
                            className="text-2xl font-bold text-green-600 dark:text-green-400"
                            itemProp="offers"
                            itemScope
                            itemType="https://schema.org/Offer"
                          >
                            <meta itemProp="priceCurrency" content="EUR" />€
                            <span itemProp="price">
                              {car.price.toLocaleString()}
                            </span>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <Link
                    href={`/cars/${car.id}`}
                    className="block mt-4 text-center bg-green-500 text-white py-2 rounded-full hover:bg-green-600 transition-colors"
                    aria-label={`View details of ${car.brand} ${car.model}`}
                    itemProp="url"
                  >
                    View Details
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
