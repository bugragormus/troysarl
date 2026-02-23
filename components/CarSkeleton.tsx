// components/CarSkeleton.tsx
// Loading skeleton — araç kartı yüklenirken gösterilir

export default function CarSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg flex flex-col h-full overflow-hidden animate-pulse">
      {/* Görsel alanı */}
      <div className="w-full h-52 bg-gray-200 dark:bg-gray-700" />

      {/* İçerik alanı */}
      <div className="p-4 flex flex-col gap-3 flex-1">
        {/* Başlık */}
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
        {/* Alt başlık */}
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />

        {/* Özellik satırları */}
        <div className="flex gap-2 mt-1">
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
        </div>

        {/* Fiyat */}
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-2/5 mt-auto" />
      </div>
    </div>
  );
}
