import { useState, useEffect } from "react";
import Script from "next/script";

declare global {
  interface Window {
    dataLayer: any[];
  }
}

export default function CookieConsentBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [preferences, setPreferences] = useState({
    essential: true,
    marketing: false,
    analytics: false,
  });

  // LocalStorage'dan çerez tercihlerini yükle
  useEffect(() => {
    const consent = localStorage.getItem("cookieConsent");
    if (!consent) {
      setIsVisible(true); // Eğer çerez tercihi yoksa banner'ı göster
    } else {
      // Daha önce izin verilmişse tercihleri yükle
      const savedPrefs = JSON.parse(consent);
      setPreferences(savedPrefs);
      if (savedPrefs.analytics) loadGoogleAnalytics();
    }
  }, []);

  // Google Analytics'i yükle
  const loadGoogleAnalytics = () => {
    window.dataLayer = window.dataLayer || [];
    function gtag(...args: any[]) {
      window.dataLayer.push(args);
    }
    gtag("js", new Date());

    // GDPR uyumlu ayarlar
    gtag("consent", "default", {
      ad_storage: preferences.marketing ? "granted" : "denied",
      analytics_storage: preferences.analytics ? "granted" : "denied",
    });

    // IP anonimleştirme
    gtag("config", process.env.NEXT_PUBLIC_GA_ID, {
      anonymize_ip: true,
    });
  };

  // Tüm çerezleri kabul et
  const acceptAll = () => {
    localStorage.setItem("cookieConsent", JSON.stringify(preferences));
    setIsVisible(false);
    if (preferences.analytics) loadGoogleAnalytics();
  };

  // Tüm çerezleri reddet (sadece zorunlu çerezler kalır)
  const rejectAll = () => {
    localStorage.setItem(
      "cookieConsent",
      JSON.stringify({ essential: true, marketing: false, analytics: false })
    );
    setIsVisible(false);
  };

  return (
    <>
      {/* Google Analytics Script (Koşullu) */}
      {preferences.analytics && (
        <Script
          strategy="afterInteractive"
          src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
        />
      )}

      {/* Çerez Banner'ı */}
      <div
        className={`fixed bottom-4 left-4 right-4 max-w-7xl mx-auto bg-white dark:bg-gray-900 shadow-xl p-6 rounded-xl border border-gray-200 dark:border-gray-700 transition-all duration-300 ${
          isVisible
            ? "translate-y-0 opacity-100"
            : "translate-y-10 opacity-0 pointer-events-none"
        }`}
      >
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          🍪 Cookie Preferences
        </h2>
        <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">
          We use cookies to improve your experience. You can accept all or
          customize your preferences.
        </p>

        {/* Çerez Tercihleri */}
        <div className="mt-4 space-y-2">
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked
              disabled
              className="w-5 h-5 text-green-600"
            />
            <span className="text-gray-800 dark:text-gray-300 font-medium">
              Essential Cookies (Required)
            </span>
          </label>

          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={preferences.marketing}
              onChange={() =>
                setPreferences({
                  ...preferences,
                  marketing: !preferences.marketing,
                })
              }
              className="w-5 h-5 text-blue-600 cursor-pointer"
            />
            <span className="text-gray-800 dark:text-gray-300">
              Marketing Cookies
            </span>
          </label>

          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={preferences.analytics}
              onChange={() =>
                setPreferences({
                  ...preferences,
                  analytics: !preferences.analytics,
                })
              }
              className="w-5 h-5 text-purple-600 cursor-pointer"
            />
            <span className="text-gray-800 dark:text-gray-300">
              Analytics Cookies
            </span>
          </label>
        </div>

        {/* Butonlar */}
        <div className="mt-6 flex items-center justify-between">
          <button
            onClick={rejectAll}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            Reject All
          </button>
          <button
            onClick={acceptAll}
            className="px-5 py-2 bg-green-500 text-white text-sm font-semibold rounded-lg shadow-md hover:bg-green-600 transition"
          >
            Accept All
          </button>
        </div>
      </div>
    </>
  );
}
