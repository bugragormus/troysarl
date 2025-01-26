import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

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

export default function AdminPanel() {
    const [password, setPassword] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [darkMode, setDarkMode] = useState(false);

    // Araba Listesi ve Form State
    const [cars, setCars] = useState<Car[]>([]);
    const [brand, setBrand] = useState('');
    const [model, setModel] = useState('');
    const [year, setYear] = useState<number>();
    const [price, setPrice] = useState<number>();
    const [fuelType, setFuelType] = useState('Benzin');
    const [contactPhone, setContactPhone] = useState('');

    // Fotoğraf Yükleme State
    const [uploading, setUploading] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);

    // Arabaları Çek
    useEffect(() => {
        const fetchCars = async () => {
            const { data, error } = await supabase.from('cars').select('*');
            if (error) console.error('Hata:', error);
            else setCars(data || []);
        };
        if (isAuthenticated) fetchCars();
    }, [isAuthenticated]);

    // Admin Giriş
    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
            setIsAuthenticated(true);
        } else {
            alert('Yanlış şifre!');
        }
    };

    // Dosya Seçimi
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;
        const files = Array.from(e.target.files);
        setSelectedFiles(files);
    };

    // Dosya Yükle
    const handleFileUpload = async () => {
        if (!selectedFiles.length) return;

        setUploading(true);
        const urls: string[] = [];

        try {
            for (const file of selectedFiles) {
                const fileName = `${Date.now()}_${file.name}`;
                const { data, error } = await supabase.storage
                    .from('car-photos')
                    .upload(fileName, file);

                if (error) throw error;

                const publicUrl = supabase.storage
                    .from('car-photos')
                    .getPublicUrl(data.path);
                urls.push(publicUrl.data.publicUrl);
            }
            setUploadedUrls(prev => [...prev, ...urls]);
        } catch (error: any) {
            alert('Yükleme hatası: ' + error.message);
        } finally {
            setUploading(false);
            setSelectedFiles([]);
        }
    };

    // Fotoğraf Sil
    const handleDeletePhoto = async (url: string) => {
        if (!confirm('Bu fotoğrafı silmek istediğinize emin misiniz?')) return;

        const fileName = url.split('/').pop();
        const { error } = await supabase.storage
            .from('car-photos')
            .remove([fileName || '']);

        if (error) {
            alert('Fotoğraf silinemedi: ' + error.message);
        } else {
            setUploadedUrls(prev => prev.filter(u => u !== url));
            alert('Fotoğraf başarıyla silindi!');
        }
    };

    // Araba Ekle
    const handleAddCar = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validasyon
        if (!brand || !model || !year || !price || !contactPhone || uploadedUrls.length === 0) {
            alert('Lütfen tüm alanları doldurun ve en az bir fotoğraf yükleyin!');
            return;
        }

        // Araba Ekleme
        const { data, error } = await supabase
            .from('cars')
            .insert([{
                brand,
                model,
                year: Number(year),
                price: Number(price),
                fuel_type: fuelType,
                photos: uploadedUrls,
                contact_phone: contactPhone
            }])
            .select();

        if (error) {
            alert('Hata: ' + error.message);
            return;
        }

        // Başarılıysa
        if (data?.[0]) {
            alert('Araba başarıyla eklendi!');
            setCars(prev => [...prev, data[0]]);
            // Formu Temizle
            setBrand('');
            setModel('');
            setYear(undefined);
            setPrice(undefined);
            setFuelType('Benzin');
            setContactPhone('');
            setUploadedUrls([]);
        }
    };

    // Araba Sil
    const handleDeleteCar = async (id: string) => {
        if (!confirm('Bu arabayı silmek istediğinize emin misiniz?')) return;

        const { error } = await supabase.from('cars').delete().eq('id', id);
        if (error) {
            alert('Hata: ' + error.message);
        } else {
            setCars(prev => prev.filter(car => car.id !== id));
            alert('Araba başarıyla silindi!');
        }
    };

    // Giriş Sayfası
    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
                <form onSubmit={handleLogin} className="bg-white p-6 rounded-lg shadow-md w-80">
                    <h1 className="text-2xl font-bold mb-4 dark:text-black text-center">Admin Girişi</h1>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Şifre"
                        className="block w-full mb-4 p-2 border rounded"
                    />
                    <button
                        type="submit"
                        className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
                    >
                        Giriş Yap
                    </button>
                </form>
            </div>
        );
    }

    // Admin Paneli
    return (
        <div className="container mx-auto p-4 dark:bg-gray-900">
            <h1 className="text-3xl font-bold mb-6 dark:text-white">Admin Paneli</h1>

            {/* Araba Ekleme Formu */}
            <form onSubmit={handleAddCar} className="space-y-4 mb-8 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <input
                    type="text"
                    placeholder="Marka"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="block w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    required
                />
                <input
                    type="text"
                    placeholder="Model"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="block w-full p-2 border rounded"
                    required
                />
                <input
                    type="number"
                    placeholder="Yıl"
                    value={year || ''}
                    onChange={(e) => setYear(Number(e.target.value))}
                    className="block w-full p-2 border rounded"
                    required
                />
                <input
                    type="number"
                    placeholder="Fiyat (€)"
                    value={price || ''}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="block w-full p-2 border rounded"
                    required
                />
                <select
                    value={fuelType}
                    onChange={(e) => setFuelType(e.target.value)}
                    className="block w-full p-2 border rounded"
                    required
                >
                    <option value="Benzin">Benzin</option>
                    <option value="Dizel">Dizel</option>
                    <option value="Elektrik">Elektrik</option>
                    <option value="Hybrid">Hybrid</option>
                </select>
                <input
                    type="tel"
                    placeholder="Telefon Numarası"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="block w-full p-2 border rounded"
                    required
                />

                {/* Fotoğraf Yükleme */}
                <div className="space-y-4">
                    <input
                        type="file"
                        multiple
                        onChange={handleFileSelect}
                        className="block w-full p-2 border rounded"
                        accept="image/*"
                    />
                    <button
                        type="button"
                        onClick={handleFileUpload}
                        disabled={uploading || !selectedFiles.length}
                        className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 disabled:opacity-50"
                    >
                        {uploading ? 'Yükleniyor...' : 'Fotoğrafları Yükle'}
                    </button>

                    {/* Yüklenen Fotoğraflar */}
                    {uploadedUrls.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {uploadedUrls.map((url) => (
                                <div key={url} className="relative">
                                    <img
                                        src={url}
                                        alt="Yüklenen Fotoğraf"
                                        className="w-24 h-24 object-cover rounded border"
                                    />
                                    <button
                                        type="button" // Bu satır kritik!
                                        onClick={() => handleDeletePhoto(url)}
                                        className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 text-xs"
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <button
                    type="submit"
                    className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                >
                    Araba Ekle
                </button>
            </form>

            {/* Araba Listesi */}
            <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow-md">
                <table className="min-w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="py-3 px-4 text-left border-b dark:border-gray-600 dark:text-white">Marka</th>
                            <th className="py-3 px-4 text-left border-b dark:border-gray-600 dark:text-white">Model</th>
                            <th className="py-3 px-4 text-left border-b dark:border-gray-600 dark:text-white">İşlem</th>
                        </tr>
                    </thead>
                    <tbody>
                        {cars.map((car) => (
                            <tr key={car.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                <td className="py-3 px-4 border-b dark:border-gray-600 dark:text-white">{car.brand}</td>
                                <td className="py-3 px-4 border-b dark:border-gray-600 dark:text-white">{car.model}</td>
                                <td className="py-3 px-4 border-b dark:border-gray-600 dark:text-white">
                                    <button
                                        onClick={() => handleDeleteCar(car.id)}
                                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                                    >
                                        Sil
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}