import { useEffect, useState } from "react";
import Link from "next/link";
import Head from "next/head";
import toast, { Toaster } from "react-hot-toast";
import Script from "next/script";

export default function SettingsPage() {
  const [preferences, setPreferences] = useState({
    essential: true,
    marketing: false,
    analytics: false,
  });

  // Çerez tercihlerini API üzerinden al
  useEffect(() => {
    const fetchPreferences = async () => {
      const res = await fetch("/api/get-cookie-consent");
      const data = await res.json();

      // Eğer tercih yoksa, default olarak ayarla
      if (data.consent) {
        setPreferences(data.consent);
      }
    };

    fetchPreferences();
  }, []);

  // Tercihleri kaydet
  const savePreferences = async () => {
    const res = await fetch("/api/cookie-consent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(preferences),
    });

    if (res.ok) {
      toast.success("Preferences saved successfully");
      window.location.reload(); // Sayfayı yenileyerek değişiklikleri uygula
    } else {
      toast.error("Failed to save preferences");
    }
  };

  return (
    <div className="bg-white dark:bg-gradient-to-b from-premium-light to-white transition-colors duration-300">
      <Toaster position="top-right" reverseOrder={false} />
      <div className="container mx-auto p-6 max-w-4xl">
        <Head>
          <title>Cookie Settings - Troysarl</title>
        </Head>

        {/* Google Analytics Scriptleri */}
        <Script
          strategy="afterInteractive"
          src="https://www.googletagmanager.com/gtag/js?id=G-099SZW867E"
        />
        <Script id="gtag-init" strategy="afterInteractive">
          {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-099SZW867E');
        `}
        </Script>

        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-blue-500 mb-6">
          Cookie Preferences
        </h1>

        <div className="bg-gray-50 dark:bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={preferences.essential}
                disabled
                className="w-5 h-5 text-green-600"
              />
              <span className="ml-3">Essential Cookies (Zorunlu)</span>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                checked={preferences.marketing}
                onChange={(e) =>
                  setPreferences({
                    ...preferences,
                    marketing: e.target.checked,
                  })
                }
                className="w-5 h-5 text-blue-600"
              />
              <span className="ml-3">Marketing Cookies</span>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                checked={preferences.analytics}
                onChange={(e) =>
                  setPreferences({
                    ...preferences,
                    analytics: e.target.checked,
                  })
                }
                className="w-5 h-5 text-purple-600"
              />
              <span className="ml-3">Analytics Cookies</span>
            </div>

            <button
              onClick={savePreferences}
              className="mt-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Save Preferences
            </button>
          </div>
        </div>

        <div className="mt-6 text-sm text-gray-600 dark:text-gray-300">
          <Link
            href="/privacy-policy"
            className="text-blue-500 hover:underline"
          >
            Privacy Policy
          </Link>
        </div>
      </div>
    </div>
  );
}
