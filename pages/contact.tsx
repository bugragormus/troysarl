import { useState } from "react";
import Head from "next/head";
import toast, { Toaster } from "react-hot-toast";

export default function Contact() {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!consents.privacy) {
      toast.error("You must accept the privacy policy");
      return;
    }

    const response = await fetch(
      `https://formspree.io/f/${process.env.NEXT_PUBLIC_FORMSPREE_FORM_ID}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      }
    );

    if (response.ok) {
      toast.success("Message sent successfully!");
      setFormData({ name: "", email: "", phone: "", message: "" });
    } else {
      toast.error("An error has occurred. Please try again.");
    }
  };

  // SEO Meta Verileri
  const metaTitle =
    "Contact Us - Troy Cars Lux Sarl - Premium Used Cars in Luxembourg 🇱🇺";
  const metaDescription =
    "We are here to help you. Reach out to us and we will get back to you as soon as possible.";
  const canonicalUrl = "https://troysarl.com/contact";
  const ogImageUrl = "https://troysarl.com/og-contact.jpg";

  return (
    <div
      className="min-h-screen bg-white dark:bg-gradient-to-b from-premium-light to-white transition-colors duration-300"
      aria-label="Contact Page"
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

      <div className="max-w-4xl mx-auto py-16 px-4">
        {/* Başlık Bölümü */}
        <div className="text-center mb-12">
          <h1
            className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-blue-500"
            aria-label="Contact Us"
          >
            Get in Touch
          </h1>
          <p
            className="mt-4 text-lg text-gray-600 dark:text-gray-300"
            aria-label="Contact Us Description"
          >
            We are here to help you. Reach out to us and we will get back to you
            as soon as possible.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          {/* İletişim Bilgileri Kartı */}
          <div className="bg-gray-50 dark:bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
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

          {/* İletişim Formu Kartı */}
          <div
            className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700"
            aria-label="Contact Form"
          >
            <form
              onSubmit={handleSubmit}
              className="space-y-6"
              aria-label="Contact Form"
            >
              <div className="space-y-4">
                <div>
                  <label
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    aria-label="Full Name"
                  >
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="mt-1 block w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Email
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
                      Phone
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
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Message
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                    className="mt-1 block w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Your message here..."
                  ></textarea>
                </div>
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
                className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white py-3 rounded-full shadow-lg hover:scale-105 transition-all duration-300 font-semibold"
                aria-label="Send Message"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
      <Toaster position="top-right" reverseOrder={false} />
    </div>
  );
}
