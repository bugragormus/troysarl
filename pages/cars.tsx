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
    listing_type: 'sale' | 'rental' | 'both';
    mileage: number;
    body_type: string;
    features: {
        safety: string[];
        comfort: string[];
        entertainment: string[];
    };
}

const bodyTypeOptions = [
    'Sedan', 'Coupe', 'Hatchback', 'Pickup', 'Off-Road', 'Sport',
    'Van', 'Convertible', 'Crossover', 'SUV', 'Station Wagon',
    'Muscle', 'Roadster', 'Cabriolet', 'Compact'
];

const fuelTypeOptions = ['Petrol', 'Diesel', 'Electric', 'Hybrid'];
const featureOptions = [
    'ABS', 'Airbags', 'Parking Sensors', 'Climate Control',
    'Heated Seats', 'Navigation', 'Bluetooth', 'Sunroof'
];

export default function CarsPage() {
    const [cars, setCars] = useState<Car[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        listingType: 'all',
        bodyType: '',
        fuelType: '',
        minPrice: '',
        maxPrice: '',
        minYear: '',
        maxYear: '',
        minMileage: '',
        maxMileage: '',
        features: [] as string[],
    });

    useEffect(() => {
        const fetchCars = async () => {
            const { data, error } = await supabase
                .from('cars')
                .select('*')
                .eq('is_hidden', false);

            if (error) console.error('Error:', error);
            else setCars(data || []);
        };

        fetchCars();
    }, []);

    const filteredCars = cars.filter(car => {
        const matchesSearch = car.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
            car.model.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesListingType = filters.listingType === 'all' ||
            car.listing_type === filters.listingType ||
            (filters.listingType === 'both' && car.listing_type === 'both');

        const matchesBodyType = !filters.bodyType || car.body_type === filters.bodyType;

        const matchesFuelType = !filters.fuelType || car.fuel_type === filters.fuelType;

        const matchesPrice = (
            (!filters.minPrice || car.price >= Number(filters.minPrice)) &&
            (!filters.maxPrice || car.price <= Number(filters.maxPrice))
        );

        const matchesYear = (
            (!filters.minYear || car.year >= Number(filters.minYear)) &&
            (!filters.maxYear || car.year <= Number(filters.maxYear))
        );

        const matchesMileage = (
            (!filters.minMileage || car.mileage >= Number(filters.minMileage)) &&
            (!filters.maxMileage || car.mileage <= Number(filters.maxMileage))
        );

        const matchesFeatures = filters.features.length === 0 ||
            filters.features.every(feature =>
                Object.values(car.features).flat().includes(feature)
            );

        return matchesSearch && matchesListingType && matchesBodyType &&
            matchesFuelType && matchesPrice && matchesYear &&
            matchesMileage && matchesFeatures;
    });

    const handleFeatureToggle = (feature: string) => {
        setFilters(prev => ({
            ...prev,
            features: prev.features.includes(feature)
                ? prev.features.filter(f => f !== feature)
                : [...prev.features, feature]
        }));
    };

    const resetFilters = () => {
        setFilters({
            listingType: 'all',
            bodyType: '',
            fuelType: '',
            minPrice: '',
            maxPrice: '',
            minYear: '',
            maxYear: '',
            minMileage: '',
            maxMileage: '',
            features: [] as string[]
        });
    };

    return (
        <div className="min-h-screen bg-white dark:bg-gray-900">
            <Head>
                <title>Vehicle Catalog - Troysarl</title>
                <meta name="description" content="Browse our premium selection of vehicles" />
            </Head>

            <div className="container mx-auto p-4 lg:flex lg:gap-8">
                {/* Filters Sidebar */}
                <div className="lg:w-80 mb-8 lg:mb-0 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold dark:text-white">Filters</h2>
                        <button onClick={resetFilters} className="text-sm text-blue-600 hover:underline dark:text-blue-400">
                            Clear All
                        </button>
                    </div>

                    <div className="space-y-6">
                        {/* Listing Type */}
                        <div>
                            <h3 className="font-semibold mb-2 dark:text-gray-300">Listing Type</h3>
                            <select
                                value={filters.listingType}
                                onChange={(e) => setFilters({ ...filters, listingType: e.target.value })}
                                className="w-full p-2 rounded border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            >
                                <option value="all">All Listings</option>
                                <option value="sale">For Sale</option>
                                <option value="rental">For Rent</option>
                                <option value="both">Both</option>
                            </select>
                        </div>

                        {/* Body Type */}
                        <div>
                            <h3 className="font-semibold mb-2 dark:text-gray-300">Body Type</h3>
                            <select
                                value={filters.bodyType}
                                onChange={(e) => setFilters({ ...filters, bodyType: e.target.value })}
                                className="w-full p-2 rounded border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            >
                                <option value="">All Body Types</option>
                                {bodyTypeOptions.map(option => (
                                    <option key={option} value={option}>{option}</option>
                                ))}
                            </select>
                        </div>

                        {/* Price Range */}
                        <div>
                            <h3 className="font-semibold mb-2 dark:text-gray-300">Price Range (€)</h3>
                            <div className="grid grid-cols-2 gap-2">
                                <input
                                    type="number"
                                    placeholder="Min"
                                    value={filters.minPrice}
                                    onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                                    className="p-2 rounded border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                />
                                <input
                                    type="number"
                                    placeholder="Max"
                                    value={filters.maxPrice}
                                    onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                                    className="p-2 rounded border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                />
                            </div>
                        </div>

                        {/* Year Range */}
                        <div>
                            <h3 className="font-semibold mb-2 dark:text-gray-300">Year</h3>
                            <div className="grid grid-cols-2 gap-2">
                                <input
                                    type="number"
                                    placeholder="Min"
                                    value={filters.minYear}
                                    onChange={(e) => setFilters({ ...filters, minYear: e.target.value })}
                                    className="p-2 rounded border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                />
                                <input
                                    type="number"
                                    placeholder="Max"
                                    value={filters.maxYear}
                                    onChange={(e) => setFilters({ ...filters, maxYear: e.target.value })}
                                    className="p-2 rounded border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                />
                            </div>
                        </div>

                        {/* Features */}
                        <div>
                            <h3 className="font-semibold mb-2 dark:text-gray-300">Features</h3>
                            <div className="grid grid-cols-2 gap-2">
                                {featureOptions.map(feature => (
                                    <label
                                        key={feature}
                                        className="flex items-center space-x-2 dark:text-gray-400 text-sm"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={filters.features.includes(feature)}
                                            onChange={() => handleFeatureToggle(feature)}
                                            className="rounded text-blue-600 dark:bg-gray-700"
                                        />
                                        <span>{feature}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Fuel Type */}
                        <div>
                            <h3 className="font-semibold mb-2 dark:text-gray-300">Fuel Type</h3>
                            <select
                                value={filters.fuelType}
                                onChange={(e) => setFilters({ ...filters, fuelType: e.target.value })}
                                className="w-full p-2 rounded border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            >
                                <option value="">All Fuel Types</option>
                                {fuelTypeOptions.map(option => (
                                    <option key={option} value={option}>{option}</option>
                                ))}
                            </select>
                        </div>

                        {/* Mileage Range */}
                        <div>
                            <h3 className="font-semibold mb-2 dark:text-gray-300">Mileage (km)</h3>
                            <div className="grid grid-cols-2 gap-2">
                                <input
                                    type="number"
                                    placeholder="Min"
                                    value={filters.minMileage}
                                    onChange={(e) => setFilters({ ...filters, minMileage: e.target.value })}
                                    className="p-2 rounded border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                />
                                <input
                                    type="number"
                                    placeholder="Max"
                                    value={filters.maxMileage}
                                    onChange={(e) => setFilters({ ...filters, maxMileage: e.target.value })}
                                    className="p-2 rounded border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1">
                    <div className="mb-8">
                        <input
                            type="text"
                            placeholder="Search by brand or model..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full p-2 rounded border dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                        {filteredCars.map(car => (
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
                                        <span>{car.year}</span>
                                        <span>{car.body_type}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        {car.listing_type !== 'rental' && (
                                            <span className="text-blue-600 dark:text-blue-400 text-xl font-semibold">
                                                €{car.price.toLocaleString()}
                                            </span>
                                        )}
                                        <span className={`px-2 py-1 text-xs rounded-full ${car.listing_type === 'sale' ? 'bg-green-100 text-green-800' :
                                            car.listing_type === 'rental' ? 'bg-blue-100 text-blue-800' :
                                                'bg-purple-100 text-purple-800'
                                            }`}>
                                            {car.listing_type === 'both' ? 'Sale/Rental' : car.listing_type}
                                        </span>
                                    </div>
                                    <Link
                                        href={`/cars/${car.id}`}
                                        className="inline-block w-full mt-4 text-center bg-gray-100 dark:bg-gray-700 py-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                    >
                                        View Details
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}