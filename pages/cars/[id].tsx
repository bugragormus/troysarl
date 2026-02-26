import { useState, useEffect } from "react";
import { GetStaticPaths, GetStaticProps } from "next";
import { supabase } from "../../lib/supabaseClient";
import Head from "next/head";
import Image from "next/image";
import { Carousel } from "react-responsive-carousel";
import Modal from "react-modal";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { Heart, Share } from "lucide-react";
import clsx from "clsx";
import Car from "@/types/car";
import { format } from "date-fns";
import toast, { Toaster } from "react-hot-toast";
import ContactForm from "@/components/ContactForm";
import { useFavorites } from "@/hooks/useFavorites";
import { useAuth } from "@/hooks/useAuth";

// Modal stil ayarları
Modal.setAppElement("#__next");
const modalStyles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    transform: "translate(-50%, -50%)",
    padding: "2rem",
    borderRadius: "0.5rem",
    background: "#fff",
    maxWidth: "90vw",
    maxHeight: "90vh",
  },
  overlay: {
    backgroundColor: "rgba(0,0,0,0.7)",
    zIndex: 1000,
  },
};

export default function CarDetail({ car }: { car: Car }) {
  const { user } = useAuth();
  const { favorites, toggleFavorite } = useFavorites();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);

  const handleImageClick = (index: number) => {
    setActiveImageIndex(index);
    setIsModalOpen(true);
  };

  // Track page view once when the component mounts
  useEffect(() => {
    if (!car?.id) return;
    
    fetch('/api/track-view', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        carId: car.id,
        userId: user?.id || null
      })
    }).catch(err => console.error("Tracking error:", err));
  }, [car?.id, user?.id]);
  const handlePrev = () => {
    setActiveImageIndex((prev) =>
      prev > 0 ? prev - 1 : car.photos.length - 1
    );
  };
  const handleNext = () => {
    setActiveImageIndex((prev) =>
      prev < car.photos.length - 1 ? prev + 1 : 0
    );
  };

  const { handleShare } = useFavorites();

  // SEO Meta Verileri
  const metaTitle = `${car.brand} ${car.model} (${new Date(car.year).getFullYear()}) | Troy Cars Lux SARL Luxembourg`;

  const metaDescription = `Check out this ${car.brand} ${car.model} at Troy Cars Lux SARL. Premium used vehicles in Luxembourg, fully certified. Voitures d'occasion au Luxembourg. Gebrauchtwagen Luxemburg.`;

  const canonicalUrl = "https://troysarl.com/cars/" + car.id;
  const ogImageUrl =
    car?.photos?.length > 0
      ? `https://troysarl.com${car.photos[0]}`
      : "https://troysarl.com/troysarl-logo.png";


  return (
    <div
      className="min-h-screen bg-white dark:bg-gradient-to-b from-premium-light to-premium-dark transition-colors duration-300"
      aria-label="Car Detail Page"
    >
      <Head>
        {/* Temel SEO Etiketleri */}
        <title>{metaTitle}</title>
        <meta name="description" content={metaDescription} />
        <link rel="canonical" href={canonicalUrl} />
        {/* Hreflang Tags for Luxembourg Multilingual Support */}
        <link rel="alternate" href={canonicalUrl} hrefLang="en-LU" />
        <link rel="alternate" href={canonicalUrl} hrefLang="fr-LU" />
        <link rel="alternate" href={canonicalUrl} hrefLang="de-LU" />
        <link rel="alternate" href={canonicalUrl} hrefLang="x-default" />

        {/* Schema.org Markup */}
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
                    "item": "https://troysarl.com/cars"
                  },
                  {
                    "@type": "ListItem",
                    "position": 3,
                    "name": `${car.brand} ${car.model}`,
                    "item": canonicalUrl
                  }
                ]
              },
              {
                "@context": "https://schema.org",
                "@type": "Car",
                "name": `${car.brand} ${car.model}`,
                "vehicleModelDate": new Date(car.year).getFullYear().toString(),
                "itemCondition":
                  car.listing_type === "sold"
                    ? "https://schema.org/UsedCondition"
                    : "https://schema.org/NewCondition",
                "numberOfDoors": car.doors,
                "vehicleTransmission":
                  car.transmission === "automatic"
                    ? "AutomaticTransmission"
                    : "ManualTransmission",
                "color": car.color,
                "brand": {
                  "@type": "Brand",
                  "name": car.brand,
                },
                "model": car.model,
                "image": car.photos.map((photo) => `https://troysarl.com${photo}`),
                "bodyType": car.body_type,
                "vehicleEngine": {
                  "@type": "EngineSpecification",
                  "fuelType":
                    car.fuel_type.toLowerCase() === "diesel"
                      ? "https://schema.org/DieselFuel"
                      : "https://schema.org/Gasoline",
                },
                "vehicleSeatingCapacity": 5,
                "mileageFromOdometer": {
                  "@type": "QuantitativeValue",
                  "value": car.mileage,
                  "unitCode": "KMT",
                },
                "offers": {
                  "@type": "Offer",
                  "priceCurrency": "EUR",
                  ...(Number(String(car.price).replace(/[^0-9.-]+/g, "")) > 0 && {
                    "price": Number(String(car.price).replace(/[^0-9.-]+/g, ""))
                  }),
                  "availability":
                    car.listing_type === "sold"
                      ? "https://schema.org/OutOfStock"
                      : "https://schema.org/InStock"
                }
              }
            ])
          }}
        />

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

      <div className="max-w-6xl mx-auto p-6">
        {/* Başlık Alanı */}
        <header
          className="mb-10 flex items-center justify-between relative"
          aria-label="Car Details"
        >
          <div>
            <h1
              className="text-4xl font-extrabold text-gray-800 dark:text-white mb-2"
              aria-label="Car Title"
            >
              {car?.brand} {car?.model}
            </h1>
            <p className="text-gray-600 dark:text-gray-300 truncate mt-1">
              {format(new Date(car?.year || ""), "dd.MM.yyyy")} •{" "}
              {car?.body_type}
            </p>
          </div>

          {/* Button Container */}
          <div className="flex gap-4">
            {/* Favori Butonu */}
            <button
              onClick={() => toggleFavorite(car?.id || "")}
              className={`p-3 rounded-full shadow-lg backdrop-blur-md bg-black/30 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300  ${
                favorites.includes(car?.id || "")
                  ? "bg-red-500 text-white hover:bg-red-600"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-500 hover:bg-gray-300 dark:hover:bg-gray-600"
              }`}
              title={
                favorites.includes(car?.id || "")
                  ? "Remove from Favorites"
                  : "Add to Favorites"
              }
            >
              <Heart
                size={20}
                fill={favorites.includes(car?.id || "") ? "white" : "none"}
                strokeWidth={2}
              />
            </button>

            {/* Share Butonu */}
            <button
              onClick={() => handleShare(car)}
              className="p-3 rounded-full shadow-lg backdrop-blur-md bg-black/30 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300 "
              title="Share this car"
            >
              <Share size={20} fill="none" strokeWidth={2} />
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Sol Sütun: Resim Galerisi */}
          <section className="relative" aria-label="Car Image Gallery">
            {/* Resim Galerisi */}
            <div className="relative" aria-label="Car Photos">
              {/* Exclusive Badge (if applicable) */}
              {car.is_exclusive && (
                <span className="absolute top-4 right-4 px-3 py-1.5 text-xs font-bold rounded-full shadow-lg bg-gradient-to-r from-yellow-400 to-yellow-600 text-gray-900 z-10 animate-pulse">
                  💎 EXCLUSIVE
                </span>
              )}

              <span
                className={`absolute top-4 left-4 px-3 py-1.5 text-xs font-semibold rounded-full shadow-md backdrop-blur-sm z-10 ${
                  {
                    rental: "bg-blue-600/60 text-white",
                    sale: "bg-emerald-600/60 text-white",
                    sold: "bg-rose-600/60 text-white",
                    reserved: "bg-purple-600/60 text-white",
                  }[car.listing_type]
                }`}
              >
                {car.listing_type.toUpperCase()}
              </span>
              <Carousel
                showThumbs={true}
                infiniteLoop
                selectedItem={activeImageIndex}
                className="rounded-2xl overflow-hidden shadow-2xl bg-white dark:bg-gray-900/80 p-2"
                renderThumbs={(children) =>
                  children.map((_, index) => (
                    <div
                      key={index}
                      className={`h-20 w-20 cursor-pointer border-2 transition-all duration-300 rounded-md overflow-hidden ${
                        activeImageIndex === index
                          ? "border-blue-500"
                          : "border-gray-300 dark:border-gray-600 hover:border-blue-400"
                      }`}
                    >
                      <Image
                        loading="lazy"
                        src={car.photos[index]}
                        alt={`Thumbnail ${index + 1}`}
                        width={80}
                        height={80}
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="object-cover w-full h-full"
                      />
                    </div>
                  ))
                }
              >
                {car.photos.map((photo, index) => (
                  <div
                    key={index}
                    className="h-[500px] relative cursor-zoom-in rounded-2xl overflow-hidden group"
                    onClick={() => handleImageClick(index)}
                  >
                    <Image
                      loading="lazy"
                      src={photo}
                      alt={`${car.brand} ${car.model} for ${car.listing_type} in Luxembourg - Troy Cars Lux SARL`}
                      layout="fill"
                      objectFit="contain"
                      className="transition-transform duration-300 "
                    />
                    {/* Gradient overlay for subtle dark effect */}
                    <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/20 to-black/30" />
                  </div>
                ))}
              </Carousel>
            </div>
          </section>
          {/* Tam Ekran Modal */}
          <Modal
            isOpen={isModalOpen}
            onRequestClose={() => setIsModalOpen(false)}
            style={{
              ...modalStyles,
              overlay: {
                ...modalStyles.overlay,
                padding: "0", // Overlay için paddingi sıfırladık
              },
              content: {
                ...modalStyles.content,
                maxWidth: "95vw", // Mobilde biraz daha geniş
                maxHeight: "85vh", // Mobilde biraz daha büyük
                margin: "auto",
                padding: "0",
                borderRadius: "16px",
                backgroundColor: "transparent",
              },
            }}
            aria-label="Fullscreen Image View"
          >
            <div className="relative flex items-center justify-center w-full h-full overflow-hidden">
              {/* Kapatma Butonu */}
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 text-white text-4xl hover:scale-110 hover:text-red-400 transition-all z-50"
                aria-label="Close Modal"
              >
                &times;
              </button>

              {/* Resim */}
              <div className="relative w-full h-full overflow-auto">
                <Image
                  loading="lazy"
                  src={car.photos[activeImageIndex]}
                  alt={`${car.brand} ${car.model}`}
                  width={1200}
                  height={800}
                  className="max-h-[80vh] max-w-full object-contain rounded-lg shadow-xl transition-all duration-300"
                />
              </div>

              {/* Sol Ok */}
              <button
                onClick={handlePrev}
                className="absolute left-6 top-1/2 transform -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white text-3xl p-3 rounded-full transition-all z-50"
                aria-label="Previous Image"
              >
                &#10094;
              </button>

              {/* Sağ Ok */}
              <button
                onClick={handleNext}
                className="absolute right-6 top-1/2 transform -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white text-3xl p-3 rounded-full transition-all z-50"
                aria-label="Next Image"
              >
                &#10095;
              </button>

              {/* Resim Sayacı */}
              <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-black/60 text-white px-4 py-1 rounded-full text-sm shadow-lg backdrop-blur">
                {activeImageIndex + 1} / {car.photos.length}
              </div>
            </div>
          </Modal>

          {/* Sağ Sütun: Detaylar, İletişim ve Form */}
          <section className="space-y-4" aria-label="Car Details">
            {/* Fiyat / İletişim Bilgileri */}
            <div className="p-6 bg-white/90 dark:bg-gray-900/80 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-lg backdrop-blur-md hover:shadow-xl transition-all duration-300">
              {car.is_exclusive ? (
                <div className="space-y-6 text-center">
                  <div className="space-y-2">
                    <p className="text-2xl font-bold text-gray-800 dark:text-white flex items-center justify-center gap-2">
                      💎 Exclusive Vehicle
                    </p>
                    <p className="text-lg text-gray-600 dark:text-gray-400">
                      Price available upon request
                    </p>
                  </div>
                  <button
                    onClick={() => setShowContactForm((prev) => !prev)}
                    className="w-full py-4 rounded-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-gray-900 font-bold shadow-lg transform transition-all duration-300 hover:scale-105"
                  >
                    {showContactForm ? "Close Form" : "Contact for Price"}
                  </button>
                </div>
              ) : car.listing_type === "rental" ? (
                <div className="space-y-6 text-center">
                  <p className="text-2xl font-semibold text-gray-800 dark:text-white">
                    Flexible Rental Plans Available
                  </p>
                  <button
                    onClick={() => setShowContactForm((prev) => !prev)}
                    className="w-full py-4 rounded-full bg-gradient-to-r from-green-500 to-blue-500 text-white font-bold shadow-lg transform transition-all duration-300 hover:scale-105"
                  >
                    {showContactForm
                      ? "Close Form"
                      : "Request Rental Information"}
                  </button>
                </div>
              ) : car.listing_type === "sold" ? (
                <div className="flex justify-center items-center">
                  <p
                    className={clsx(
                      "text-4xl font-extrabold tracking-tight",
                      car.listing_type === "sold"
                        ? "text-gray-400 line-through dark:text-gray-600"
                        : "text-emerald-600 dark:text-emerald-400"
                    )}
                  >
                    €{car.price.toLocaleString()}
                  </p>
                </div>
              ) : (
                <div className="flex justify-center items-center">
                  <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                    €{car.price.toLocaleString()}
                  </p>
                </div>
              )}
            </div>
            {/* İletişim Formu (Rental için) */}
            {showContactForm && car.listing_type === "rental" && (
              <ContactForm
                carId={car.id}
                carBrand={car.brand}
                carModel={car.model}
                listingType={car.listing_type}
                carYear={car.year}
                carMileage={car.mileage}
                carColor={car.color}
                onClose={() => setShowContactForm(false)}
              />
            )}
            {/* Randevu / İletişim Butonu (Sale ve Reserved için) */}
            {(car.listing_type === "sale" || car.listing_type === "reserved") &&
              !car.is_exclusive && (
                <div className="space-y-6 text-center">
                  <button
                    onClick={() => setShowContactForm((prev) => !prev)}
                    className="w-full py-4 rounded-lg bg-gray-900 hover:bg-gray-800 text-white dark:bg-gray-100 dark:hover:bg-gray-200 dark:text-gray-900 font-medium shadow-md transition-all duration-300"
                  >
                    {showContactForm ? "Close Form" : "Make an Appointment"}
                  </button>
                </div>
              )}
            {/* İletişim Formu (Sale, Reserved, Exclusive için) */}
            {showContactForm &&
              (car.listing_type === "sale" ||
                car.listing_type === "reserved" ||
                car.is_exclusive) && (
                <ContactForm
                  carId={car.id}
                  carBrand={car.brand}
                  carModel={car.model}
                  listingType={car.listing_type}
                  isExclusive={car.is_exclusive}
                  carYear={car.year}
                  carMileage={car.mileage}
                  carColor={car.color}
                  onClose={() => setShowContactForm(false)}
                />
              )}
            {/* Specifications */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[
                {
                  label: "Year",
                  value: car.year
                    ? format(new Date(car.year), "dd.MM.yyyy")
                    : "",
                },
                {
                  label: "Mileage",
                  value: `${car.mileage?.toLocaleString()} km`,
                },
                { label: "Fuel", value: car.fuel_type },
                { label: "Transmission", value: car.transmission },
                { label: "Doors", value: car.doors },
                { label: "Color", value: car.color },
              ].map((spec, index) => (
                <div
                  key={index}
                  className="p-6 bg-white/90 dark:bg-gray-900/80 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-lg backdrop-blur-md hover:shadow-xl transition-all duration-300"
                >
                  <p className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wide font-medium">
                    {spec.label}
                  </p>
                  <p className="mt-2 text-xl font-bold text-gray-800 dark:text-gray-100">
                    {spec.value}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Detailed Description */}
          <div className="p-6 bg-white/90 dark:bg-gray-900/80 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-lg backdrop-blur-md hover:shadow-xl transition-all duration-300">
            {car.description && car.description.length > 0 && (
              <>
                <h3 className="text-2xl font-bold mb-4 dark:text-white">
                  Detailed Information
                </h3>
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                  {car.description}
                </p>
              </>
            )}
          </div>

          {/* Features */}
          <div className="mt-8 space-y-6">
            {/* Safety Features */}
            {car.features.safety && car.features.safety.length > 0 && (
              <div className="bg-gray-100 dark:bg-gray-800 p-8 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700">
                <h3 className="text-2xl font-bold mb-4 dark:text-white">
                  Safety Features
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {car.features.safety.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <span className="text-green-600 font-bold">✓</span>
                      <span className="text-gray-700 dark:text-gray-300">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Comfort & Convenience Features */}
            {car.features.comfort && car.features.comfort.length > 0 && (
              <div className="bg-gray-100 dark:bg-gray-800 p-8 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700">
                <h3 className="text-2xl font-bold mb-4 dark:text-white">
                  Comfort &amp; Convenience
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {car.features.comfort.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <span className="text-green-600 font-bold">✓</span>
                      <span className="text-gray-700 dark:text-gray-300">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Entertainment Features */}
            {car.features.entertainment &&
              car.features.entertainment.length > 0 && (
                <div className="bg-gray-100 dark:bg-gray-800 p-8 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700">
                  <h3 className="text-2xl font-bold mb-4 dark:text-white">
                    Entertainment Features
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {car.features.entertainment.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <span className="text-green-600 font-bold">✓</span>
                        <span className="text-gray-700 dark:text-gray-300">
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
          </div>
        </section>
      </div>
    </div>
  );
}

// --- SSG ---

export const getStaticPaths: GetStaticPaths = async () => {
  const { data: cars } = await supabase
    .from("cars")
    .select("id")
    .eq("is_hidden", false);

  const paths = (cars || []).map((car) => ({
    params: { id: car.id.toString() },
  }));

  return {
    paths,
    // 'blocking': Yeni eklenen araçlar ilk ziyarette sunucu tarafında render edilir
    fallback: "blocking",
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const id = params?.id as string;

  const { data: car, error } = await supabase
    .from("cars")
    .select("*")
    .eq("id", id)
    .eq("is_hidden", false)
    .single();

  if (error || !car) {
    return { notFound: true };
  }

  return {
    props: { car },
    // ISR: Her 60 saniyede bir yeniden generate et (fiyat/status değişiklikleri için)
    revalidate: 60,
  };
};

