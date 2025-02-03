import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Head>
        <title>Troysarl - Premium Araç Deneyimi</title>
        <meta name="description" content="Lüks ve ikinci el araçlarda Avrupa'nın önde gelen tedarikçisi" />
      </Head>

      {/* Hero Section */}
      <div className="relative h-[70vh]">
        <Image
          src="/troysarl_logos.png"
          alt="Troysarl Showroom"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <div className="text-center text-white max-w-2xl px-4">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in">
              Lüks Araçlarda Mükemmellik
            </h1>
            <Link
              href="/cars"
              className="inline-block bg-blue-600 text-white px-8 py-3 rounded-full hover:bg-blue-700 transition-all duration-300 text-lg"
            >
              Koleksiyonu Keşfet →
            </Link>
          </div>
        </div>
      </div>

      {/* Hizmetler Bölümü */}
      <section className="container mx-auto py-16 px-4">
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              title: '7/24 Destek',
              icon: '⏰',
              description: 'Uzman ekibimiz her an yanınızda'
            },
            {
              title: 'Sertifikalı Araçlar',
              icon: '✅',
              description: '254 noktada kontrol edilmiş araçlar'
            },
            {
              title: 'Global Hizmet',
              icon: '🌍',
              description: '12 ülkede özel teslimat imkanı'
            }
          ].map((service, index) => (
            <div key={index} className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl text-center hover:shadow-lg transition-all">
              <div className="text-4xl mb-4">{service.icon}</div>
              <h3 className="text-xl font-bold mb-2 dark:text-white">{service.title}</h3>
              <p className="text-gray-600 dark:text-gray-300">{service.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}