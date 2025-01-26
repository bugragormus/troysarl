import { ReactNode, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Image from 'next/image';

interface LayoutProps {
    children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
    const router = useRouter();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [darkMode, setDarkMode] = useState(false);

    // LocalStorage'dan tema durumunu oku
    useEffect(() => {
        const savedDarkMode = localStorage.getItem('darkMode') === 'true';
        setDarkMode(savedDarkMode);
    }, []);

    // Tema durumunu güncelle ve kaydet
    const toggleDarkMode = () => {
        const newMode = !darkMode;
        setDarkMode(newMode);
        localStorage.setItem('darkMode', newMode.toString());
    };

    // Aktif link kontrolü
    const isActive = (pathname: string) => router.pathname === pathname;

    // Mobil menü toggle
    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    return (
        <div className={`min-h-screen flex flex-col ${darkMode ? 'dark' : ''}`}>
            <div className="dark:bg-gray-900 dark:text-gray-100">
                {/* Header */}
                <header className="bg-gray-800 dark:bg-gray-800 shadow-sm">
                    <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between h-16 items-center">
                            {/* Logo */}
                            <div className="flex-shrink-0 flex items-center">
                                <Link href="/" className="flex items-center space-x-2">
                                    <Image
                                        src="/troysarllogo.png"
                                        alt="Troysarl Logo"
                                        width={150}
                                        height={150}
                                        className="rounded"
                                    />
                                </Link>
                            </div>

                            {/* Desktop Navigasyon */}
                            <div className="hidden md:flex items-center space-x-8">
                                <Link
                                    href="/"
                                    className={`${isActive('/') ? 'text-blue-600 dark:text-blue-400 font-semibold' : 'text-gray-600 dark:text-gray-300'} px-1 py-2 text-sm hover:text-blue-500 dark:hover:text-blue-400 transition-colors`}
                                >
                                    Ana Sayfa
                                </Link>
                                <Link
                                    href="/admin"
                                    className={`${isActive('/admin') ? 'text-blue-600 dark:text-blue-400 font-semibold' : 'text-gray-600 dark:text-gray-300'} px-1 py-2 text-sm hover:text-blue-500 dark:hover:text-blue-400 transition-colors`}
                                >
                                    Admin
                                </Link>
                                <Link
                                    href="/contact"
                                    className={`${isActive('/contact') ? 'text-blue-600 dark:text-blue-400 font-semibold' : 'text-gray-600 dark:text-gray-300'} px-1 py-2 text-sm hover:text-blue-500 dark:hover:text-blue-400 transition-colors`}
                                >
                                    İletişim
                                </Link>
                                <Link
                                    href="/about"
                                    className={`${isActive('/about') ? 'text-blue-600 dark:text-blue-400 font-semibold' : 'text-gray-600 dark:text-gray-300'} px-1 py-2 text-sm hover:text-blue-500 dark:hover:text-blue-400 transition-colors`}
                                >
                                    Hakkımızda
                                </Link>

                                {/* Dark Mode Toggle */}
                                <button
                                    onClick={() => setDarkMode(!darkMode)}
                                    className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200"
                                >
                                    {darkMode ? '🌙' : '🌞'}
                                </button>
                            </div>

                            {/* Mobil Menü Butonu */}
                            <div className="md:hidden flex items-center">
                                <button
                                    onClick={toggleMenu}
                                    className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white focus:outline-none"
                                >
                                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        {isMenuOpen ? (
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        ) : (
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                        )}
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </nav>

                    {/* Mobil Menü */}
                    {isMenuOpen && (
                        <div className="md:hidden bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 transition-all duration-300 ease-in-out transform">
                            <div className="px-2 pt-2 pb-3 space-y-1">
                                <Link
                                    href="/"
                                    className={`${isActive('/') ? 'bg-blue-50 dark:bg-gray-700 text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'} block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-100 dark:hover:bg-gray-700`}
                                >
                                    Ana Sayfa
                                </Link>
                                <Link
                                    href="/admin"
                                    className={`${isActive('/admin') ? 'bg-blue-50 dark:bg-gray-700 text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'} block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-100 dark:hover:bg-gray-700`}
                                >
                                    Admin
                                </Link>
                                <Link
                                    href="/contact"
                                    className={`${isActive('/contact') ? 'bg-blue-50 dark:bg-gray-700 text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'} block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-100 dark:hover:bg-gray-700`}
                                >
                                    İletişim
                                </Link>

                                {/* Dark Mode Toggle (Mobil) */}
                                <button
                                    onClick={() => setDarkMode(!darkMode)}
                                    className="w-full text-left px-3 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                >
                                    Tema: {darkMode ? 'Koyu' : 'Açık'}
                                </button>
                            </div>
                        </div>
                    )}
                </header>

                {/* Ana İçerik */}
                <main className="flex-grow">{children}</main>

                {/* Footer */}
                <footer className="bg-gray-800 dark:bg-gray-900 text-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {/* Hakkımızda */}
                            <div>
                                <h3 className="text-lg font-semibold mb-4">Troysarl</h3>
                                <p className="text-gray-400 text-sm">
                                    Lüks ve ikinci el araçlarda en kaliteli hizmet.
                                </p>
                            </div>

                            {/* Hızlı Linkler */}
                            <div>
                                <h3 className="text-lg font-semibold mb-4">Hızlı Linkler</h3>
                                <ul className="space-y-2 text-sm">
                                    <li><Link href="/" className="text-gray-400 hover:text-white">Ana Sayfa</Link></li>
                                    <li><Link href="/cars" className="text-gray-400 hover:text-white">Arabalar</Link></li>
                                    <li><Link href="/contact" className="text-gray-400 hover:text-white">İletişim</Link></li>
                                    <li><Link href="/about" className="text-gray-400 hover:text-white">Hakkımızda</Link></li>
                                </ul>
                            </div>

                            {/* İletişim */}
                            <div>
                                <h3 className="text-lg font-semibold mb-4">İletişim</h3>
                                <ul className="space-y-2 text-sm text-gray-400">
                                    <li>Adres: {process.env.NEXT_PUBLIC_ADRESS}</li>
                                    <li>Tel: {process.env.NEXT_PUBLIC_PHONE_NUMBER}</li>
                                    <li>E-posta: {process.env.NEXT_PUBLIC_EMAIL}</li>
                                </ul>
                            </div>
                        </div>

                        {/* Alt Bilgi */}
                        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm text-gray-400">
                            <p>&copy; {new Date().getFullYear()} Troysarl. Tüm hakları saklıdır.</p>
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    );
}