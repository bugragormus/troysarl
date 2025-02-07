import Link from "next/link";
import { Heart, Trash } from "lucide-react";
import Image from "next/image";
import Car from "@/types/car";
import { format } from "date-fns";

type Props = {
  car: Car;
  onFavoriteToggle?: (carId: string) => void;
  onRemove?: (carId: string) => void;
  isFavorite?: boolean;
  className?: string;
};

export default function CarCard({
  car,
  onFavoriteToggle,
  onRemove,
  isFavorite,
  className = "",
}: Props) {
  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-2xl transition-shadow flex flex-col h-full ${className}`}
    >
      <div className="relative h-48 w-full overflow-hidden rounded-t-xl">
        <Image
          height={80}
          width={80}
          src={car.photos[0]}
          alt={`${car.brand} ${car.model}`}
          sizes="(max-width: 768px) 100vw, 50vw"
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
        />
        {/* Eğer onFavoriteToggle varsa, favori butonunu göster; yoksa onRemove varsa çöp butonunu göster */}
        {onFavoriteToggle ? (
          <button
            onClick={() => onFavoriteToggle(car.id)}
            className={`absolute top-3 right-3 p-2 rounded-full shadow-sm transition-colors duration-300 ${
              isFavorite
                ? "bg-red-500 text-white hover:bg-red-600"
                : "bg-gray-100 dark:bg-gray-700 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-600"
            }`}
          >
            <Heart
              size={20}
              fill={isFavorite ? "white" : "none"}
              strokeWidth={2}
            />
          </button>
        ) : onRemove ? (
          <button
            onClick={() => onRemove(car.id)}
            className="absolute top-3 right-3 p-2 rounded-full shadow-sm bg-red-500 text-white transition-colors duration-300 hover:bg-red-600"
          >
            <Trash size={20} strokeWidth={2} />
          </button>
        ) : null}
      </div>

      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-xl text-gray-800 dark:text-gray-100 truncate">
          <span className="font-bold">{car.brand}</span> {car.model}
        </h3>
        <p className="text-gray-600 dark:text-gray-300 mt-1">
          {format(new Date(car.year), "dd.MM.yyyy")} • {car.body_type}
        </p>

        <div className="flex justify-between items-center mt-4">
          <div>
            {car.listing_type === "rental" ? (
              <span className="px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded-full">
                Rental
              </span>
            ) : car.listing_type === "sale" ? (
              <span className="px-2 py-1 text-xs font-semibold bg-green-100 text-green-800 rounded-full">
                Sale
              </span>
            ) : car.listing_type === "both" ? (
              <span className="px-2 py-1 text-xs font-semibold bg-purple-100 text-purple-800 rounded-full">
                Sale/Rental
              </span>
            ) : (
              <span className="px-2 py-1 text-xs font-semibold bg-red-100 text-red-800 rounded-full">
                Sold
              </span>
            )}
          </div>
          <div className="min-h-[2.5rem] flex items-center">
            {car.listing_type !== "rental" && car.price ? (
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                €{car.price.toLocaleString()}
              </p>
            ) : (
              <div className="h-8"></div>
            )}
          </div>
        </div>

        <Link
          href={`/cars/${car.id}`}
          className="block mt-4 text-center bg-green-500 text-white py-2 rounded-full hover:bg-green-600 transition-colors"
        >
          View Details
        </Link>
      </div>
    </div>
  );
}
