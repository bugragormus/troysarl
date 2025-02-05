// pages/admin.tsx
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import Car from '@/types/car';

const bodyTypeOptions = [
    'Sedan', 'Coupe', 'Hatchback', 'Pickup', 'Off-Road', 'Sport',
    'Van', 'Convertible', 'Crossover', 'SUV', 'Station Wagon',
    'Muscle', 'Roadster', 'Cabriolet', 'Compact'
];

const featureOptions: { [key: string]: string[] } = {
    safety: ['ABS', 'Airbags', 'Parking Sensors', 'Lane Assist', 'Blind Spot Detection'],
    comfort: ['Climate Control', 'Heated Seats', 'Keyless Entry', 'Sunroof', 'Power Windows'],
    entertainment: ['Navigation', 'Bluetooth', 'Apple CarPlay', 'Premium Sound', 'Rear Camera']
};

export default function AdminPanel() {
    const [password, setPassword] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingCar, setEditingCar] = useState<Car | null>(null);

    // Car Form State
    const [cars, setCars] = useState<Car[]>([]);
    const [brand, setBrand] = useState('');
    const [model, setModel] = useState('');
    // Eski "year" state yerine manufactureDate adında string state kullanıyoruz
    const [manufactureDate, setManufactureDate] = useState<string>('');
    const [price, setPrice] = useState<number | undefined>(undefined);
    const [mileage, setMileage] = useState<number | undefined>(undefined);
    const [bodyType, setBodyType] = useState('');
    const [color, setColor] = useState('');
    const [horsepower, setHorsepower] = useState<number | undefined>(undefined);
    const [transmission, setTransmission] = useState('Automatic');
    const [doors, setDoors] = useState<number>(5);
    const [fuelType, setFuelType] = useState('Petrol');
    const [listingType, setListingType] = useState<'sale' | 'rental' | 'both'>('sale');
    const [description, setDescription] = useState('');
    const [selectedFeatures, setSelectedFeatures] = useState<{ [key: string]: boolean }>({});

    // Photo Upload State
    const [uploading, setUploading] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);

    // Fetch Cars
    useEffect(() => {
        const fetchCars = async () => {
            const { data, error } = await supabase.from('cars').select('*');
            if (error) console.error('Error:', error);
            else setCars(data || []);
        };
        if (isAuthenticated) fetchCars();
    }, [isAuthenticated]);

    // Handle Login
    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
            setIsAuthenticated(true);
        } else {
            alert('Incorrect password!');
        }
    };

    // File Handling
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;
        setSelectedFiles(Array.from(e.target.files));
    };

    const handleFileUpload = async () => {
        if (!selectedFiles.length) return;
        setUploading(true);
        try {
            const urls = await Promise.all(
                selectedFiles.map(async (file) => {
                    const fileName = `${Date.now()}_${file.name}`;
                    const { data, error } = await supabase.storage
                        .from('car-photos')
                        .upload(fileName, file);
                    if (error) throw error;
                    return supabase.storage.from('car-photos').getPublicUrl(data.path).data.publicUrl;
                })
            );
            setUploadedUrls((prev) => [...prev, ...urls]);
        } catch (error: any) {
            alert(`Upload error: ${error.message}`);
        } finally {
            setUploading(false);
            setSelectedFiles([]);
        }
    };

    // Delete Photo
    const handleDeletePhoto = async (url: string) => {
        if (!confirm('Delete this photo?')) return;
        const fileName = new URL(url).pathname.split('/').pop();
        const { error } = await supabase.storage.from('car-photos').remove([fileName || '']);
        if (error) alert(`Delete failed: ${error.message}`);
        else setUploadedUrls((prev) => prev.filter((u) => u !== url));
    };

    // Updating features
    const handleEditFeatureToggle = (category: string, feature: string) => {
        if (!editingCar) return;

        const updatedFeatures = { ...editingCar.features };
        const currentFeatures = updatedFeatures[category] || [];

        if (currentFeatures.includes(feature)) {
            updatedFeatures[category] = currentFeatures.filter(f => f !== feature);
        } else {
            updatedFeatures[category] = [...currentFeatures, feature];
        }

        setEditingCar({ ...editingCar, features: updatedFeatures });
    };

    // Updating car details
    const handleUpdateCar = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingCar) return;

        try {
            const { data, error } = await supabase
                .from('cars')
                .update({
                    ...editingCar,
                    year: manufactureDate, // Veya manufactureDate kullanılıyorsa
                    price: Number(editingCar.price),
                    mileage: editingCar.mileage ? Number(editingCar.mileage) : null,
                    doors: Number(editingCar.doors),
                })
                .eq('id', editingCar.id)
                .select();

            if (error) throw error;
            if (data?.[0]) {
                setCars(prev => prev.map(c => c.id === data[0].id ? data[0] : c));
                setIsEditModalOpen(false);
                alert('Araç başarıyla güncellendi!');
            }
        } catch (error: any) {
            alert(`Güncelleme hatası: ${error.message}`);
        }
    };

    // Feature Selection
    const handleFeatureToggle = (category: string, feature: string) => {
        setSelectedFeatures((prev) => ({
            ...prev,
            [`${category}-${feature}`]: !prev[`${category}-${feature}`],
        }));
    };

    // Submit Car
    const handleAddCar = async (e: React.FormEvent) => {
        e.preventDefault();
        // manufactureDate (tarih) zorunlu, price de zorunlu
        if (!brand || !model || !manufactureDate || !price || uploadedUrls.length === 0) {
            alert('Please fill all required fields!');
            return;
        }
        const features = {
            safety: Object.keys(selectedFeatures)
                .filter((key) => key.startsWith('safety-') && selectedFeatures[key])
                .map((key) => key.replace('safety-', '')),
            comfort: Object.keys(selectedFeatures)
                .filter((key) => key.startsWith('comfort-') && selectedFeatures[key])
                .map((key) => key.replace('comfort-', '')),
            entertainment: Object.keys(selectedFeatures)
                .filter((key) => key.startsWith('entertainment-') && selectedFeatures[key])
                .map((key) => key.replace('entertainment-', '')),
        };

        try {
            const { data, error } = await supabase
                .from('cars')
                .insert([
                    {
                        brand,
                        model,
                        year: manufactureDate, // ISO format (YYYY-MM-DD) olarak gönderilecek
                        price,
                        mileage,
                        body_type: bodyType,
                        color,
                        horsepower,
                        transmission,
                        doors,
                        fuel_type: fuelType,
                        listing_type: listingType,
                        photos: uploadedUrls,
                        description,
                        features,
                    },
                ])
                .select();
            if (error) throw error;
            if (data?.[0]) {
                setCars((prev) => [...prev, data[0]]);
                // Reset form
                setBrand('');
                setModel('');
                setManufactureDate('');
                setPrice(undefined);
                setUploadedUrls([]);
                setSelectedFeatures({});
                alert('Car added successfully!');
            }
        } catch (error: any) {
            alert(`Error: ${error.message}`);
        }
    };

    // Delete Car (Fotoğraflar da silinecek)
    const handleDeleteCar = async (id: string) => {
        if (!confirm('Delete this car and all photos?')) return;
        try {
            const car = cars.find((c) => c.id === id);
            if (!car) throw new Error('Car not found');

            if (car.photos?.length) {
                const filePaths = car.photos
                    .map((url) => {
                        try {
                            const parsedUrl = new URL(url);
                            const fullPath = decodeURIComponent(parsedUrl.pathname);
                            const pathSegments = fullPath.split('/car-photos/');
                            return pathSegments[1] || null;
                        } catch (error) {
                            console.error('URL parse error:', url, error);
                            return null;
                        }
                    })
                    .filter(Boolean) as string[];

                if (filePaths.length > 0) {
                    const { error } = await supabase.storage
                        .from('car-photos')
                        .remove(filePaths);
                    if (error) {
                        console.error('Supabase storage remove error:', { filePaths, error });
                        throw new Error(`Photo deletion failed: ${error.message}`);
                    }
                }
            }

            const { error: deleteError } = await supabase
                .from('cars')
                .delete()
                .eq('id', id);

            if (deleteError) throw deleteError;

            setCars((prev) => prev.filter((c) => c.id !== id));
            alert('Car deleted successfully!');
        } catch (error: any) {
            console.error('Full error details:', error);
            alert(`Error: ${error.message}`);
        }
    };

    // Toggle Visibility
    const toggleVisibility = async (id: string, current: boolean) => {
        try {
            await supabase.from('cars').update({ is_hidden: !current }).eq('id', id);
            setCars((prev) =>
                prev.map((c) => (c.id === id ? { ...c, is_hidden: !current } : c))
            );
        } catch (error) {
            alert('Update failed!');
        }
    };

    // Update Listing Type
    const updateListingType = async (
        carId: string,
        newType: 'sale' | 'rental' | 'both'
    ) => {
        try {
            const { error } = await supabase
                .from('cars')
                .update({ listing_type: newType })
                .eq('id', carId);
            if (error) throw error;
            setCars((prev) =>
                prev.map((car) =>
                    car.id === carId ? { ...car, listing_type: newType } : car
                )
            );
            alert('Listing type updated successfully!');
        } catch (error) {
            console.error('Update error:', error);
            alert('Failed to update listing type!');
        }
    };

    // Eğer henüz doğrulanmamışsa, login formunu göster
    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <form
                    onSubmit={handleLogin}
                    className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md w-80 border border-gray-200 dark:border-gray-700"
                >
                    <h1 className="text-2xl font-bold mb-6 text-center text-gray-800 dark:text-gray-100">
                        Admin Login
                    </h1>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                        className="block w-full mb-4 p-3 rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white p-3 rounded-full hover:scale-105 transition-transform font-semibold"
                    >
                        Login
                    </button>
                </form>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white dark:bg-gray-900 p-4 transition-colors duration-300">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold mb-8 dark:text-white">Admin Dashboard</h1>

                {/* Add Car Form */}
                <form
                    onSubmit={handleAddCar}
                    className="bg-gray-50 dark:bg-gray-800 p-8 rounded-xl mb-8 shadow-lg border border-gray-200 dark:border-gray-700"
                >
                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Basic Info */}
                        <div className="space-y-4">
                            <h2 className="text-xl font-bold dark:text-white">Vehicle Information</h2>
                            <input
                                type="text"
                                placeholder="Brand*"
                                value={brand}
                                onChange={(e) => setBrand(e.target.value)}
                                className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                                required
                            />
                            <input
                                type="text"
                                placeholder="Model*"
                                value={model}
                                onChange={(e) => setModel(e.target.value)}
                                className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                                required
                            />
                            <input
                                type="text"
                                placeholder="Color*"
                                value={color}
                                onChange={(e) => setColor(e.target.value)}
                                className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                                required
                            />
                            <select
                                value={doors}
                                onChange={(e) => setDoors(Number(e.target.value))}
                                className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                                required
                            >
                                <option value={2}>2 Doors</option>
                                <option value={3}>3 Doors</option>
                                <option value={4}>4 Doors</option>
                                <option value={5}>5 Doors</option>
                            </select>
                            <select
                                value={listingType}
                                onChange={(e) => setListingType(e.target.value as any)}
                                className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                                required
                            >
                                <option value="sale">For Sale</option>
                                <option value="rental">For Rent</option>
                                <option value="both">Both</option>
                            </select>
                            <select
                                value={bodyType}
                                onChange={(e) => setBodyType(e.target.value)}
                                className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                                required
                            >
                                <option value="">Select Body Type</option>
                                {bodyTypeOptions.map((option) => (
                                    <option key={option} value={option}>
                                        {option}
                                    </option>
                                ))}
                            </select>
                            <input
                                type="date"
                                placeholder="Manufacture Date*"
                                value={manufactureDate}
                                onChange={(e) => setManufactureDate(e.target.value)}
                                className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                                required
                            />
                            <textarea
                                placeholder="Detailed Description*"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 h-32 focus:outline-none focus:ring-2 focus:ring-green-500"
                                required
                            />
                        </div>

                        {/* Specifications */}
                        <div className="space-y-4">
                            <h2 className="text-xl font-bold dark:text-white">Technical Details</h2>
                            <div className="grid grid-cols-2 gap-4">
                                {/* Artık üretim tarihi ayrı eleman olarak değil, formun üst kısmındaki input'tan alınıyor */}
                                <input
                                    type="number"
                                    placeholder="Price (€)*"
                                    value={price || ''}
                                    onChange={(e) => setPrice(Number(e.target.value))}
                                    className="p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                                    required
                                />
                                <input
                                    type="number"
                                    placeholder="Mileage (km)"
                                    value={mileage || ''}
                                    onChange={(e) => setMileage(Number(e.target.value))}
                                    className="p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                                />
                                <select
                                    value={transmission}
                                    onChange={(e) => setTransmission(e.target.value)}
                                    className="p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                                >
                                    <option>Automatic</option>
                                    <option>Manual</option>
                                </select>
                                <select
                                    value={fuelType}
                                    onChange={(e) => setFuelType(e.target.value)}
                                    className="p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                                >
                                    <option>Petrol</option>
                                    <option>Diesel</option>
                                    <option>Electric</option>
                                    <option>Hybrid</option>
                                </select>
                            </div>
                        </div>

                        {/* Features */}
                        <div className="space-y-4">
                            <h2 className="text-xl font-bold dark:text-white">Features</h2>
                            {Object.entries(featureOptions).map(([category, features]) => (
                                <div key={category} className="mb-4">
                                    <h3 className="font-semibold mb-2 capitalize text-gray-700 dark:text-gray-300">
                                        {category}
                                    </h3>
                                    <div className="grid grid-cols-2 gap-2">
                                        {features.map((feature) => (
                                            <label
                                                key={feature}
                                                className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 text-sm"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={selectedFeatures[`${category}-${feature}`] || false}
                                                    onChange={() => handleFeatureToggle(category, feature)}
                                                    className="rounded text-blue-600 dark:bg-gray-700"
                                                />
                                                <span>{feature}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Photos */}
                        <div className="space-y-4">
                            <h2 className="text-xl font-bold dark:text-white">Photos</h2>
                            <input
                                type="file"
                                multiple
                                onChange={handleFileSelect}
                                className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                                accept="image/*"
                            />
                            <button
                                type="button"
                                onClick={handleFileUpload}
                                disabled={uploading || !selectedFiles.length}
                                className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white p-3 rounded-full hover:scale-105 transition-all duration-300 disabled:opacity-50"
                            >
                                {uploading ? 'Uploading...' : `Upload ${selectedFiles.length} Photos`}
                            </button>
                            <div className="flex flex-wrap gap-2">
                                {uploadedUrls.map((url) => (
                                    <div key={url} className="relative">
                                        <img src={url} className="w-24 h-24 object-cover rounded border" alt="Uploaded" />
                                        <button
                                            type="button"
                                            onClick={() => handleDeletePhoto(url)}
                                            className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 text-xs"
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="mt-6 w-full bg-gradient-to-r from-green-500 to-blue-500 text-white py-3 rounded-full shadow-lg hover:scale-105 transition-all duration-300 font-semibold"
                    >
                        Add Vehicle
                    </button>
                </form>

                {isEditModalOpen && editingCar && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white dark:bg-gray-800 p-8 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                            <h2 className="text-2xl font-bold mb-6 dark:text-white">Aracı Düzenle</h2>
                            <form onSubmit={handleUpdateCar}>
                                <div className="grid md:grid-cols-2 gap-6">
                                    {/* Sol Sütun */}
                                    <div className="space-y-4">
                                        <input
                                            type="text"
                                            placeholder="Brand*"
                                            value={editingCar.brand}
                                            onChange={(e) => setEditingCar({ ...editingCar, brand: e.target.value })}
                                            className="w-full p-3 rounded-lg border focus:ring-2 focus:ring-green-500"
                                            required
                                        />
                                        <input
                                            type="text"
                                            placeholder="Model*"
                                            value={editingCar.model}
                                            onChange={(e) => setEditingCar({ ...editingCar, model: e.target.value })}
                                            className="w-full p-3 rounded-lg border focus:ring-2 focus:ring-green-500"
                                            required
                                        />
                                        <input
                                            type="date"
                                            value={editingCar.manufactureDate}
                                            onChange={(e) => setManufactureDate(e.target.value)}
                                            className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                                            required
                                        />
                                        <select
                                            value={editingCar.doors}
                                            onChange={(e) => setEditingCar({ ...editingCar, doors: Number(e.target.value) })}
                                            className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                                            required
                                        >
                                            <option value={2}>2 Doors</option>
                                            <option value={3}>3 Doors</option>
                                            <option value={4}>4 Doors</option>
                                            <option value={5}>5 Doors</option>
                                        </select>
                                        <select
                                            value={editingCar.body_type}
                                            onChange={(e) => setEditingCar({ ...editingCar, body_type: e.target.value })}
                                            className="w-full p-3 rounded-lg border focus:ring-2 focus:ring-green-500"
                                            required
                                        >
                                            {bodyTypeOptions.map(option => (
                                                <option key={option} value={option}>{option}</option>
                                            ))}
                                        </select>
                                        <textarea
                                            placeholder="Detailed Description*"
                                            value={editingCar.description}
                                            onChange={(e) => setEditingCar({ ...editingCar, description: e.target.value })}
                                            className="w-full p-3 rounded-lg border focus:ring-2 focus:ring-green-500 h-32"
                                        />
                                    </div>

                                    {/* Sağ Sütun */}
                                    <div className="space-y-4">
                                        <input
                                            type="number"
                                            placeholder="Price (€)*"
                                            value={editingCar.price || ''}
                                            onChange={(e) => setEditingCar({ ...editingCar, price: Number(e.target.value) })}
                                            className="w-full p-3 rounded-lg border focus:ring-2 focus:ring-green-500"
                                            required
                                        />
                                        <div className="grid grid-cols-2 gap-4">
                                            <input
                                                type="number"
                                                placeholder="Mileage (km)"
                                                value={editingCar.mileage || ''}
                                                onChange={(e) => setEditingCar({ ...editingCar, mileage: Number(e.target.value) })}
                                                className="p-3 rounded-lg border focus:ring-2 focus:ring-green-500"
                                            />
                                            <select
                                                value={editingCar.transmission}
                                                onChange={(e) => setEditingCar({ ...editingCar, transmission: e.target.value })}
                                                className="p-3 rounded-lg border focus:ring-2 focus:ring-green-500"
                                            >
                                                <option>Automatic</option>
                                                <option>Manual</option>
                                            </select>
                                            <select
                                                value={editingCar.fuel_type}
                                                onChange={(e) => setEditingCar({ ...editingCar, fuel_type: e.target.value })}
                                                className="p-3 rounded-lg border focus:ring-2 focus:ring-green-500"
                                            >
                                                <option>Petrol</option>
                                                <option>Diesel</option>
                                                <option>Electric</option>
                                                <option>Hybrid</option>
                                            </select>
                                            <input
                                                type="text"
                                                placeholder="Color*"
                                                value={editingCar.color}
                                                onChange={(e) => setEditingCar({ ...editingCar, color: e.target.value })}
                                                className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                                                required
                                            />
                                        </div>

                                        {/* Özellikler */}
                                        <div className="space-y-4">
                                            {Object.entries(featureOptions).map(([category, features]) => (
                                                <div key={category} className="mb-4">
                                                    <h3 className="font-semibold mb-2 capitalize">{category}</h3>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        {features.map(feature => (
                                                            <label key={feature} className="flex items-center space-x-2">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={editingCar.features?.[category]?.includes(feature) || false}
                                                                    onChange={() => handleEditFeatureToggle(category, feature)}
                                                                    className="rounded text-blue-600"
                                                                />
                                                                <span>{feature}</span>
                                                            </label>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-6 flex gap-4 justify-end">
                                    <button
                                        type="button"
                                        onClick={() => setIsEditModalOpen(false)}
                                        className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                                    >
                                        İptal
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                                    >
                                        Değişiklikleri Kaydet
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Car List */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-x-auto border border-gray-200 dark:border-gray-700">
                    <table className="min-w-full">
                        <thead className="bg-gray-100 dark:bg-gray-700">
                            <tr>
                                <th className="px-6 py-4 text-left dark:text-white">Brand</th>
                                <th className="px-6 py-4 text-left dark:text-white">Model</th>
                                <th className="px-6 py-4 text-left dark:text-white">Color</th>
                                <th className="px-6 py-4 text-left dark:text-white">Doors</th>
                                <th className="px-6 py-4 text-left dark:text-white">Body Type</th>
                                <th className="px-6 py-4 text-left dark:text-white">Price</th>
                                <th className="px-6 py-4 text-left dark:text-white">Listing Type</th>
                                <th className="px-6 py-4 text-left dark:text-white">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {cars.map((car) => (
                                <tr key={car.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                    <td className="px-6 py-4 dark:text-white">{car.brand}</td>
                                    <td className="px-6 py-4 dark:text-white">{car.model}</td>
                                    <td className="px-6 py-4 dark:text-white">{car.color}</td>
                                    <td className="px-6 py-4 dark:text-white">{car.doors}</td>
                                    <td className="px-6 py-4 dark:text-white">{car.body_type}</td>
                                    <td className="px-6 py-4 dark:text-white">€{car.price?.toLocaleString()}</td>
                                    <td className="px-6 py-4 dark:text-white">
                                        <select
                                            value={car.listing_type}
                                            onChange={(e) => updateListingType(car.id, e.target.value as any)}
                                            className="bg-gray-100 dark:bg-gray-700 p-2 rounded"
                                        >
                                            <option value="sale">For Sale</option>
                                            <option value="rental">For Rent</option>
                                            <option value="both">Both</option>
                                        </select>
                                    </td>
                                    <td className="px-6 py-4 space-x-2">
                                        <button
                                            onClick={() => {
                                                setEditingCar(car);
                                                setIsEditModalOpen(true);
                                            }}
                                            className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                                        >
                                            Düzenle
                                        </button>
                                        <button
                                            onClick={() => toggleVisibility(car.id, car.is_hidden)}
                                            className="px-3 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors"
                                        >
                                            {car.is_hidden ? 'Show' : 'Hide'}
                                        </button>
                                        <button
                                            onClick={() => handleDeleteCar(car.id)}
                                            className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}