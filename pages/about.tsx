import Head from 'next/head';
import Image from 'next/image';
import { BuildingOfficeIcon, UserGroupIcon, GlobeEuropeAfricaIcon } from '@heroicons/react/24/outline';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Head>
        <title>Hakkımızda - Troysarl</title>
        <meta name="description" content="Troysarl hakkında detaylı bilgi ve şirket profili" />
      </Head>

      {/* Hero Section */}
      <div className="relative bg-gray-100 dark:bg-gray-800 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Lüks Araç Deneyiminde Öncü
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            2010'dan beri sektörde liderlik
          </p>
        </div>
      </div>

      {/* Tarihçe */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-16">
            <div className="mb-8 lg:mb-0">
              <Image
                src="/troysarl_logos.png"
                alt="Troysarl Showroom"
                width={800}
                height={600}
                className="rounded-lg shadow-xl"
              />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                Bizim Hikayemiz
              </h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                Lüksemburg'un kalbinde küçük bir aile şirketi olarak başlayan yolculuğumuz,
                bugün Avrupa'nın önde gelen premium araç tedarikçilerinden biri olmamızla taçlandı.
              </p>
              <div className="flex items-center space-x-4 mb-4">
                <BuildingOfficeIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                <span className="text-xl font-semibold dark:text-white">3000+ m² Showroom</span>
              </div>
              <div className="flex items-center space-x-4">
                <GlobeEuropeAfricaIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                <span className="text-xl font-semibold dark:text-white">12 Ülkede Hizmet</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Değerlerimiz */}
      <section className="bg-gray-50 dark:bg-gray-800 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
            Temel Değerlerimiz
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: 'Şeffaflık',
                icon: UserGroupIcon,
                description: 'Tüm iş süreçlerimizde açık ve anlaşılır iletişim'
              },
              {
                title: 'Kalite',
                icon: UserGroupIcon,
                description: 'Sadece sertifikalı ve titiz kontrolden geçmiş araçlar'
              },
              {
                title: 'Müşteri Odaklılık',
                icon: UserGroupIcon,
                description: '7/24 destek ve kişiye özel çözümler'
              }
            ].map((value, index) => (
              <div key={index} className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-lg">
                <value.icon className="h-12 w-12 text-blue-600 dark:text-blue-400 mb-4" />
                <h3 className="text-xl font-semibold dark:text-white mb-2">{value.title}</h3>
                <p className="text-gray-600 dark:text-gray-300">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ekip */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
            Uzman Ekibimiz
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {['Marc Schmit', 'Sophie Weber'].map((name, index) => (
              <div key={index} className="text-center">
                <div className="relative w-48 h-48 mx-auto mb-4">
                  <Image
                    src={`/troysarl_logos.png`}
                    alt={name}
                    fill
                    className="rounded-full object-cover border-4 border-blue-500"
                  />
                </div>
                <h3 className="text-xl font-semibold dark:text-white">{name}</h3>
                <p className="text-gray-600 dark:text-gray-300">Uzman Danışman</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}