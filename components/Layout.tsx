import { ReactNode, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import CookieConsentBanner from "./CookieConsentBanner";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [showWelcomeBubble, setShowWelcomeBubble] = useState(false);

  // LocalStorage'dan tema durumunu oku
  useEffect(() => {
    const savedDarkMode = localStorage.getItem("darkMode") === "true";
    setDarkMode(savedDarkMode);

    const visitedBefore = localStorage.getItem("visitedBefore");
    if (!visitedBefore) {
      localStorage.setItem("visitedBefore", "true");
      setShowWelcomeBubble(true);
      setTimeout(() => setShowWelcomeBubble(false), 4000); // 10 saniye sonra kapanır
    }
  }, []);

  const whatsappMessage = `Bonjour! ${
    router.query.source === "website"
      ? "Je vous contacte via votre site web."
      : ""
  } Je souhaite obtenir des informations sur les véhicules.`;
  const encodedMessage = encodeURIComponent(whatsappMessage);

  // Tema durumunu güncelle ve kaydet
  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem("darkMode", newMode.toString());
  };

  // Aktif link kontrolü
  const isActive = (pathname: string) => router.pathname === pathname;

  // Mobil menü toggle
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <div className={`min-h-screen flex flex-col ${darkMode ? "dark" : ""}`}>
      <div className="dark:bg-gray-900 dark:text-gray-100">
        {/* Modern Header */}
        <header className="bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg">
          <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Logo */}
              <div className="flex-shrink-0">
                <span className="ml-3 text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-700 bg-clip-text text-transparent">
                  <Link href="/cars">Troy Cars</Link>
                </span>
              </div>

              {/* Desktop Menü */}
              <div className="hidden md:flex items-center space-x-8">
                {/*
                <Link
                  href="/"
                  className={`text-white hover:text-gray-300 transition-colors font-medium ${
                    isActive("/") ? "underline" : ""
                  }`}
                >
                  Home
                </Link>  */}
                <Link
                  href="/cars"
                  className={`text-white hover:text-gray-300 transition-colors font-medium ${
                    isActive("/cars") ? "underline" : ""
                  }`}
                >
                  Cars
                </Link>
                <Link
                  href="/appointments"
                  className={`text-white hover:text-gray-300 transition-colors font-medium ${
                    isActive("/appointments") ? "underline" : ""
                  }`}
                >
                  Appointment
                </Link>
                <Link
                  href="/about"
                  className={`text-white hover:text-gray-300 transition-colors font-medium ${
                    isActive("/about") ? "underline" : ""
                  }`}
                >
                  About Us
                </Link>
                <Link
                  href="/favorites"
                  className={`text-white hover:text-gray-300 transition-colors font-medium ${
                    isActive("/favorites") ? "underline" : ""
                  }`}
                >
                  Favorites
                </Link>
              </div>

              {/* Sağ Taraf: Tema Toggle ve Mobil Menü Butonu */}
              <div className="flex items-center">
                {/* Dark Mode Toggle */}
                <button
                  onClick={toggleDarkMode}
                  className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors mr-4"
                  aria-label="Toggle Dark Mode"
                >
                  {darkMode ? "🌙" : "🌞"}
                </button>

                {/* Mobil Menü Butonu */}
                <div className="md:hidden">
                  <button
                    onClick={toggleMenu}
                    className="p-2 rounded-md focus:outline-none bg-white/20 hover:bg-white/30 transition-colors"
                    aria-label="Toggle Menu"
                  >
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      {isMenuOpen ? (
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      ) : (
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 6h16M4 12h16M4 18h16"
                        />
                      )}
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </nav>

          {/* Mobil Menü (Açılır Menü) */}
          {isMenuOpen && (
            <div className="md:hidden bg-indigo-700">
              <div className="px-2 pt-2 pb-3 space-y-1">
                {/*
                <Link
                  href="/"
                  onClick={() => setIsMenuOpen(false)}
                  className={`block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-indigo-600 ${
                    isActive("/") ? "underline" : ""
                  }`}
                >
                  Home
                </Link> */}
                <Link
                  href="/cars"
                  onClick={() => setIsMenuOpen(false)}
                  className={`block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-indigo-600 ${
                    isActive("/cars") ? "underline" : ""
                  }`}
                >
                  Cars
                </Link>
                <Link
                  href="/contact"
                  onClick={() => setIsMenuOpen(false)}
                  className={`block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-indigo-600 ${
                    isActive("/contact") ? "underline" : ""
                  }`}
                >
                  Appointment
                </Link>
                <Link
                  href="/about"
                  onClick={() => setIsMenuOpen(false)}
                  className={`block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-indigo-600 ${
                    isActive("/about") ? "underline" : ""
                  }`}
                >
                  About Us
                </Link>
                <Link
                  href="/favorites"
                  onClick={() => setIsMenuOpen(false)}
                  className={`block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-indigo-600 ${
                    isActive("/favorites") ? "underline" : ""
                  }`}
                >
                  Favorites
                </Link>
              </div>
            </div>
          )}
        </header>

        {/* Ana İçerik */}
        <main className="flex-grow">{children}</main>

        {/* Footer */}
        <footer className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-10">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {/* Marka & Hakkında */}
              <div>
                <h3 className="text-2xl font-bold mb-4">Troy Cars Lux SARL</h3>
                <p className="text-sm text-gray-200">
                  Premium vehicle experience with an exclusive collection of
                  luxury and used cars.
                </p>
              </div>

              {/* Hızlı Linkler */}
              <div>
                <h4 className="text-lg font-semibold mb-3">Quick Links</h4>
                <ul className="space-y-2 text-sm">
                  <li>
                    {/* 
                    <Link href="/" className="hover:underline">
                      Home
                    </Link> */}
                  </li>
                  <li>
                    <Link href="/cars" className="hover:underline">
                      Cars
                    </Link>
                  </li>
                  <li>
                    <Link href="/about" className="hover:underline">
                      About Us
                    </Link>
                  </li>
                  <li>
                    <Link href="/contact" className="hover:underline">
                      Contact
                    </Link>
                  </li>
                  <li>
                    <Link href="/careers" className="hover:underline">
                      Careers
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Cookie & Privacy Policy */}
              <div>
                <h4 className="text-lg font-semibold mb-3">Legal & Privacy</h4>
                <ul className="space-y-2 text-sm">
                  <li>
                    <Link href="/privacy-policy" className="hover:underline">
                      Privacy Policy
                    </Link>
                  </li>
                  <li>
                    <Link href="/settings" className="hover:underline">
                      Cookie Settings
                    </Link>
                  </li>
                </ul>
              </div>

              {/* İletişim Bilgileri */}
              <div>
                <h4 className="text-lg font-semibold mb-3">Appointment</h4>
                <ul className="space-y-2 text-sm">
                  <li>Address: {process.env.NEXT_PUBLIC_ADRESS}</li>
                  <li>Email: {process.env.NEXT_PUBLIC_EMAIL}</li>
                </ul>
                {/* Sosyal Medya İkonları (Opsiyonel) 
                <div className="flex space-x-4 mt-4">
                  <a
                    href="#"
                    className="hover:text-gray-300"
                    aria-label="Facebook"
                  >
                    <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                      <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.99 3.66 9.12 8.44 9.88v-6.99H7.9v-2.89h2.54V9.41c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.23.2 2.23.2v2.46h-1.25c-1.23 0-1.61.76-1.61 1.54v1.85h2.74l-.44 2.89h-2.3v6.99C18.34 21.12 22 16.99 22 12z" />
                    </svg>
                  </a>
                  <a
                    href="#"
                    className="hover:text-gray-300"
                    aria-label="Twitter"
                  >
                    <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                      <path d="M22.46 6c-.77.35-1.6.59-2.46.69a4.26 4.26 0 001.88-2.35 8.48 8.48 0 01-2.7 1.03 4.24 4.24 0 00-7.24 3.87 12.04 12.04 0 01-8.74-4.43 4.23 4.23 0 001.31 5.65 4.18 4.18 0 01-1.92-.53v.05a4.25 4.25 0 003.4 4.16 4.3 4.3 0 01-1.91.07 4.25 4.25 0 003.96 2.95A8.5 8.5 0 012 18.57a12 12 0 006.29 1.84c7.55 0 11.68-6.26 11.68-11.68 0-.18-.01-.35-.02-.53A8.36 8.36 0 0022.46 6z" />
                    </svg>
                  </a>
                  <a
                    href="#"
                    className="hover:text-gray-300"
                    aria-label="Instagram"
                  >
                    <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                      <path d="M7.75 2h8.5A5.75 5.75 0 0122 7.75v8.5A5.75 5.75 0 0116.25 22h-8.5A5.75 5.75 0 012 16.25v-8.5A5.75 5.75 0 017.75 2zm0 1.5A4.25 4.25 0 003.5 7.75v8.5A4.25 4.25 0 007.75 20.5h8.5a4.25 4.25 0 004.25-4.25v-8.5A4.25 4.25 0 0016.25 3.5h-8.5zM12 7a5 5 0 110 10 5 5 0 010-10zm0 1.5a3.5 3.5 0 100 7 3.5 3.5 0 000-7zm4.75-.75a1.25 1.25 0 110 2.5 1.25 1.25 0 010-2.5z" />
                    </svg>
                  </a>
                </div> */}
              </div>
            </div>

            {/* Alt Bilgi */}
            <div className="mt-8 border-t border-indigo-500 pt-4 text-center text-xs text-gray-200">
              &copy; {new Date().getFullYear()} Troy Cars Lux SARL. All Rights
              Reserved.
            </div>
          </div>
        </footer>
        {/* WhatsApp Widget with Welcome Bubble */}
        <div className="fixed bottom-6 right-6 z-40">
          <div className="relative">
            {/* Welcome Bubble */}
            {showWelcomeBubble && (
              <div className="absolute -top-20 -right-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-xl animate-fadeInUp w-64 z-60">
                <div className="text-sm text-gray-600 dark:text-gray-200">
                  🚗 Bienvenue ! Comment pouvons-nous vous aider ?
                </div>
                <div className="absolute bottom-0 right-6 w-4 h-4 bg-white dark:bg-gray-800 transform rotate-45 translate-y-2"></div>
              </div>
            )}
            {/* WhatsApp Butonu */}
            <a
              href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}?text=${encodedMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className={`bg-[#25D366] hover:bg-[#128C7E] text-white p-4 rounded-full shadow-lg transition-all duration-300 flex items-center justify-center ${
                showWelcomeBubble ? "w-20 h-20 animate-pulse" : "w-16 h-16"
              }`}
              aria-label="WhatsApp ile iletişim"
              onMouseEnter={() => setShowWelcomeBubble(true)}
              onMouseLeave={() => setShowWelcomeBubble(false)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-8 h-8"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
            </a>
          </div>
        </div>
        {/* Çerez Bildirimi */}
        <CookieConsentBanner />
      </div>
    </div>
  );
}
