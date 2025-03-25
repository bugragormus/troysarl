// pages/about.tsx
import Head from "next/head";
import Image from "next/image";
import { UserGroupIcon } from "@heroicons/react/24/outline";
import Script from "next/script";

// SEO Meta Verileri
const metaTitle =
  "About Us - Troy Cars | About Us Page | Troy Cars SARL | Troysarl | Luxembourg | À propos de nous - Troy Cars | Page À propos | Troy Cars SARL | Troysarl | Luxembourg | Über uns - Troy Cars | Über uns Seite | Troy Cars SARL | Troysarl | Luxemburg";

const metaDescription =
  "As a Luxembourg-based used car trading company, we operate with a commitment to reliability and high-quality service. Prioritizing customer satisfaction, we strive to offer the best options to help you find your dream car. With our extensive vehicle portfolio and transparent trading approach, we continue to grow every day, aiming to provide you with the best possible experience. En tant qu'entreprise de commerce de voitures d'occasion basée au Luxembourg, nous opérons avec un engagement envers la fiabilité et un service de haute qualité. En priorisant la satisfaction de nos clients, nous nous efforçons d'offrir les meilleures options pour vous aider à trouver la voiture de vos rêves. Grâce à notre vaste portefeuille de véhicules et à notre approche transparente du commerce, nous continuons de croître chaque jour afin de vous offrir la meilleure expérience possible. Als in Luxemburg ansässiges Unternehmen für den Handel mit Gebrauchtwagen arbeiten wir mit einem Engagement für Zuverlässigkeit und hochwertigen Service. Mit dem Fokus auf Kundenzufriedenheit bemühen wir uns, Ihnen die besten Optionen zu bieten, damit Sie Ihr Traumauto finden. Mit unserem umfangreichen Fahrzeugportfolio und unserem transparenten Handelsansatz wachsen wir jeden Tag weiter und möchten Ihnen die bestmögliche Erfahrung bieten.";

const canonicalUrl = "https://troysarl.com/about";
const ogImageUrl = "https://troysarl.com/og-about.jpg";

export default function AboutPage() {
  return (
    <div
      className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300"
      aria-label="About Page"
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
            "@type": "AboutPage",
            name: "About Us",
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

      {/* Hero Bölümü */}
      <header
        className="relative bg-gradient-to-r from-green-500 to-blue-500 py-20"
        aria-label="Hero Section"
      >
        <div className="absolute inset-0" aria-label=" Background Image">
          {/* Arka plan görseli, hafif opaklıkla */}
          <Image
            src="/about-bg.jpg"
            alt="Luxembourg Cars"
            fill
            objectFit="cover"
            className="opacity-20"
          />
        </div>
        <div className="relative z-10 text-center px-4">
          <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-4 drop-shadow-lg">
            Leading Luxury Vehicle Experience
          </h1>
        </div>
      </header>

      {/* Hikayemiz Bölümü */}
      <section
        className="py-16 bg-gray-50 dark:bg-gray-800"
        aria-label="Our Story"
      >
        <div className="max-w-7xl mx-auto px-4 lg:grid lg:grid-cols-2 lg:gap-16 items-center">
          <div className="mb-8 lg:mb-0">
            <div className="relative h-80 w-full rounded-lg shadow-xl overflow-hidden">
              <Image
                src="/troysarl_logos.png"
                alt="Luxembourg Car Showroom"
                fill
                objectFit="cover"
              />
            </div>
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6">
              Our Story
            </h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
              As a Luxembourg-based used car trading company, we operate with a
              commitment to reliability and high-quality service. Prioritizing
              customer satisfaction, we strive to offer the best options to help
              you find your dream car. With our extensive vehicle portfolio and
              transparent trading approach, we continue to grow every day,
              aiming to provide you with the best possible experience.
            </p>
          </div>
        </div>
      </section>

      {/* Temel Değerler Bölümü */}
      <section
        className="py-16 bg-white dark:bg-gray-900"
        aria-label="Core Values"
      >
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-800 dark:text-gray-100 mb-12">
            Core Values
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Transparency",
                icon: UserGroupIcon,
                description:
                  "Clear and understandable communication in all our business processes",
              },
              {
                title: "Quality",
                icon: UserGroupIcon,
                description: "Only certified and rigorously inspected vehicles",
              },
              {
                title: "Customer Orientation",
                icon: UserGroupIcon,
                description: "24/7 support and customized solutions",
              },
            ].map((item, index) => (
              <div
                key={index}
                className="bg-gray-50 dark:bg-gray-800 p-8 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-2xl transition-all duration-300"
              >
                <item.icon className="h-12 w-12 text-blue-600 dark:text-blue-400 mb-4" />
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">
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

      {/*
       Ekip Bölümü
      <section className="py-16 bg-gradient-to-r from-green-500 to-blue-500 text-white">
        <div className="max-w-7xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold mb-6">Expert Team</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {['Buğra GÖRMÜŞ', 'Ufuk DEMİR'].map((name, index) => (
              <div key={index} className="text-center">
                <div className="relative w-48 h-48 mx-auto mb-4 rounded-full overflow-hidden border-4 border-white shadow-lg">
                  <Image
                    src="/troysarl_logos.png"
                    alt={name}
                    fill
                    objectFit="cover"
                  />
                </div>
                <h3 className="text-xl font-bold">{name}</h3>
                <p className="text-gray-200">Expert Consultant</p>
              </div>
            ))}
          </div>
        </div>
      </section>  */}
    </div>
  );
}
