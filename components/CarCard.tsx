import Link from "next/link";
import {
  Heart,
  Trash,
  Fuel,
  CalendarDays,
  Gauge,
  BadgeInfo,
} from "lucide-react";
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

const statusStyles = {
  rental: "bg-blue-600/60 text-white dark:bg-blue-500/60",
  sale: "bg-emerald-600/60 text-white dark:bg-emerald-500/60",
  sold: "bg-rose-600/60 text-white dark:bg-rose-500/60",
  reserved: "bg-purple-600/60 text-white dark:bg-purple-500/60",
};

const statusIcons = {
  rental: <BadgeInfo size={14} className="mr-1" />,
  sale: <BadgeInfo size={14} className="mr-1" />,
  sold: <BadgeInfo size={14} className="mr-1" />,
  reserved: <BadgeInfo size={14} className="mr-1" />,
};

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
  return (
    <div className="absolute top-3 right-3 flex gap-2">
      {onFavoriteToggle && (
        <button
          onClick={() => onFavoriteToggle(carId)}
          className={clsx(
            "p-2 rounded-full shadow-lg transition-all duration-300",
            "backdrop-blur-md bg-black/30 group-hover:scale-105 hover:bg-gray-200 dark:hover:bg-gray-600",
            isFavorite ? "text-rose-500" : "text-white"
          )}
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          <Heart
            size={20}
            fill={isFavorite ? "currentColor" : "none"}
            className="drop-shadow-md"
          />
        </button>
      )}

      {onRemove && (
        <button
          onClick={() => onRemove(carId)}
          className="p-2 rounded-full shadow-lg backdrop-blur-md bg-black/30 hover:bg-black/40 text-white transition-all duration-300"
          aria-label="Remove car"
        >
          <Trash size={20} className="drop-shadow-md" />
        </button>
      )}
    </div>
  );
}

export default function CarCard({
  car,
  onFavoriteToggle,
  onRemove,
  isFavorite,
  className = "",
}: Props) {
  return (
    <article
      className={clsx(
        "group bg-white dark:bg-gray-900 rounded-xl border",
        "border-gray-100 dark:border-gray-800 overflow-hidden",
        "shadow-sm hover:shadow-xl transition-shadow",
        "flex flex-col h-full",
        className
      )}
    >
      {/* Image Section */}
      <div className="relative h-56 w-full overflow-hidden">
        <Image
          src={car.photos[0]}
          alt={`${car.brand} ${car.model}`}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          priority
        />

        {/* Status Badge - Daha belirgin ve okunaklı */}
        <div className="absolute top-3 left-3">
          <span
            className={clsx(
              "px-3 py-1.5 text-xs font-semibold rounded-full flex items-center",
              "shadow-md backdrop-blur-sm bg-opacity-90",
              statusStyles[car.listing_type]
            )}
          >
            {statusIcons[car.listing_type]}
            {car.listing_type.toUpperCase()}
          </span>
        </div>

        <ActionButton
          carId={car.id}
          isFavorite={isFavorite}
          onFavoriteToggle={onFavoriteToggle}
          onRemove={onRemove}
        />
      </div>

      {/* Content Section */}
      <div className="p-5 flex flex-col flex-1">
        {/* Title & Version */}
        <div className="mb-4">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 truncate">
            {car.brand} {car.model}
          </h3>
        </div>

        {/* Specifications Grid */}
        <div className="grid grid-cols-2 gap-4 text-sm mb-6">
          <div className="flex items-center gap-3">
            <CalendarDays className="w-5 h-5 text-gray-400 flex-shrink-0" />
            <span>{format(new Date(car.year), "MMM yyyy")}</span>
          </div>

          <div className="flex items-center gap-3">
            <Gauge className="w-5 h-5 text-gray-400 flex-shrink-0" />
            <span>{car.mileage?.toLocaleString()} km</span>
          </div>

          <div className="flex items-center gap-3">
            <Fuel className="w-5 h-5 text-gray-400 flex-shrink-0" />
            <span className="capitalize">{car.fuel_type}</span>
          </div>

          <div className="flex items-center gap-3">
            <svg
              className="w-5 h-5 text-gray-400 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
              />
            </svg>
            <span className="capitalize">{car.transmission}</span>
          </div>
        </div>

        {/* Price & CTA */}
        <div className="mt-auto border-t pt-5 flex justify-between items-center">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
              {car.listing_type === "rental" ? "Daily rate" : "Asking price"}
            </p>
            <p
              className={clsx(
                "text-2xl font-bold",
                car.listing_type === "sold"
                  ? "text-gray-400 dark:text-gray-600 line-through"
                  : "text-gray-900 dark:text-gray-100"
              )}
            >
              €{car.price?.toLocaleString()}
            </p>
          </div>

          <Link
            href={`/cars/${car.id}`}
            className={clsx(
              "px-4 py-2.5 rounded-lg font-medium flex items-center gap-2",
              "transition-colors duration-300",
              "bg-gray-900 hover:bg-gray-800 text-white",
              "dark:bg-gray-100 dark:hover:bg-gray-200 dark:text-gray-900"
            )}
          >
            View Details
          </Link>
        </div>
      </div>
    </article>
  );
}
