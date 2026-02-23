import { useEffect, useState } from "react";
import Car from "@/types/car";
import toast, { Toaster } from "react-hot-toast";
import * as Sentry from "@sentry/react";
import TransactionManager from "@/components/admin/TransactionManager";
import CarFormModal from "@/components/admin/CarFormModal";
import CarList from "@/components/admin/CarList";
import { useCars } from "@/hooks/useCars";



export default function AdminPanel() {

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCar, setEditingCar] = useState<Car | null>(null);

  const [showDashboard, setShowDashboard] = useState(false);

  // Use Centralized Data Layer Hook
  const { 
    cars, 
    setCars, 
    fetchCars, 
    removeCar, 
    toggleVisibility, 
    updateListingType 
  } = useCars(true);

  // Migrasyon state
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationResult, setMigrationResult] = useState<{
    totalMigrated: number;
    carsProcessed: number;
  } | null>(null);

  // Fetch Cars on Mount
  useEffect(() => {
    fetchCars();
  }, [fetchCars]);


  // Handle Logout
  const handleLogout = async () => {
    await fetch("/api/admin-logout", { method: "POST" });
    window.location.href = "/admin-login";
  };


  // Custom handlers to pass to CarList
  const handleEditClick = (car: Car) => {
    setEditingCar(car);
    setIsFormOpen(true);
  };


  return (
    <div className="min-h-screen bg-white dark:dark:bg-gradient-to-b from-premium-light to-white p-4 transition-colors duration-300">
      <div className="mt-7 max-w-7xl mx-auto">
        {/* Logout butonu */}
        <div className="flex justify-end mb-4">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
        <button
          onClick={() => setShowDashboard(!showDashboard)}
          className="mb-4 bg-purple-500 text-white px-4 py-2 rounded"
        >
          {showDashboard
            ? "Dashboard'u Kapat"
            : "Satış/Kiralama Kayıtlarını Göster"}
        </button>

        {/* Cloudinary Migrasyon Butonu */}
        <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl">
          <p className="text-sm font-semibold text-amber-800 dark:text-amber-300 mb-1">
            📦 Supabase → Cloudinary Fotoğraf Migrasyonu
          </p>
          <p className="text-xs text-amber-600 dark:text-amber-400 mb-3">
            Eski Supabase fotoğraflarını Cloudinary&apos;e taşır.
          </p>
          <button
            onClick={async () => {
              if (!confirm("Tüm Supabase fotoğraflarını Cloudinary'e taşımak istiyor musunuz? Bu işlem birkaç dakika sürebilir.")) return;
              setIsMigrating(true);
              setMigrationResult(null);
              try {
                const res = await fetch("/api/migrate-photos", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({}),
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error);
                setMigrationResult({ totalMigrated: data.totalMigrated, carsProcessed: data.carsProcessed });
                toast.success(`Migrasyon tamamlandı! ${data.totalMigrated} fotoğraf taşındı.`);
              } catch (err) {
                toast.error(err instanceof Error ? err.message : "Migrasyon hatası!");
              } finally {
                setIsMigrating(false);
              }
            }}
            disabled={isMigrating}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
          >
            {isMigrating ? "⏳ Taşınıyor..." : "🚀 Migrasyonu Başlat"}
          </button>
          {migrationResult && (
            <p className="mt-2 text-xs text-green-700 dark:text-green-400 font-medium">
              ✅ {migrationResult.carsProcessed} araç işlendi, {migrationResult.totalMigrated} fotoğraf Cloudinary&apos;e taşındı.
            </p>
          )}
        </div>

        {showDashboard && <TransactionManager cars={cars} />}
      </div>
      <div className="mt-7 max-w-7xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-blue-500">
          Admin Dashboard
        </h1>

        <div className="mb-8">
          <CarFormModal
            inline={true}
            onSuccess={fetchCars}
          />
        </div>

        <CarFormModal
          isOpen={isFormOpen}
          onClose={() => {
            setIsFormOpen(false);
            setEditingCar(null);
          }}
          carToEdit={editingCar}
          onSuccess={fetchCars}
        />

        <CarList
          cars={cars}
          onEdit={handleEditClick}
          onDelete={removeCar}
          onToggleVisibility={toggleVisibility}
          onUpdateListingType={updateListingType}
        />
      </div>
      <Toaster position="top-right" reverseOrder={false} />
    </div>
  );
}
