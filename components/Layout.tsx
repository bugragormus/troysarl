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
                {/* Modern Header */}
                <header className="bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg">
                    <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between h-16">
                            {/* Logo */}
                            <div className="flex-shrink-0">
                                <Link href="/" className="flex items-center">
                                    <Image
                                        src="/troysarl_logos.png"
                                        alt="Troysarl Logo"
                                        width={80}
                                        height={80}
                                        className="rounded-full"
                                    />
                                </Link>
                            </div>

                            {/* Desktop Menü */}
                            <div className="hidden md:flex items-center space-x-8">
                                <Link
                                    href="/"
                                    className={`text-white hover:text-gray-300 transition-colors font-medium ${isActive('/') ? 'underline' : ''
                                        }`}
                                >
                                    Home
                                </Link>
                                <Link
                                    href="/cars"
                                    className={`text-white hover:text-gray-300 transition-colors font-medium ${isActive('/cars') ? 'underline' : ''
                                        }`}
                                >
                                    Cars
                                </Link>
                                <Link
                                    href="/admin"
                                    className={`text-white hover:text-gray-300 transition-colors font-medium ${isActive('/admin') ? 'underline' : ''
                                        }`}
                                >
                                    Admin
                                </Link>
                                <Link
                                    href="/contact"
                                    className={`text-white hover:text-gray-300 transition-colors font-medium ${isActive('/contact') ? 'underline' : ''
                                        }`}
                                >
                                    Contact
                                </Link>
                                <Link
                                    href="/about"
                                    className={`text-white hover:text-gray-300 transition-colors font-medium ${isActive('/about') ? 'underline' : ''
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
                                    {darkMode ? '🌙' : '🌞'}
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
                                    className={`block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-indigo-600 ${isActive('/') ? 'underline' : ''
                                        }`}
                                >
                                    Home
                                </Link>
                                <Link
                                    href="/cars"
                                    onClick={() => setIsMenuOpen(false)}
                                    className={`block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-indigo-600 ${isActive('/cars') ? 'underline' : ''
                                        }`}
                                >
                                    Cars
                                </Link>
                                <Link
                                    href="/admin"
                                    onClick={() => setIsMenuOpen(false)}
                                    className={`block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-indigo-600 ${isActive('/admin') ? 'underline' : ''
                                        }`}
                                >
                                    Admin
                                </Link>
                                <Link
                                    href="/contact"
                                    onClick={() => setIsMenuOpen(false)}
                                    className={`block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-indigo-600 ${isActive('/contact') ? 'underline' : ''
                                        }`}
                                >
                                    Contact
                                </Link>
                                <Link
                                    href="/about"
                                    onClick={() => setIsMenuOpen(false)}
                                    className={`block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-indigo-600 ${isActive('/about') ? 'underline' : ''
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
                <footer className="bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {/* Hakkımızda */}
                            <div>
                                <h3 className="text-xl font-semibold mb-4">Troy Cars LUX SARL</h3>
                                <p className="text-gray-400 text-sm">
                                    All rights reserved.
                                </p>
                            </div>

                            {/* Hızlı Linkler */}
                            <div>
                                <h3 className="text-xl font-semibold mb-4">Fast Links</h3>
                                <ul className="space-y-2 text-sm">
                                    <li>
                                        <Link href="/" className="text-gray-400 hover:text-white transition-colors">
                                            Home
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/cars" className="text-gray-400 hover:text-white transition-colors">
                                            Cars
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/contact" className="text-gray-400 hover:text-white transition-colors">
                                            Contact
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/about" className="text-gray-400 hover:text-white transition-colors">
                                            About Us
                                        </Link>
                                    </li>
                                </ul>
                            </div>

                            {/* İletişim */}
                            <div>
                                <h3 className="text-xl font-semibold mb-4">Get In Touch</h3>
                                <ul className="space-y-2 text-sm text-gray-400">
                                    <li>
                                        <span className="block font-medium">Address:</span> {process.env.NEXT_PUBLIC_ADRESS}
                                    </li>
                                    <li>
                                        <span className="block font-medium">Phone:</span> {process.env.NEXT_PUBLIC_PHONE_NUMBER}
                                    </li>
                                    <li>
                                        <span className="block font-medium">E-Mail:</span> {process.env.NEXT_PUBLIC_EMAIL}
                                    </li>
                                </ul>
                            </div>
                        </div>

                        {/* Alt Bilgi */}
                        <div className="border-t border-gray-700 mt-8 pt-8 text-center">
                            <p className="text-gray-400 text-sm">
                                &copy; {new Date().getFullYear()} Troy Cars LUX SARL. All rights reserved.
                            </p>
                        </div>
                    </div>
                </footer>

            </div>
        </div>
    );
}