import { useState } from 'react';
import Head from 'next/head';

export default function Contact() {
    const [darkMode, setDarkMode] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const response = await fetch(`https://formspree.io/f/${process.env.NEXT_PUBLIC_FORMSPREE_FORM_ID}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            alert('Mesajınız başarıyla gönderildi!');
            setFormData({ name: '', email: '', message: '' });
        } else {
            alert('Bir hata oluştu. Lütfen tekrar deneyin.');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
            <Head>
                <title>İletişim - Troysarl</title>
            </Head>

            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">İletişim</h1>
                </div>

                <div className="grid md:grid-cols-2 gap-12">
                    {/* İletişim Bilgileri */}
                    <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg">
                        <h2 className="text-2xl font-bold mb-6 dark:text-white">İletişim Bilgilerimiz</h2>

                        <div className="space-y-4">
                            <div>
                                <h3 className="text-lg font-semibold">Adres</h3>
                                <p className="text-gray-600">{process.env.NEXT_PUBLIC_ADRESS}</p>
                            </div>

                            <div>
                                <h3 className="text-lg font-semibold">Telefon</h3>
                                <p className="text-gray-600">{process.env.NEXT_PUBLIC_PHONE_NUMBER}</p>
                            </div>

                            <div>
                                <h3 className="text-lg font-semibold">E-posta</h3>
                                <p className="text-gray-600">{process.env.NEXT_PUBLIC_EMAIL}</p>
                            </div>
                        </div>

                        {/* Google Maps (API Key Gerekmez) */}
                        <div className="mt-8 h-64 rounded-lg overflow-hidden">
                            <iframe
                                width="100%"
                                height="100%"
                                frameBorder="0"
                                style={{ border: 0 }}
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2589.4155842268747!2d6.124349!3d49.533308!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4795491431775f71%3A0xcfdff054d6367aa5!2sTroy%20Cars%20Lux%20Sarl!5e0!3m2!1str!2str!4v1737918898496!5m2!1str!2str"
                                allowFullScreen
                            ></iframe>
                        </div>
                    </div>

                    {/* İletişim Formu */}
                    <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium">
                                    Adınız
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="email" className="block text-sm font-medium">
                                    E-posta Adresiniz
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="message" className="block text-sm font-medium">
                                    Mesajınız
                                </label>
                                <textarea
                                    id="message"
                                    rows={4}
                                    value={formData.message}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    required
                                ></textarea>
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                            >
                                Gönder
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}