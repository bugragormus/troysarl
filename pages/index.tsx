import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import Link from 'next/link';

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
  const [cars, setCars] = useState<Car[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchCars = async () => {
      const { data, error } = await supabase
        .from('cars')
        .select('id, brand, model, year, price, fuel_type, photos');

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
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Satılık Arabalar</h1>
      
      <input
        type="text"
        placeholder="Araba ara..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full p-2 border rounded mb-6"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCars.map((car) => (
          <div key={car.id} className="border rounded-lg p-4 shadow-md">
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
            <h2 className="text-xl font-semibold">{car.brand} {car.model}</h2>
            <p>Yıl: {car.year}</p>
            <p>Yakıt Tipi: {car.fuel_type}</p>
            <p className="text-blue-600 mt-2">{car.price.toLocaleString()} €</p>

            <Link
              href={`/cars/${car.id}`}
              className="mt-4 inline-block text-blue-500 hover:underline"
            >
              Detayları Gör
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}