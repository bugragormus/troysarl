// pages/index.tsx
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

export default function Home() {
  const [featuredCars, setFeaturedCars] = useState<Car[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    const fetchFeaturedCars = async () => {
      const { data, error } = await supabase
        .from("cars")
        .select("*")
        .eq("is_hidden", false)
        .order("created_at", { ascending: false })
        .limit(3);

      if (error) console.error("Error:", error);
      else setFeaturedCars(data || []);
    };

    fetchFeaturedCars();

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

  // SEO Meta Verileri
  const metaTitle =
    "Troy Cars - Premium Luxury & Used Cars in Luxembourg | Troy Cars SARL | Troysarl Luxembourg";
  const metaDescription =
    "Explore certified luxury vehicles and premium used cars at Troysarl. Luxembourg's trusted automotive partner with 200-point quality checks.";
  const canonicalUrl = "https://troysarl.com";
  const ogImageUrl = "https://troysarl.com/og-home.jpg";

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
      <Toaster position="top-right" reverseOrder={false} />
      <Head>
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
        </Head>

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
            "@type": "WebSite",
            name: "Troysarl",
            url: canonicalUrl,
            description: metaDescription,
            image: ogImageUrl,
            potentialAction: {
              "@type": "SearchAction",
              target: `${canonicalUrl}/cars?search={search_term_string}`,
              "query-input": "required name=search_term_string",
            },
          })}
        </script>
      </Head>

      {/* Google Analytics Scriptleri */}
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

      {/* Hero Section */}
      <section
        aria-label="Main showcase of Troysarl vehicles"
        className="relative h-[70vh] flex items-center justify-center"
      >
        <div className="absolute inset-0">
          <Image
            src="/showroom-hero.png"
            alt="Troysarl luxury vehicle showroom"
            fill
            priority
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 100vw"
          />
          <div className="absolute inset-0 bg-black opacity-40" />
        </div>

        <div className="relative z-10 text-center px-4">
          <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-6 drop-shadow-lg">
            Redefining Automotive Excellence
          </h1>
          <Link
            href="/cars"
            className="inline-block bg-gradient-to-r from-green-500 to-blue-500 text-white px-8 py-4 rounded-full shadow-lg transform hover:scale-105 transition-all duration-300 text-lg font-semibold"
            aria-label="Explore our vehicle collection"
          >
            Explore Collection →
          </Link>
        </div>
      </section>

      {/* Value Propositions */}
      <section
        aria-label="Our core values"
        className="py-16 bg-gray-50 dark:bg-gray-800"
      >
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="sr-only">Our Value Propositions</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: "🔒",
                title: "Certified Vehicles",
                description:
                  "200-point inspection process for guaranteed quality",
              },
              {
                icon: "🌍",
                title: "Global Delivery",
                description: "Seamless worldwide shipping solutions",
              },
              {
                icon: "💎",
                title: "Premium Service",
                description: "24/7 personalized customer support",
              },
            ].map((item, index) => (
              <div
                key={index}
                className="p-8 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-lg transform hover:-translate-y-1 transition-all duration-300"
              >
                <div
                  role="img"
                  aria-label={item.title}
                  className="text-5xl mb-4"
                >
                  {item.icon}
                </div>
                <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                  {item.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Cars */}
      <section aria-label="Featured vehicles" className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800 dark:text-gray-100">
            Curated Selection
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredCars.map((car) => (
              <article
                key={car.id}
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-2xl transition-shadow flex flex-col h-full"
                itemScope
                itemType="https://schema.org/Car"
              >
                <div className="relative h-48 w-full">
                  <Image
                    src={car.photos[0]}
                    alt={`${car.brand} ${car.model} featured vehicle`}
                    fill
                    className="object-cover rounded-t-xl"
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
        </div>
      </section>

      {/* CTA Section */}
      <section
        aria-label="Call to action"
        className="py-16 bg-gradient-to-r from-green-500 to-blue-500 text-white"
      >
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold mb-6">
            Ready for Your Next Adventure?
          </h2>
          <p className="text-xl mb-8">
            Experience luxury mobility with our exclusive collection
          </p>
          <Link
            href="/cars"
            className="inline-block bg-white text-green-500 px-8 py-3 rounded-full hover:bg-gray-100 transition-colors text-lg font-semibold"
            aria-label="Browse all vehicles"
          >
            Browse All Vehicles
          </Link>
        </div>
      </section>
    </div>
  );
}
