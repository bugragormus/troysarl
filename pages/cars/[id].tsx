import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import Head from "next/head";
import Image from "next/image";
import { Carousel } from "react-responsive-carousel";
import Modal from "react-modal";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { Heart } from "lucide-react";
import Car from "@/types/car";
import { format } from "date-fns";
import toast, { Toaster } from "react-hot-toast";
import Script from "next/script";

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
export default function CarDetail() {
  const [favorites, setFavorites] = useState<string[]>([]);
  const router = useRouter();
  const { id } = router.query;
  const [car, setCar] = useState<Car | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [consents, setConsents] = useState({
    financing: false,
    privacy: false,
  });
  const handleImageClick = (index: number) => {
    setActiveImageIndex(index);
    setIsModalOpen(true);
  };
  const handlePrev = () => {
    setActiveImageIndex((prev) =>
      prev > 0 ? prev - 1 : car ? car.photos.length - 1 : 0
    );
  };
  const handleNext = () => {
    setActiveImageIndex((prev) =>
      car && prev < car.photos.length - 1 ? prev + 1 : 0
    );
  };
  useEffect(() => {
    if (id) {
      const fetchCar = async () => {
        const { data, error } = await supabase
          .from("cars")
          .select("*")
          .eq("id", id)
          .eq("is_hidden", false)
          .single();
        if (error) {
          console.error(error);
          router.push("/404");
        } else {
          setCar(data);
        }
      };
      fetchCar();

      const savedFavorites = JSON.parse(
        localStorage.getItem("favoriteCars") || "[]"
      );
      setFavorites(savedFavorites);
    }
  }, [id, router]); // Added `router` to the dependency array
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
    "Luxury and Second-Hand Vehicles for Sale or Rent | Troysarl | Luxembourg | Véhicules de luxe et d'occasion à vendre ou à louer | Troysarl | Luxembourg | Luxus- und Gebrauchtfahrzeuge zum Verkauf oder zur Miete | Troysarl | Luxemburg";

  const metaDescription =
    "Explore our extensive collection of luxury and second-hand vehicles for sale or rent. We offer a wide range of vehicles, including sedans, SUVs, and sports cars, with flexible rental plans available. Découvrez notre vaste collection de véhicules de luxe et d'occasion à vendre ou à louer. Nous proposons une large gamme de véhicules, y compris des berlines, des SUV et des voitures de sport, avec des plans de location flexibles. Entdecken Sie unsere umfangreiche Sammlung von Luxus- und Gebrauchtfahrzeugen zum Verkauf oder zur Miete. Wir bieten eine breite Palette von Fahrzeugen, darunter Limousinen, SUVs und Sportwagen, mit flexiblen Mietplänen.";

  const canonicalUrl = "https://troysarl.com/cars/" + id;
  const ogImageUrl = "https://troysarl.com/og-cars" + id + ".jpg";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consents.privacy) {
      toast.error("You must accept the privacy policy to continue");
      return;
    }
    const response = await fetch(
      `https://formspree.io/f/${process.env.NEXT_PUBLIC_FORMSPREE_FORM_ID}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          consents,
          car_id: id,
          car_model: `${car?.brand} ${car?.model}`,
          listing_type: car?.listing_type,
          car_year: car?.year,
          car_km: car?.mileage,
          car_color: car?.color,
        }),
      }
    );
    if (response.ok) {
      toast.success("Your request has been submitted successfully!");
      setFormData({ name: "", email: "", phone: "", message: "" });
      setShowContactForm(false);
    }
  };
  if (!car)
    return <div className="container mx-auto p-4 text-center">Loading...</div>;
  return (
    <div
      className="min-h-screen bg-white dark:bg-gradient-to-b from-premium-light to-white transition-colors duration-300"
      aria-label="Car Detail Page"
    >
      <Toaster position="top-right" reverseOrder={false} />
      <Head>
        {/* Temel SEO Etiketleri */}
        <title>
          {metaTitle} {car.brand} {car.model} | Troysarl
        </title>
        <meta name="description" content={metaDescription} />
        <link rel="canonical" href={canonicalUrl} />

        {/* JSON‑LD Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Car",
            name: `${car.brand} ${car.model}`,
            vehicleModelDate: car.year, // Üretim veya model tarihi
            itemCondition:
              car.listing_type === "sold"
                ? "https://schema.org/UsedCondition"
                : "https://schema.org/NewCondition",
            numberOfDoors: car.doors,
            vehicleTransmission: car.transmission,
            color: car.color,
            brand: {
              "@type": "Brand",
              name: car.brand,
            },
            model: car.model,
            image: car.photos,
            bodyType: car.body_type,
            vehicleIdentificationNumber: "None",
            vehicleInteriorType: "Standart",
            vehicleEngine: {
              "@type": "EngineSpecification",
              fuelType: car.fuel_type,
            },
            vehicleSeatingCapacity: 5,
            vehicleInteriorColor: "Standart",
            mileageFromOdometer: {
              "@type": "QuantitativeValue",
              value: car.mileage,
              unitCode: "KMH",
            },
            offers: {
              "@type": "Offer",
              priceCurrency: "EUR",
              price: Number(car.price),
              availability:
                car.listing_type === "sold"
                  ? "https://schema.org/OutOfStock"
                  : "https://schema.org/InStock",
            },
          })}
        </script>

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

      <div className="max-w-6xl mx-auto p-6">
        {/* Başlık Alanı */}
        <header
          className="mb-10 flex items-center justify-between relative"
          aria-label="Car Details"
        >
          <div>
            <h1
              className="text-4xl font-extrabold text-gray-800 dark:text-white"
              aria-label="Car Title"
            >
              {car.brand} {car.model}
            </h1>
            <p className="text-gray-600 dark:text-gray-300 truncate mt-1">
              {format(new Date(car.year), "dd.MM.yyyy")} • {car.body_type}
            </p>
          </div>

          {/* Favori Butonu */}
          <button
            onClick={() => toggleFavorite(car.id)}
            className={`p-3 rounded-full shadow-md transition-all duration-300 ${
              favorites.includes(car.id)
                ? "bg-red-500 text-white hover:bg-red-600"
                : "bg-gray-200 dark:bg-gray-700 text-gray-500 hover:bg-gray-300 dark:hover:bg-gray-600"
            }`}
            title={
              favorites.includes(car.id)
                ? "Remove from Favorites"
                : "Add to Favorites"
            }
          >
            <Heart
              size={20}
              fill={favorites.includes(car.id) ? "white" : "none"}
              strokeWidth={2}
            />
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Sol Sütun: Resim Galerisi */}
          <section>
            <div className="relative" aria-label="Car Photos">
              <Carousel
                showThumbs={true}
                infiniteLoop
                selectedItem={activeImageIndex}
                className="rounded-2xl overflow-hidden shadow-xl" // hover:scale-105 kaldırıldı
                renderThumbs={(children) =>
                  children.map((_, index) => (
                    <div
                      key={index}
                      className="h-20 w-20 cursor-pointer border border-gray-300 dark:border-gray-600 rounded-md overflow-hidden"
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
                    className="h-[500px] relative cursor-zoom-in border border-gray-300 dark:border-gray-600 rounded-lg"
                    onClick={() => handleImageClick(index)}
                  >
                    <Image
                      loading="lazy"
                      src={photo}
                      alt={`${car.brand} ${car.model} for ${car.listing_type} in Luxembourg`}
                      layout="fill"
                      objectFit="contain"
                      className="cursor-zoom-in"
                    />
                    {/* Hafif karartma efekti, mouse ile üzerine gelindiğinde değil, sürekli hafif kontrast için */}
                    <div className="absolute inset-0 bg-black/" />
                  </div>
                ))}
              </Carousel>
            </div>
          </section>
          {/* Tam Ekran Modal */}
          <Modal
            isOpen={isModalOpen}
            onRequestClose={() => setIsModalOpen(false)}
            style={modalStyles}
            aria-label="Fullscreen Image View"
          >
            <div className="relative">
              {/* Kapatma Butonu */}
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute -top-10 right-0 text-white text-4xl hover:text-gray-300 transition-colors z-50"
              >
                &times;
              </button>
              {/* Resim */}
              <Image
                loading="lazy"
                src={car.photos[activeImageIndex]}
                alt="Luxembourg cars"
                width={1200} // Resmin genişliği
                height={800} // Resmin yüksekliği
                className="max-h-[80vh] max-w-[90vw] object-contain"
              />
              {/* Navigasyon Butonları */}
              <button
                onClick={handlePrev}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-3 rounded-full hover:bg-black/70 transition-colors z-50"
              >
                &larr;
              </button>
              <button
                onClick={handleNext}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-3 rounded-full hover:bg-black/70 transition-colors z-50"
              >
                &rarr;
              </button>
              {/* Resim Sayacı */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                {activeImageIndex + 1} / {car.photos.length}
              </div>
            </div>
          </Modal>
          {/* Sağ Sütun: Detaylar, İletişim ve Form */}
          <section className="space-y-8" aria-label="Car Details">
            {/* Fiyat / İletişim Bilgileri */}
            <div className="bg-gray-100 dark:bg-gray-800 p-8 rounded-2xl shadow-lg">
              {car.listing_type === "rental" ? (
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
                  <p className="text-4xl font-bold text-red-600 dark:text-red-400">
                    SOLD!
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
            {/* İletişim Formu (Sadece Rental İlanları İçin) */}
            {showContactForm && car.listing_type === "rental" && (
              <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700">
                <form
                  onSubmit={handleSubmit}
                  className="space-y-6"
                  data-captcha="true"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Full Name*
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full p-3 mt-1 rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Email*
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        className="w-full p-3 mt-1 rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Phone*
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                        className="w-full p-3 mt-1 rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Message*
                    </label>
                    <textarea
                      rows={4}
                      required
                      value={formData.message}
                      onChange={(e) =>
                        setFormData({ ...formData, message: e.target.value })
                      }
                      className="w-full p-3 mt-1 rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-green-500"
                      placeholder="Your rental details, preferred dates, etc."
                    ></textarea>
                  </div>
                  <div className="space-y-3">
                    <label className="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
                      <input
                        type="checkbox"
                        checked={consents.financing}
                        onChange={(e) =>
                          setConsents({
                            ...consents,
                            financing: e.target.checked,
                          })
                        }
                        className="rounded text-blue-600 dark:bg-gray-700"
                      />
                      <span className="text-sm">
                        I would like to be contacted for a financing offer
                      </span>
                    </label>
                    <label className="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
                      <input
                        type="checkbox"
                        required
                        checked={consents.privacy}
                        onChange={(e) =>
                          setConsents({
                            ...consents,
                            privacy: e.target.checked,
                          })
                        }
                        className="rounded text-blue-600 dark:bg-gray-700"
                      />
                      <span className="text-sm">
                        I accept the{" "}
                        <a
                          href="/privacy-policy"
                          className="text-green-500 hover:underline"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          privacy policy
                        </a>
                      </span>
                    </label>
                  </div>
                  <button
                    type="submit"
                    className="w-full py-4 rounded-full bg-green-600 text-white font-bold shadow-lg hover:bg-green-700 transition-colors"
                  >
                    Request Rental Information
                  </button>
                </form>
              </div>
            )}
            {car.listing_type === "sale" || car.listing_type === "reserved" ? (
              <div className="space-y-6 text-center">
                <button
                  onClick={() => setShowContactForm((prev) => !prev)}
                  className="w-full py-4 rounded-full bg-gradient-to-r from-green-500 to-blue-500 text-white font-bold shadow-lg transform transition-all duration-300 hover:scale-105"
                >
                  {showContactForm ? "Close Form" : "Make an Appointment"}
                </button>
              </div>
            ) : null}
            {/* İletişim Formu (Sadece Satılık İlanları İçin) */}
            {showContactForm &&
              (car.listing_type === "sale" ||
                car.listing_type === "reserved") && (
                <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700">
                  <form
                    onSubmit={handleSubmit}
                    className="space-y-6"
                    data-captcha="true"
                  >
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Full Name*
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        className="w-full p-3 mt-1 rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Email*
                        </label>
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) =>
                            setFormData({ ...formData, email: e.target.value })
                          }
                          className="w-full p-3 mt-1 rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-green-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Phone*
                        </label>
                        <input
                          type="tel"
                          required
                          value={formData.phone}
                          onChange={(e) =>
                            setFormData({ ...formData, phone: e.target.value })
                          }
                          className="w-full p-3 mt-1 rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-green-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Message*
                      </label>
                      <textarea
                        rows={4}
                        required
                        value={formData.message}
                        onChange={(e) =>
                          setFormData({ ...formData, message: e.target.value })
                        }
                        className="w-full p-3 mt-1 rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-green-500"
                        placeholder="Your preferred dates, etc."
                      ></textarea>
                    </div>
                    <div className="space-y-3">
                      <label className="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
                        <input
                          type="checkbox"
                          checked={consents.financing}
                          onChange={(e) =>
                            setConsents({
                              ...consents,
                              financing: e.target.checked,
                            })
                          }
                          className="rounded text-blue-600 dark:bg-gray-700"
                        />
                        <span className="text-sm">
                          I would like to be contacted for a financing offer
                        </span>
                      </label>
                      <label className="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
                        <input
                          type="checkbox"
                          required
                          checked={consents.privacy}
                          onChange={(e) =>
                            setConsents({
                              ...consents,
                              privacy: e.target.checked,
                            })
                          }
                          className="rounded text-blue-600 dark:bg-gray-700"
                        />
                        <span className="text-sm">
                          I accept the{" "}
                          <a
                            href="/privacy-policy"
                            className="text-green-500 hover:underline"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            privacy policy
                          </a>
                        </span>
                      </label>
                    </div>
                    <button
                      type="submit"
                      className="w-full py-4 rounded-full bg-green-600 text-white font-bold shadow-lg hover:bg-green-700 transition-colors"
                    >
                      Send Appointment Request
                    </button>
                  </form>
                </div>
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
                //{ label: "Body Type", value: car.body_type },
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
                  className="bg-gray-100 dark:bg-gray-800 p-6 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700"
                >
                  <p className="text-gray-600 dark:text-gray-400">
                    {spec.label}
                  </p>
                  <p className="mt-2 text-xl font-semibold dark:text-white">
                    {spec.value}
                  </p>
                </div>
              ))}
            </div>
            {/* Detailed Description */}
            <div className="mt-8">
              {car.description && car.description.length > 0 && (
                <div className="bg-gray-100 dark:bg-gray-800 p-8 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700">
                  <h3 className="text-2xl font-bold mb-4 dark:text-white">
                    Detailed Information
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                    {car.description}
                  </p>
                </div>
              )}
            </div>

            {/* Features */}
            <div className="mt-8 space-y-8">
              {/* Safety Features */}
              {car.features.safety && car.features.safety.length > 0 && (
                <div className="bg-gray-100 dark:bg-gray-800 p-8 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700">
                  <h3 className="text-2xl font-bold mb-4 dark:text-white">
                    Safety Features
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
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
                  <div className="grid grid-cols-2 gap-4">
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
                    <div className="grid grid-cols-2 gap-4">
                      {car.features.entertainment.map((feature, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-2"
                        >
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
    </div>
  );
}
