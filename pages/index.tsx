// pages/index.tsx
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import Link from "next/link";
import Head from "next/head";
import Image from "next/image";
import Car from "@/types/car";
import { Heart, Share2 } from "lucide-react";
import { format } from "date-fns";
import toast, { Toaster } from "react-hot-toast";
import { useFavorites } from "@/hooks/useFavorites";

export default function Home() {
  const [featuredCars, setFeaturedCars] = useState<Car[]>([]);

  // Use Custom Hook for favorites and sharing
  const { favorites, toggleFavorite } = useFavorites();

  useEffect(() => {
    const fetchFeaturedCars = async () => {
      const { data, error } = await supabase
        .from("cars")
        .select("*")
        .eq("is_hidden", false)
        .order("display_index", { ascending: true, nullsFirst: false })
        .order("created_at", { ascending: false })
        .limit(3);
      if (error) {
        console.error("Error:", error);
        toast.error("Failed to load vehicles.");
      } else setFeaturedCars(data || []);
    };
    fetchFeaturedCars();
  }, []);

  // SEO Meta Verileri
  const metaTitle = "Premium Used & Luxury Cars in Luxembourg | Troy Cars SARL";
  const metaDescription =
    "Explore certified premium luxury and used cars for sale in Luxembourg. We offer 200-point quality checks and flexible financing options.";
  const canonicalUrl = "https://troysarl.com";
  const ogImageUrl = "https://troysarl.com/troysarl-logo.png";

  return (
    <div className="min-h-screen bg-white dark:bg-gradient-to-b from-premium-light to-premium-dark transition-colors duration-300">
      <Head>
        {/* Temel SEO Etiketleri */}
        <title>{metaTitle}</title>
        <meta name="description" content={metaDescription} />
        <link rel="canonical" href={canonicalUrl} />
        <link rel="alternate" href={canonicalUrl} hrefLang="en-LU" />
        <link rel="alternate" href={canonicalUrl} hrefLang="fr-LU" />
        <link rel="alternate" href={canonicalUrl} hrefLang="de-LU" />
        <link rel="alternate" href={canonicalUrl} hrefLang="x-default" />
        <meta name="author" content="Troy Cars SARL" />

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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
              {
                "@type": "WebSite",
                "name": "Troy Cars Lux SARL",
                "url": canonicalUrl,
                "description": metaDescription,
                "about": {
                  "@type": "Thing",
                  "name": "Luxury Vehicles and Premium Car Dealership"
                },
                "mentions": [
                  {"@type": "Thing", "name": "Used Cars"},
                  {"@type": "Thing", "name": "Auto Sales"}
                ],
                "potentialAction": {
                  "@type": "SearchAction",
                  "target": `${canonicalUrl}/cars?search={search_term_string}`,
                  "query-input": "required name=search_term_string"
                }
              },
              {
                "@context": "https://schema.org",
                "@type": "BreadcrumbList",
                "itemListElement": [
                  {
                    "@type": "ListItem",
                    "position": 1,
                    "name": "Home",
                    "item": "https://troysarl.com"
                  }
                ]
              },
              {
                "@context": "https://schema.org",
                "@type": ["Organization", "LocalBusiness", "AutoDealer"],
                "name": "Troy Cars Lux SARL",
                "image": ogImageUrl,
                "@id": "https://troysarl.com",
                "url": "https://troysarl.com",
                "logo": "https://troysarl.com/troysarl-logo.png",
                "telephone": "+352691121111",
                "address": {
                  "@type": "PostalAddress",
                  "streetAddress": process.env.NEXT_PUBLIC_ADRESS,
                  "addressLocality": "Luxembourg",
                  "addressCountry": "LU"
                },
                "geo": {
                  "@type": "GeoCoordinates",
                  "latitude": 49.6133,
                  "longitude": 6.1645
                },
                "openingHoursSpecification": {
                  "@type": "OpeningHoursSpecification",
                  "dayOfWeek": [
                    "Monday",
                    "Tuesday",
                    "Wednesday",
                    "Thursday",
                    "Friday",
                    "Saturday"
                  ],
                  "opens": "09:00",
                  "closes": "18:00"
                },
                "priceRange": "$$$"
              },
              {
                "@context": "https://schema.org",
                "@type": "FAQPage",
                "mainEntity": [
                  {
                    "@type": "Question",
                    "name": "What should I check when buying a used car in Luxembourg?",
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text": "When purchasing a used vehicle, it's generally good practice to check its condition and ensure the technical inspection (Contrôle Technique) and registration papers are available."
                    }
                  },
                  {
                    "@type": "Question",
                    "name": "What documents are required to register a vehicle in Luxembourg?",
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text": "Basic requirements usually include a valid ID or passport, proof of residence, a motor insurance certificate, and the vehicle's registration document (Carte Grise)."
                    }
                  },
                  {
                    "@type": "Question",
                    "name": "When does a car need a technical inspection (Contrôle Technique) in Luxembourg?",
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text": "New passenger vehicles generally need their first inspection after four years, followed by annual inspections to ensure ongoing compliance with safety and emissions standards."
                    }
                  }
                ]
              },
              {
                "@context": "https://schema.org",
                "@type": "ItemList",
                "name": "Top 3 Reasons to Choose Troy Cars",
                "itemListElement": [
                  {
                    "@type": "ListItem",
                    "position": 1,
                    "name": "Carefully Selected Vehicles - Quality assurance process"
                  },
                  {
                    "@type": "ListItem",
                    "position": 2,
                    "name": "Transparent Pricing - Fair and market-aligned valuation"
                  },
                  {
                    "@type": "ListItem",
                    "position": 3,
                    "name": "Personalized Support - Dedicated assistance for every customer"
                  }
                ]
              },
              {
                "@context": "https://schema.org",
                "@type": "Article",
                "headline": "Premium Used & Luxury Cars in Luxembourg",
                "author": {
                  "@type": "Organization",
                  "name": "Troy Cars Lux SARL"
                },
                "publisher": {
                  "@type": "Organization",
                  "name": "Troy Cars Lux SARL"
                }
              }
            ]
          })
        }}
        />
      </Head>



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
          <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-6 drop-shadow-lg">
            Troy Cars Lux SARL - Premium Vehicles in Luxembourg
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

      {/* Key Takeaways / TL;DR for AI parsing */}
      <section aria-label="Key Takeaways" className="py-8 bg-blue-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">Key Takeaways</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
            <li>Troy Cars SARL is a premier used and luxury car dealer located in Luxembourg.</li>
            <li>All vehicles undergo a careful quality inspection before being listed for sale.</li>
            <li>We aim to provide transparent and fair pricing combined with reliable information.</li>
            <li>Our dedicated team offers personalized assistance to help you find your ideal vehicle.</li>
          </ul>
        </div>
      </section>

      {/* Value Propositions -> AI Listicle */}
      <section
        aria-label="Our core values"
        className="py-16 bg-gray-50 dark:bg-gray-800"
      >
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800 dark:text-gray-100">
            Top 3 Reasons to Choose Troy Cars
          </h2>
          <ol className="grid md:grid-cols-3 gap-8 list-none m-0 p-0">
            {[
              {
                icon: "🔍",
                title: "Selected Vehicles",
                description: "Thorough inspection process for quality assurance",
              },
              {
                icon: "💶",
                title: "Transparent Pricing",
                description: "Fair and market-aligned vehicle valuation",
              },
              {
                icon: "🤝",
                title: "Personalized Support",
                description: "Dedicated assistance for every customer",
              },
            ].map((item, index) => (
              <li
                key={index}
                className="p-8 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-lg relative"
              >
                <div className="absolute top-4 right-4 text-gray-300 dark:text-gray-500 text-5xl font-black opacity-30 select-none">
                  {index + 1}
                </div>
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
              </li>
            ))}
          </ol>
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
                        ) : car.listing_type === "reserved" ? (
                          <span className="px-2 py-1 text-xs font-semibold bg-purple-100 text-purple-800 rounded-full">
                            Reserved
                          </span>
                        ) : (
                          <span className="px-2 py-1 text-xs font-semibold bg-red-100 text-red-800 rounded-full">
                            Sold
                          </span>
                        )}
                      </div>
                      <div className="min-h-[2.5rem] flex items-center">
                        {car.is_exclusive ? (
                          <div className="text-center">
                            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                              💎 Exclusive Vehicle
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-500">
                              Contact for pricing
                            </p>
                          </div>
                        ) : car.listing_type !== "rental" && car.price ? (
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
                        ) : null}
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

      {/* Trust & Numerical Statistics Data */}
      <section aria-label="Company Statistics" className="py-16 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800 dark:text-gray-100">
            By The Numbers
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div className="p-6 border border-gray-100 dark:border-gray-800 rounded-xl shadow-sm">
              <p className="text-4xl font-extrabold text-green-500 mb-2">500+</p>
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Vehicles Delivered</h3>
            </div>
            <div className="p-6 border border-gray-100 dark:border-gray-800 rounded-xl shadow-sm">
              <p className="text-4xl font-extrabold text-green-500 mb-2">98%</p>
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Customer Satisfaction</h3>
            </div>
            <div className="p-6 border border-gray-100 dark:border-gray-800 rounded-xl shadow-sm">
              <p className="text-4xl font-extrabold text-green-500 mb-2">100%</p>
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Verified Quality</h3>
            </div>
            <div className="p-6 border border-gray-100 dark:border-gray-800 rounded-xl shadow-sm">
              <p className="text-4xl font-extrabold text-green-500 mb-2">10+</p>
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Years of Experience</h3>
            </div>
          </div>
          <p className="text-center text-gray-500 dark:text-gray-400 mt-8 italic">
            According to recent internal reviews, our dealership maintains one of the highest satisfaction ratings in the region.
          </p>
        </div>
      </section>

      {/* FAQ Section */}
      <section aria-label="Frequently Asked Questions" className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800 dark:text-gray-100">
            Frequently Asked Questions
          </h2>
          <div className="space-y-8">
            <article>
              <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                What should I check when buying a used car in Luxembourg?
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                When purchasing a used vehicle, it's generally good practice to check its condition and ensure the technical inspection (Contrôle Technique) and registration papers are available.
              </p>
            </article>
            <article>
              <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                What documents are required to register a vehicle in Luxembourg?
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Basic requirements usually include a valid ID or passport, proof of residence, a motor insurance certificate, and the vehicle's registration document (Carte Grise).
              </p>
            </article>
            <article>
              <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                When does a car need a technical inspection in Luxembourg?
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                New passenger vehicles generally need their first inspection after four years, followed by annual inspections to ensure ongoing compliance with safety and emissions standards.
              </p>
            </article>
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

      {/* References & Bibliography */}
      <section aria-label="References and Sources" className="py-8 bg-gray-50 dark:bg-gray-950 text-xs text-gray-400 dark:text-gray-600">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="sr-only">References and External Data</h2>
          <p className="mb-2 font-semibold">Sources & Attributions:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Customer satisfaction statistics based on independently verified feedback via Google Reviews (2023-2024).</li>
            <li>Comprehensive quality checks before any vehicle is listed on our platform.</li>
            <li>Industry data references provided by the European Automobile Manufacturers' Association (ACEA).</li>
          </ul>
        </div>
      </section>
    </div>
  );
}
