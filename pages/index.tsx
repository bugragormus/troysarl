import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import Link from 'next/link';
import Head from 'next/head';

interface Car {
  id: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  fuel_type: string;
  photos: string[];
}

export default function Home() {

  <Head>
    <title>Troysarl - Premium Araçlar</title>
    <meta name="description" content="Lüks ve ikinci el araçlar için en iyi destinasyon" />
  </Head>
  
  const [cars, setCars] = useState<Car[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchCars = async () => {
      const { data, error } = await supabase
        .from('cars')
        .select('id, brand, model, year, price, fuel_type, photos')
        .eq('is_hidden', false);

      if (error) console.error('Hata:', error);
      else setCars(data || []);
    };

    fetchCars();
  }, []);

  const filteredCars = cars.filter(car =>
    car.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
    car.model.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900"> {/* Ana arkaplan fix */}
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6 dark:text-white">Satılık Arabalar</h1>

        <input
          type="text"
          placeholder="Araba ara..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2 border rounded mb-6 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCars.map((car) => (
            <div
              key={car.id}
              className="border rounded-lg p-4 shadow-md dark:bg-gray-800 dark:border-gray-700"
            >
              <div className="flex overflow-x-auto gap-2 mb-4">
                {car.photos?.map((photo, index) => (
                  <img
                    key={index}
                    src={photo}
                    alt={`${car.brand} ${car.model} - Fotoğraf ${index + 1}`}
                    className="w-32 h-32 object-cover rounded-lg"
                  />
                ))}
              </div>
              <h2 className="text-xl font-semibold dark:text-white">{car.brand} {car.model}</h2>
              <p className="dark:text-gray-300">Yıl: {car.year}</p>
              <p className="dark:text-gray-300">Yakıt Tipi: {car.fuel_type}</p>
              <p className="text-blue-600 dark:text-blue-400 mt-2">{car.price.toLocaleString()} €</p>

              <Link
                href={`/cars/${car.id}`}
                className="mt-4 inline-block text-blue-500 hover:underline dark:text-blue-400"
              >
                Detayları Gör
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}