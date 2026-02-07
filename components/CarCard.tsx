import Link from "next/link";
import {
  Heart,
  Trash,
  Fuel,
  CalendarDays,
  Gauge,
  BadgeInfo,
  Share,
  Cog,
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
  onShare,
}: {
  carId: string;
  isFavorite?: boolean;
  onFavoriteToggle?: (carId: string) => void;
  onRemove?: (carId: string) => void;
  onShare?: () => void; // Add share button action handler
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

      {onShare && ( // Share Button
        <button
          onClick={onShare}
          className="p-2 rounded-full shadow-lg backdrop-blur-md bg-black/30 hover:bg-black/40 text-white transition-all duration-300"
          aria-label="Share car"
        >
          <Share size={20} className="drop-shadow-md" />
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
  // Share function
  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: `${car.brand} ${car.model}`,
          text: `Check out this car: ${car.brand} ${car.model}`,
          url: `${window.location.origin}/cars/${car.id}`,
        })
        .then(() => console.log("Successfully shared!"))
        .catch((error) => console.log("Error sharing:", error));
    } else {
      // Fallback for browsers that don't support `navigator.share`
      alert("Share functionality is not supported on this device.");
    }
  };

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

        {/* Exclusive Badge (Top Priority) */}
        {car.is_exclusive && (
          <div className="absolute top-3 left-3 z-10">
            <span className="px-3 py-1.5 text-xs font-bold rounded-full flex items-center shadow-lg bg-gradient-to-r from-yellow-400 to-yellow-600 text-gray-900 animate-pulse">
              💎 EXCLUSIVE
            </span>
          </div>
        )}

        {/* Status Badge */}
        <div className={clsx(
          "absolute left-3 z-10",
          car.is_exclusive ? "top-14" : "top-3"
        )}>
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
          onShare={handleShare} // Passing the share handler to the button
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
            <Cog className="w-5 h-5 text-gray-400 flex-shrink-0" />
            <span className="capitalize">{car.transmission}</span>
          </div>
        </div>

        {/* Price & CTA */}
        <div className="mt-auto border-t pt-5 flex justify-between items-center">
          {car.is_exclusive ? (
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                💎 Exclusive Vehicle
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500">
                Price available upon request
              </p>
            </div>
          ) : (
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
          )}

          {/* Conditional Rendering of Button */}
          {car.listing_type !== "sold" && (
            <Link
              href={`/cars/${car.id}`}
              className="px-4 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-colors duration-300 bg-gray-900 hover:bg-gray-800 text-white dark:bg-gray-100 dark:hover:bg-gray-200 dark:text-gray-900"
            >
              View Details
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
