import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import Head from 'next/head';

interface Car {
  id: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  fuel_type: string;
  photos: string[];
  contact_phone: string;
}

export default function CarDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [car, setCar] = useState<Car | null>(null);
  const [showPhone, setShowPhone] = useState(false);

  useEffect(() => {
    const fetchCar = async () => {
      const { data, error } = await supabase
        .from('cars')
        .select('*')
        .eq('id', id)
        .eq('is_hidden', false)
        .single();

      if (error) {
        console.error('Hata:', error);
        router.push('/404');
      }
      else setCar(data);
    };

    if (id) fetchCar();
  }, [id]);

  if (!car) return <div className="container mx-auto p-4">Yükleniyor...</div>;

  return (
    <div className="container mx-auto p-4 dark:bg-gray-900">
      <Head>
        <title>{car.brand} {car.model} - Satılık</title>
        <meta name="description" content={`${car.year} model ${car.brand} ${car.model}, ${car.price} €`} />
      </Head>

      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">{car.brand} {car.model}</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="flex overflow-x-auto gap-2 mb-4">
              {car.photos.map((photo, index) => (
                <img
                  key={index}
                  src={photo}
                  alt={`${car.brand} ${car.model} - Fotoğraf ${index + 1}`}
                  className="w-48 h-48 object-cover rounded-lg"
                />
              ))}
            </div>
          </div>
          <div>
            <p className="dark:text-gray-300">Yıl: {car.year}</p>
            <p className="dark:text-gray-300">Yakıt Tipi: {car.fuel_type}</p>
            <p className="text-2xl font-bold my-4">{car.price.toLocaleString()} €</p>
            <button
              onClick={() => setShowPhone(!showPhone)}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
            >
              {showPhone ? car.contact_phone : 'Telefonu Göster'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
