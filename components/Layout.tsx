import { ReactNode, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import Image from "next/image";
import CookieConsentBanner from "./CookieConsentBanner";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // LocalStorage'dan tema durumunu oku
  useEffect(() => {
    const savedDarkMode = localStorage.getItem("darkMode") === "true";
    setDarkMode(savedDarkMode);
  }, []);

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
                  Troy Cars
                </span>
              </div>

              {/* Desktop Menü */}
              <div className="hidden md:flex items-center space-x-8">
                <Link
                  href="/"
                  className={`text-white hover:text-gray-300 transition-colors font-medium ${
                    isActive("/") ? "underline" : ""
                  }`}
                >
                  Home
                </Link>
                <Link
                  href="/cars"
                  className={`text-white hover:text-gray-300 transition-colors font-medium ${
                    isActive("/cars") ? "underline" : ""
                  }`}
                >
                  Cars
                </Link>
                <Link
                  href="/admin"
                  className={`text-white hover:text-gray-300 transition-colors font-medium ${
                    isActive("/admin") ? "underline" : ""
                  }`}
                >
                  Admin
                </Link>
                <Link
                  href="/contact"
                  className={`text-white hover:text-gray-300 transition-colors font-medium ${
                    isActive("/contact") ? "underline" : ""
                  }`}
                >
                  Contact
                </Link>
                <Link
                  href="/about"
                  className={`text-white hover:text-gray-300 transition-colors font-medium ${
                    isActive("/about") ? "underline" : ""
                  }`}
                >
                  About Us
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
                <Link
                  href="/"
                  onClick={() => setIsMenuOpen(false)}
                  className={`block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-indigo-600 ${
                    isActive("/") ? "underline" : ""
                  }`}
                >
                  Home
                </Link>
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
                  href="/admin"
                  onClick={() => setIsMenuOpen(false)}
                  className={`block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-indigo-600 ${
                    isActive("/admin") ? "underline" : ""
                  }`}
                >
                  Admin
                </Link>
                <Link
                  href="/contact"
                  onClick={() => setIsMenuOpen(false)}
                  className={`block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-indigo-600 ${
                    isActive("/contact") ? "underline" : ""
                  }`}
                >
                  Contact
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
              </div>
            </div>
          )}
        </header>

        {/* Ana İçerik */}
        <main className="flex-grow">{children}</main>

        {/* Footer */}
        <footer className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-10">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Marka & Hakkında */}
              <div>
                <h3 className="text-2xl font-bold mb-4">Troy Cars Lux SARL</h3>
                <p className="text-sm text-gray-200">
                  Premium vehicle experience with an exclusive collection of
                  luxury and second-hand vehicles.
                </p>
              </div>

              {/* Hızlı Linkler */}
              <div>
                <h4 className="text-lg font-semibold mb-3">Quick Links</h4>
                <ul className="space-y-2 text-sm">
                  <li>
                    <Link href="/" className="hover:underline">
                      Home
                    </Link>
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
                  <li>
                    <Link href="/privacy-policy" className="hover:underline">
                      Privacy Policy
                    </Link>
                  </li>
                </ul>
              </div>

              {/* İletişim Bilgileri */}
              <div>
                <h4 className="text-lg font-semibold mb-3">Contact</h4>
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
        {/* Çerez Bildirimi */}
        <CookieConsentBanner />
      </div>
    </div>
  );
}
