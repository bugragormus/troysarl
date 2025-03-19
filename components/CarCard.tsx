import Link from "next/link";
import { Heart, Trash } from "lucide-react";
import Image from "next/image";
import Car from "@/types/car";
import { format } from "date-fns";
import clsx from "clsx";

type Props = {
  car: Car;
  onFavoriteToggle?: (carId: string) => void;
  onRemove?: (carId: string) => void;
  isFavorite?: boolean;
  className?: string;
};

// Etiketleri daha sade yönetmek için bir nesne
const listingStyles = {
  rental: "bg-blue-100 text-blue-800",
  sale: "bg-green-100 text-green-800",
  sold: "bg-red-100 text-red-800",
  reserved: "bg-purple-100 text-purple-800",
};

// Favori veya Çöp butonunu yöneten ayrı bir bileşen
function ActionButton({
  carId,
  isFavorite,
  onFavoriteToggle,
  onRemove,
}: {
  carId: string;
  isFavorite?: boolean;
  onFavoriteToggle?: (carId: string) => void;
  onRemove?: (carId: string) => void;
}) {
  if (onFavoriteToggle) {
    return (
      <button
        onClick={() => onFavoriteToggle(carId)}
        className={clsx(
          "absolute top-3 right-3 p-2 rounded-full shadow-sm transition-colors duration-300",
          isFavorite
            ? "bg-red-500 text-white hover:bg-red-600"
            : "bg-gray-100 dark:bg-gray-700 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-600"
        )}
      >
        <Heart size={20} fill={isFavorite ? "white" : "none"} strokeWidth={2} />
      </button>
    );
  }

  if (onRemove) {
    return (
      <button
        onClick={() => onRemove(carId)}
        className="absolute top-3 right-3 p-2 rounded-full shadow-sm bg-red-500 text-white transition-colors duration-300 hover:bg-red-600"
      >
        <Trash size={20} strokeWidth={2} />
      </button>
    );
  }

  return null;
}

export default function CarCard({
  car,
  onFavoriteToggle,
  onRemove,
  isFavorite,
  className = "",
}: Props) {
  return (
    <div
      className={clsx(
        "bg-white dark:bg-gray-800 rounded-xl border shadow-lg hover:shadow-2xl transition-shadow flex flex-col h-full",
        "border-gray-200 dark:border-gray-700",
        className
      )}
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
        <ActionButton
          carId={car.id}
          isFavorite={isFavorite}
          onFavoriteToggle={onFavoriteToggle}
          onRemove={onRemove}
        />
      </div>

      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-xl text-gray-800 dark:text-gray-100 truncate">
          <span className="font-bold">{car.brand}</span> {car.model}
        </h3>
        <p className="text-gray-600 dark:text-gray-300 mt-1">
          <time
            dateTime={new Date(car.year).toISOString()}
            itemProp="releaseDate"
            className="mr-1"
          >
            {format(new Date(car.year), "yyyy")}
          </time>
          •{" "}
          <span itemProp="transmission" className="mr-1">
            {car.transmission}
          </span>
          •{" "}
          <span itemProp="fuel_type" className="mr-1">
            {car.fuel_type}
          </span>
          •{" "}
          <span itemProp="milage" className="mr-1">
            {car.mileage?.toLocaleString()} km
          </span>
        </p>

        <div className="flex justify-between items-center mt-4">
          {car.listing_type && (
            <span
              className={clsx(
                "px-2 py-1 text-[14px] font-semibold rounded-full",
                listingStyles[car.listing_type]
              )}
            >
              {car.listing_type.charAt(0).toUpperCase() +
                car.listing_type.slice(1)}
            </span>
          )}
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
          className="mt-4 text-center bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          View Details
        </Link>
      </div>
    </div>
  );
}
