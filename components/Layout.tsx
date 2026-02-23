import { ReactNode, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import CookieConsentBanner from "./CookieConsentBanner";
import { useAuth } from "../hooks/useAuth";
import { User as UserIcon, LogIn } from "lucide-react";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [showWelcomeBubble, setShowWelcomeBubble] = useState(false);
  const { user, profile } = useAuth();

  // LocalStorage'dan tema durumunu oku
  useEffect(() => {
    const savedDarkMode = localStorage.getItem("darkMode") === "true";
    setDarkMode(savedDarkMode);

    const visitedBefore = localStorage.getItem("visitedBefore");
    if (!visitedBefore) {
      localStorage.setItem("visitedBefore", "true");
      setShowWelcomeBubble(true);
      setTimeout(() => setShowWelcomeBubble(false), 4000); // 4 saniye sonra kapanır
    }
  }, []);

  const whatsappMessage = `Hello! ${
    router.query.source === "website"
      ? "I am contacting you via your website."
      : ""
  } I would like to get information about the cars.`;
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
      <div className="dark:bg-[#0a0a0a] dark:text-gray-100 flex-grow flex flex-col">
        {/* Modern Header */}
        <header className="sticky top-0 z-[100] w-full border-b border-white/10 bg-white/70 dark:bg-black/40 backdrop-blur-md transition-all duration-300">
          <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-20">
              {/* Logo */}
              <div className="flex-shrink-0">
                <Link href="/cars" className="group flex items-center transition-transform active:scale-95">
                  <span className="text-2xl sm:text-3xl font-[900] tracking-tighter text-gray-900 dark:text-white uppercase">
                    Troy<span className="text-blue-600 dark:text-blue-500">Cars</span>
                  </span>
                </Link>
              </div>
              {/* Desktop Nav */}
              <div className="hidden md:flex items-center justify-center flex-1 space-x-1" role="navigation" aria-label="Main Navigation">
                {[
                  { name: 'Cars', href: '/cars' },
                  { name: 'Appointment', href: '/appointments' },
                  { name: 'About Us', href: '/about' },
                  { name: 'Favorites', href: '/favorites' },
                  { name: 'Contact', href: '/contact' },
                ].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 relative group
                      ${isActive(item.href) 
                        ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-600/10" 
                        : "text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-white/5"
                      }`}
                  >
                    {item.name}
                    {isActive(item.href) && (
                      <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-blue-600 dark:bg-blue-400 rounded-full"></span>
                    )}
                  </Link>
                ))}

                {/* Auth Menu - Desktop */}
                <div className="pl-4 border-l border-gray-200 dark:border-white/10 ml-4 flex items-center">
                  {user ? (
                    <Link
                      href="/profile"
                      className="flex items-center space-x-2 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 px-4 py-2 rounded-xl transition-all border border-transparent hover:border-blue-500/30 group"
                    >
                      <UserIcon className="w-4 h-4 text-gray-700 dark:text-gray-300 group-hover:text-blue-600 transition-colors" />
                      <span className="text-gray-700 dark:text-gray-200 text-sm font-bold truncate max-w-[100px]">
                        {profile?.full_name?.split(' ')[0] || 'Account'}
                      </span>
                    </Link>
                  ) : (
                    <Link
                      href="/auth"
                      className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl transition-all shadow-lg shadow-blue-500/20 active:scale-95 group"
                    >
                      <LogIn className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                      <span className="text-sm font-bold">Login/Register</span>
                    </Link>
                  )}
                </div>
              </div>
              {/* Sağ Taraf: Tema Toggle ve Mobil Menü Butonu */}
              <div className="flex items-center justify-end flex-shrink-0 ml-auto">
                {/* Dark Mode Toggle */}
                <button
                  onClick={toggleDarkMode}
                  className="p-2.5 rounded-xl bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10 transition-all shadow-sm border border-transparent hover:border-blue-500/30 mr-2 sm:mr-4"
                  aria-label="Toggle Dark Mode"
                >
                  {darkMode ? "🌙" : "🌞"}
                </button>
                {/* Mobil Menü Butonu */}
                <div className="md:hidden">
                  <button
                    onClick={toggleMenu}
                    className="p-2.5 rounded-xl focus:outline-none bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10 transition-all border border-transparent hover:border-blue-500/30"
                    aria-label="Toggle Menu"
                  >
                    <svg
                      className="w-6 h-6"
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
            <div className="md:hidden bg-white/95 dark:bg-[#0a0a0a]/95 backdrop-blur-xl border-t border-gray-100 dark:border-white/5 animate-in slide-in-from-top-2 duration-300 origin-top overflow-hidden" id="mobile-menu" role="navigation" aria-label="Mobile Navigation">
              <div className="px-4 pt-4 pb-8 space-y-1.5 focus:outline-none">
                {[
                  { name: 'Cars', href: '/cars' },
                  { name: 'About Us', href: '/about' },
                  { name: 'Favorites', href: '/favorites' },
                  { name: 'Contact', href: '/contact' },
                ].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={`block px-4 py-3 rounded-2xl text-base font-bold transition-all
                      ${isActive(item.href)
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                        : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5"
                      }`}
                  >
                    {item.name}
                  </Link>
                ))}

                {/* Auth Menu - Mobile */}
                <div className="pt-6 mt-6 border-t border-gray-100 dark:border-white/5">
                  {user ? (
                    <Link
                      href="/profile"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center space-x-3 px-5 py-4 rounded-2xl bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white border border-transparent shadow-sm"
                    >
                      <UserIcon className="w-5 h-5 text-blue-600" />
                      <span className="font-black">{profile?.full_name || 'My Account'}</span>
                    </Link>
                  ) : (
                    <Link
                      href="/auth"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center justify-center space-x-2 w-full py-4 rounded-2xl bg-blue-600 text-white font-black shadow-xl shadow-blue-500/20 active:scale-95 transition-all"
                    >
                      <LogIn className="w-5 h-5" />
                      <span>Login / Register</span>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          )}
        </header>

        {/* Ana İçerik */}
        <main className="flex-grow">{children}</main>

        {/* Premium Footer */}
        <footer className="relative border-t border-gray-100 dark:border-white/5 bg-white/40 dark:bg-black/20 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-6 py-20">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 lg:gap-24">
              {/* Brand & About */}
              <div className="col-span-1 md:col-span-1">
                <Link href="/cars" className="inline-block mb-6">
                  <span className="text-2xl font-[900] tracking-tighter text-gray-900 dark:text-white uppercase">
                    Troy<span className="text-blue-600 dark:text-blue-500">Cars</span>
                  </span>
                </Link>
                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed max-w-xs">
                  Redefining the premium vehicle experience with an exclusive collection of luxury automobiles. Excellence in every detail.
                </p>
              </div>

              {/* Quick Links */}
              <div>
                <h4 className="text-sm font-black uppercase tracking-widest text-gray-900 dark:text-white mb-6">Navigation</h4>
                <ul className="space-y-4">
                  {[
                    { label: 'Inventory', href: '/cars' },
                    { label: 'About Us', href: '/about' },
                    { label: 'Contact', href: '/contact' },
                    { label: 'Careers', href: '/careers' }
                  ].map((link) => (
                    <li key={link.href}>
                      <Link href={link.href} className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 text-sm transition-colors duration-200 flex items-center group">
                        <span className="w-0 group-hover:w-2 h-[2px] bg-blue-600 mr-0 group-hover:mr-2 transition-all duration-300"></span>
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Legal & Privacy */}
              <div>
                <h4 className="text-sm font-black uppercase tracking-widest text-gray-900 dark:text-white mb-6">Legal</h4>
                <ul className="space-y-4">
                  <li>
                    <Link href="/privacy-policy" className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 text-sm transition-colors duration-200">
                      Privacy Policy
                    </Link>
                  </li>
                  <li>
                    <Link href="/settings" className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 text-sm transition-colors duration-200">
                      Cookie Settings
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Contact Info */}
              <div>
                <h4 className="text-sm font-black uppercase tracking-widest text-gray-900 dark:text-white mb-6">Inquiries</h4>
                <div className="space-y-4">
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-400 uppercase tracking-tighter mb-1">Email</span>
                    <a href={`mailto:${process.env.NEXT_PUBLIC_EMAIL}`} className="text-gray-900 dark:text-white text-sm font-semibold hover:text-blue-600 transition-colors">
                      {process.env.NEXT_PUBLIC_EMAIL}
                    </a>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-400 uppercase tracking-tighter mb-1">Location</span>
                    <span className="text-gray-900 dark:text-white text-sm font-semibold">
                      {process.env.NEXT_PUBLIC_ADRESS}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Copyright */}
            <div className="mt-20 pt-8 border-t border-gray-100 dark:border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-bold text-gray-400 uppercase tracking-widest">
              <div>&copy; {new Date().getFullYear()} Troy Cars Lux SARL.</div>
              <div className="flex items-center gap-6">
                <span>Switzerland</span>
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                <span>Exclusive Collection</span>
              </div>
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
                  🚗 Welcome! How can we assist you?
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
