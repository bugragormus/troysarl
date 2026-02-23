import Link from "next/link";
import Head from "next/head";

export default function Custom500() {
  return (
    <>
      <Head>
        <title>500 - Server Error | Troy Cars Lux SARL</title>
        <meta name="robots" content="noindex, follow" />
      </Head>
      <div className="min-h-screen flex items-center justify-center px-4 bg-white dark:bg-gradient-to-b from-premium-light to-premium-dark transition-colors duration-300">
        <div className="text-center max-w-md mx-auto">
          <div className="relative mb-8">
            <h1 className="text-9xl font-extrabold text-red-600/20 dark:text-red-500/10 select-none">
              500
            </h1>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-white">
                Error
              </span>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
            Something went wrong
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            We're experiencing some technical difficulties on our end. Please try
            refreshing the page or come back later.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
            >
              Reload Page
            </button>
            <Link
              href="/cars"
              className="px-8 py-3 bg-white dark:bg-gray-800 text-gray-800 dark:text-white border border-gray-200 dark:border-gray-700 rounded-full font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300"
            >
              Back to Catalog
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
