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
    listing_type: string;
}

export default function CarsPage() {
    const [cars, setCars] = useState<Car[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState<'all' | 'satilik' | 'kiralik'>('all');

    useEffect(() => {
        const fetchCars = async () => {
            const { data, error } = await supabase
                .from('cars')
                .select('*')
                .eq('is_hidden', false);

            if (error) console.error('Hata:', error);
            else setCars(data || []);
        };

        fetchCars();
    }, []);

    const filteredCars = cars.filter(car => {
        const matchesSearch = car.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
            car.model.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filter === 'all' ||
            car.listing_type === filter ||
            car.listing_type === 'her_ikisi';
        return matchesSearch && matchesFilter;
    });

    return (
        <div className="min-h-screen bg-white dark:bg-gray-900">
            <Head>
                <title>Araç Koleksiyonu - Troysarl</title>
                <meta name="description" content="Troysarl premium araç koleksiyonu - Satılık ve kiralık lüks araçlar" />
            </Head>

            <div className="container mx-auto p-4">
                {/* Filtre ve Arama */}
                <div className="mb-8 space-y-4">
                    <h1 className="text-3xl font-bold dark:text-white">Araç Koleksiyonu</h1>

                    <input
                        type="text"
                        placeholder="Marka veya model ara..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                    />

                    <div className="flex flex-wrap gap-2">
                        {['all', 'satilik', 'kiralik'].map((type) => (
                            <button
                                key={type}
                                onClick={() => setFilter(type as any)}
                                className={`px-4 py-2 rounded ${filter === type
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
                                    }`}
                            >
                                {type === 'all' && 'Tümü'}
                                {type === 'satilik' && 'Satılık'}
                                {type === 'kiralik' && 'Kiralık'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Araç Listesi */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCars.map((car) => (
                        <div
                            key={car.id}
                            className="border rounded-lg p-4 shadow-md dark:bg-gray-800 dark:border-gray-700 hover:shadow-lg transition-shadow"
                        >
                            <div className="relative h-48 mb-4">
                                <img
                                    src={car.photos[0]}
                                    alt={`${car.brand} ${car.model}`}
                                    className="w-full h-full object-cover rounded-lg"
                                />
                            </div>

                            <div className="space-y-2">
                                <h2 className="text-xl font-bold dark:text-white">
                                    {car.brand} {car.model}
                                </h2>
                                <div className="flex justify-between text-sm dark:text-gray-300">
                                    <span>{car.year} Model</span>
                                    <span>{car.fuel_type}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-blue-600 dark:text-blue-400 text-xl font-semibold">
                                        {car.price.toLocaleString()} €
                                    </span>
                                    <span className={`px-2 py-1 text-xs rounded-full ${car.listing_type === 'satilik' ? 'bg-green-100 text-green-800' :
                                        car.listing_type === 'kiralik' ? 'bg-blue-100 text-blue-800' :
                                            'bg-purple-100 text-purple-800'
                                        }`}>
                                        {car.listing_type === 'her_ikisi' ? 'Satılık/Kiralık' : car.listing_type}
                                    </span>
                                </div>
                                <Link
                                    href={`/cars/${car.id}`}
                                    className="inline-block w-full mt-4 text-center bg-gray-100 dark:bg-gray-700 py-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                >
                                    Detayları İncele
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}