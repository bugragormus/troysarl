import Car from "@/types/car";
import toast from "react-hot-toast";
import * as Sentry from "@sentry/react";
import Image from "next/image";

type CarListProps = {
  cars: Car[];
  onEdit: (car: Car) => void;
  onDelete: (id: string, photos?: string[]) => Promise<void>;
  onToggleVisibility: (id: string, current: boolean) => Promise<void>;
  onUpdateListingType: (id: string, newType: Car["listing_type"]) => Promise<void>;
};

export default function CarList({
  cars,
  onEdit,
  onDelete,
  onToggleVisibility,
  onUpdateListingType,
}: CarListProps) {
  // Delete Car
  const handleDeleteCar = async (car: Car) => {
    if (!confirm("Delete this car and all photos?")) return;
    try {
      await onDelete(car.id, car.photos);
      toast.success("Araç başarıyla silindi!");
    } catch (error: any) {
      toast.error(`Silme hatası: ${error.message}`);
      Sentry.captureException(error);
    }
  };

  // Toggle Visibility
  const handleToggleVisibility = async (car: Car) => {
    try {
      await onToggleVisibility(car.id, !!car.is_hidden);
    } catch (error) {
      toast.error("Güncelleme başarısız!");
      Sentry.captureException(error);
    }
  };

  // Update Listing Type
  const handleUpdateListingType = async (
    carId: string,
    newType: "sale" | "rental" | "reserved" | "sold"
  ) => {
    try {
      await onUpdateListingType(carId, newType);
      toast.success("İlan türü güncellendi!");
    } catch (error) {
      toast.error("İlan türü güncellenemedi!");
      Sentry.captureException(error);
    }
  };

  return (
    <div className="bg-white/40 dark:bg-gray-800/40 p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 backdrop-blur-sm transition-colors duration-300">
      <h2 className="text-xl md:text-2xl font-bold mb-6 text-gray-900 dark:text-white pb-3 border-b border-gray-100 dark:border-gray-700 flex items-center gap-2">
        <span className="w-2 h-8 bg-indigo-600 rounded-full"></span>
        Mevcut Araçlar ({cars.length})
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {cars.map((car) => (
          <div
            key={car.id}
            className={`border border-gray-100 dark:border-gray-700 rounded-2xl overflow-hidden bg-white dark:bg-gray-900/60 shadow-sm hover:shadow-xl transition-all duration-300 relative group/card font-sans ${
              car.is_hidden ? "opacity-60 grayscale-[50%]" : ""
            }`}
          >
            {/* Araç Durum Rozeti */}
            <div className="absolute top-2 left-2 z-10 space-y-1">
              {car.is_hidden && (
                <span className="bg-gray-800/80 text-white text-xs px-2 py-1 rounded backdrop-blur-sm block w-max">
                  <span className="mr-1">👁️‍🗨️</span> Gizli
                </span>
              )}
              {car.is_exclusive && (
                <span className="bg-yellow-500/90 text-yellow-950 text-xs px-2 py-1 rounded backdrop-blur-sm font-bold block w-max shadow-sm">
                  ⭐ Exclusive
                </span>
              )}
              <span className="bg-indigo-500/90 text-indigo-50 text-xs px-2 py-1 rounded backdrop-blur-sm font-bold block w-max shadow-sm">
                 Sıra: {car.display_index ?? 999}
              </span>
            </div>

            <div className="absolute top-2 right-2 z-10">
              <span className={`px-2 py-1 rounded text-xs font-bold shadow-sm backdrop-blur-sm ${
                car.listing_type === "sale"
                  ? "bg-blue-500/90 text-white"
                  : car.listing_type === "rental"
                  ? "bg-purple-500/90 text-white"
                  : car.listing_type === "reserved"
                  ? "bg-orange-500/90 text-white"
                  : "bg-green-500/90 text-white"
              }`}>
                {car.listing_type?.toUpperCase()}
              </span>
            </div>

            <div className="relative h-48 w-full bg-gray-100 dark:bg-gray-800">
              {car.photos?.[0] ? (
                <Image
                  src={car.photos[0]}
                  alt={`${car.brand} ${car.model}`}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-500">
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
            </div>

            <div className="p-5">
              <h3 className="font-bold text-lg mb-1 text-gray-900 dark:text-white line-clamp-1 group-hover/card:text-blue-600 dark:group-hover/card:text-blue-400 transition-colors">
                {car.brand} {car.model}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                {car.year} • {car.body_type} • {car.fuel_type}
              </p>

              <div className="space-y-2 mb-4">
                <select
                  value={car.listing_type || "sale"}
                  onChange={(e) =>
                    handleUpdateListingType(
                      car.id,
                      e.target.value as "sale" | "rental" | "reserved" | "sold"
                    )
                  }
                  className="w-full p-2.5 text-sm border border-gray-200 rounded-xl dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                >
                  <option value="sale">Set to Sale</option>
                  <option value="rental">Set to Rental</option>
                  <option value="reserved">Set to Reserved</option>
                  <option value="sold">Set to Sold</option>
                </select>
              </div>

              <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                <button
                  onClick={() => handleToggleVisibility(car)}
                  className={`py-2 px-1 rounded text-xs font-semibold flex flex-col items-center justify-center gap-1 transition-colors ${
                    car.is_hidden
                      ? "bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700/50 dark:text-gray-300 dark:hover:bg-gray-700"
                  }`}
                  title={car.is_hidden ? "Site de Göster" : "Site den Gizle"}
                >
                  {car.is_hidden ? "👁️ Göster" : "👁️‍🗨️ Gizle"}
                </button>
                <button
                  onClick={() => onEdit(car)}
                  className="py-2 px-1 bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50 rounded text-xs font-semibold flex flex-col items-center justify-center gap-1 transition-colors"
                >
                  ✏️ Düzenle
                </button>
                <button
                  onClick={() => handleDeleteCar(car)}
                  className="py-2 px-1 bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50 rounded text-xs font-semibold flex flex-col items-center justify-center gap-1 transition-colors"
                >
                  🗑️ Sil
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
