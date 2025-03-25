import { useState } from "react";
import Head from "next/head";
import toast from "react-hot-toast";
import * as Sentry from "@sentry/react";
import Script from "next/script";

export default function CareersPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    email: "",
    phone: "",
    message: "",
  });
  const [consents, setConsents] = useState({
    financing: false,
    privacy: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      // FormData oluştur
      const form = new FormData();
      form.append("firstName", formData.firstName);
      form.append("email", formData.email);
      form.append("phone", formData.phone);
      form.append("message", formData.message);

      // Formspree'ye gönder
      const response = await fetch(
        `https://formspree.io/f/${process.env.NEXT_PUBLIC_FORMSPREE_FORM_ID}`,
        {
          method: "POST",
          body: form,
          headers: {
            Accept: "application/json",
          },
        }
      );

      if (response.ok) {
        toast.success("Message sent successfully!");
        setFormData({
          firstName: "",
          email: "",
          phone: "",
          message: "",
        });
      } else {
        toast.error("An error has occurred. Please try again.");
      }

      setSubmitSuccess(true);
      setFormData({
        firstName: "",
        email: "",
        phone: "",
        message: "",
      });
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || "An error occurred. Please try again.");
        Sentry.captureException(err); // Burada err'i gönderiyoruz, çünkü err bir Error instance'ı
      } else {
        setError("An unknown error occurred. Please try again.");
        Sentry.captureException(new Error("An unknown error occurred"));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // SEO Meta Verileri
  const metaTitle =
    "Appointments - Troy Cars | Book an Appointment | Troy Cars SARL | Troysarl | Luxembourg | Car Service Appointments | Schedule a Visit | Rendez-vous - Troy Cars | Prendre un rendez-vous | Troy Cars SARL | Troysarl | Luxembourg | Rendez-vous pour service auto | Terminvereinbarung - Troy Cars | Termin buchen | Troy Cars SARL | Troysarl | Luxemburg | Autodienst Termine | Besuch vereinbaren";

  const metaDescription =
    "Book an appointment with Troy Cars for vehicle services and consultations. Schedule your visit today! Troy Cars is a Luxembourg-based second-hand vehicle trading company committed to reliability and high-quality service. Prenez rendez-vous avec Troy Cars pour des services automobiles et des consultations. Planifiez votre visite dès aujourd'hui ! Troy Cars est une entreprise luxembourgeoise spécialisée dans le commerce de véhicules d'occasion, opérant avec un engagement envers la fiabilité et un service de haute qualité. Vereinbaren Sie einen Termin mit Troy Cars für Fahrzeugdienstleistungen und Beratungen. Planen Sie noch heute Ihren Besuch! Troy Cars ist ein in Luxemburg ansässiges Unternehmen für den Handel mit Gebrauchtfahrzeugen, das mit einem Engagement für Zuverlässigkeit und hochwertigen Service arbeitet.";

  const canonicalUrl = "https://troysarl.com/appointments";
  const ogImageUrl = "https://troysarl.com/og-appointments.jpg";

  return (
    <div
      className="min-h-screen bg-white dark:bg-gradient-to-b from-premium-light to-white transition-colors duration-300"
      aria-label="Careers Page"
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

      <div className="max-w-4xl mx-auto py-16 px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-blue-500">
            Let&apos;s Make an Appointment!
          </h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
            Schedule an appointment with Troy Cars to explore our selection of
            high-quality used cars and find your perfect car today!
          </p>
        </div>

        {submitSuccess && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            Application submitted successfully!
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        <div
          className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700"
          aria-label="Job Application Form"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Full Name*
              </label>
              <input
                type="text"
                required
                value={formData.firstName}
                onChange={(e) =>
                  setFormData({ ...formData, firstName: e.target.value })
                }
                className="mt-1 block w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

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
                className="mt-1 block w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Phone Number*
              </label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className="mt-1 block w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Message
              </label>
              <textarea
                rows={4}
                value={formData.message}
                onChange={(e) =>
                  setFormData({ ...formData, message: e.target.value })
                }
                className="mt-1 block w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Enter your preferred date, time, and the car you're interested in..."
              />
            </div>
            {/* Consents */}
            <div className="space-y-3">
              <label className="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
                <input
                  type="checkbox"
                  checked={consents.financing}
                  onChange={(e) =>
                    setConsents({ ...consents, financing: e.target.checked })
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
                    setConsents({ ...consents, privacy: e.target.checked })
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
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white py-3 rounded-full shadow-lg hover:scale-105 transition-all duration-300 font-semibold"
            >
              {isSubmitting ? "Sending..." : "Send Appointment Request"}
            </button>
          </form>
        </div>

        <div
          className="mt-6 bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700"
          aria-label="Job Application Form"
        >
          <h2
            className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6"
            aria-label="Contact Information"
          >
            Contact Information
          </h2>

          <div className="space-y-4">
            <div>
              <h3
                className="text-lg font-semibold text-gray-700 dark:text-gray-300"
                aria-label="Address"
              >
                Address
              </h3>
              <p
                className="text-gray-600 dark:text-gray-400"
                aria-label="Address"
              >
                {process.env.NEXT_PUBLIC_ADRESS}
              </p>
            </div>

            <div>
              <h3
                className="text-lg font-semibold text-gray-700 dark:text-gray-300"
                aria-label="Phone Number"
              >
                E-Mail
              </h3>
              <p
                className="text-gray-600 dark:text-gray-400"
                aria-label="Phone Number"
              >
                {process.env.NEXT_PUBLIC_EMAIL}
              </p>
            </div>
          </div>

          {/* Google Maps Embed */}
          <div className="mt-8 h-64 rounded-lg overflow-hidden shadow-md">
            <iframe
              width="100%"
              height="100%"
              frameBorder="0"
              style={{ border: 0 }}
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2589.4155842268747!2d6.124349!3d49.533308!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4795491431775f71%3A0xcfdff054d6367aa5!2sTroy%20Cars%20Lux%20Sarl!5e0!3m2!1str!2str!4v1737918898496!5m2!1str!2str"
              allowFullScreen
              className="w-full h-full"
            ></iframe>
          </div>
        </div>
      </div>
    </div>
  );
}
