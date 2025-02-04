import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import Link from 'next/link';
import Head from 'next/head';
import Image from 'next/image';
import Car from '@/types/car';

export default function Home() {
  const [featuredCars, setFeaturedCars] = useState<Car[]>([]);

  useEffect(() => {
    const fetchFeaturedCars = async () => {
      const { data, error } = await supabase
        .from('cars')
        .select('*')
        .eq('is_hidden', false)
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) console.error('Error:', error);
      else setFeaturedCars(data || []);
    };

    fetchFeaturedCars();
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Head>
        <title>Troysarl - Premium Vehicle Experience</title>
        <meta name="description" content="Luxury and second-hand vehicles at their finest" />
      </Head>

      {/* Hero Section */}
      <div className="relative h-[70vh]">
        <div className="absolute inset-0 bg-black/60 z-10" />
        <Image
          src="/showroom-hero.jpg"
          alt="Troysarl Showroom"
          fill
          className="object-cover"
          priority
        />
        <div className="relative z-20 flex items-center justify-center h-full text-center">
          <div className="text-white max-w-2xl px-4">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in">
              Redefining Automotive Excellence
            </h1>
            <Link
              href="/cars"
              className="inline-block bg-premium text-white px-8 py-3 rounded-full hover:bg-premium-dark transition-all text-lg shadow-lg"
            >
              Explore Collection →
            </Link>
          </div>
        </div>
      </div>

      {/* Value Propositions */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: '🔒',
                title: 'Certified Vehicles',
                description: '200-point inspection process for guaranteed quality'
              },
              {
                icon: '🌍',
                title: 'Global Delivery',
                description: 'Seamless worldwide shipping solutions'
              },
              {
                icon: '💎',
                title: 'Premium Service',
                description: '24/7 personalized customer support'
              }
            ].map((item, index) => (
              <div key={index} className="bg-white dark:bg-gray-700 p-6 rounded-xl text-center hover:shadow-lg transition-shadow">
                <span className="text-4xl mb-4 inline-block">{item.icon}</span>
                <h3 className="text-xl font-bold mb-2 dark:text-white">{item.title}</h3>
                <p className="text-gray-600 dark:text-gray-300">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Cars */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 dark:text-white">
            Curated Selection
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredCars.map((car) => (
              <div
                key={car.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-shadow"
              >
                <div className="relative h-48 w-full">
                  <Image
                    src={car.photos[0]}
                    alt={`${car.brand} ${car.model}`}
                    fill
                    className="object-cover rounded-t-xl"
                  />
                </div>

                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold dark:text-white">
                        {car.brand} {car.model}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300">{car.year}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${car.listing_type === 'sale' ? 'bg-green-100 text-green-800' :
                        car.listing_type === 'rental' ? 'bg-blue-100 text-blue-800' :
                          'bg-purple-100 text-purple-800'
                      }`}>
                      {car.listing_type === 'both' ? 'Sale/Rental' : car.listing_type}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm dark:text-gray-300">
                    <div>
                      <p className="text-gray-500">Mileage</p>
                      <p>{car.mileage?.toLocaleString()} km</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Body Type</p>
                      <p className="capitalize">{car.body_type}</p>
                    </div>
                  </div>

                  {car.listing_type !== 'rental' && (
                    <p className="text-2xl font-bold text-premium mt-4">
                      €{car.price.toLocaleString()}
                    </p>
                  )}

                  <Link
                    href={`/cars/${car.id}`}
                    className="inline-block w-full mt-4 text-center bg-premium/10 text-premium py-2 rounded-lg hover:bg-premium/20 transition-colors"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <div className="bg-premium text-white py-16">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold mb-6">Ready for Your Next Adventure?</h2>
          <p className="text-xl mb-8">Experience luxury mobility with our exclusive collection</p>
          <Link
            href="/cars"
            className="inline-block bg-white text-premium px-8 py-3 rounded-full hover:bg-gray-100 transition-colors"
          >
            Browse All Vehicles
          </Link>
        </div>
      </div>
    </div>
  );
}