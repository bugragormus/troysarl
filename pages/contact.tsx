// pages/contact.tsx
import { useState } from 'react';
import Head from 'next/head';

export default function Contact() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        message: '',
    });
    const [consents, setConsents] = useState({
        financing: false,
        privacy: false,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!consents.privacy) {
            alert('You must accept the privacy policy');
            return;
        }

        const response = await fetch(
            `https://formspree.io/f/${process.env.NEXT_PUBLIC_FORMSPREE_FORM_ID}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            }
        );

        if (response.ok) {
            alert('Mesajınız başarıyla gönderildi!');
            setFormData({ name: '', email: '', phone: '', message: '' });
        } else {
            alert('Bir hata oluştu. Lütfen tekrar deneyin.');
        }
    };

    return (
        <div className="min-h-screen bg-white dark:bg-gradient-to-b from-premium-light to-white transition-colors duration-300">
            <Head>
                <title>Contact Us - Troysarl</title>
                <meta name="description" content="Get in touch with us" />
            </Head>

            <div className="max-w-4xl mx-auto py-16 px-4">
                {/* Başlık Bölümü */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-blue-500">
                        Get in Touch
                    </h1>
                    <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
                        We are here to help you. Reach out to us and we will get back to you as soon as possible.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-12">
                    {/* İletişim Bilgileri Kartı */}
                    <div className="bg-gray-50 dark:bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">
                            Contact Information
                        </h2>

                        <div className="space-y-4">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                                    Address
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400">
                                    {process.env.NEXT_PUBLIC_ADRESS}
                                </p>
                            </div>

                            <div>
                                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                                    E-Mail
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400">
                                    {process.env.NEXT_PUBLIC_EMAIL}
                                </p>
                            </div>
                        </div>

                        {/* Google Maps Embed */}
                        <div className="mt-8 h-64 rounded-lg overflow-hidden shadow-md">
                            <iframe
                                width="100%"
                                height="100%"
                                frameBorder="0"
                                style={{ border: 0 }}
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2589.4155842268747!2d6.124349!3d49.533308!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4795491431775f71%3A0xcfdff054d6367aa5!2sTroy%20Cars%20Lux%20Sarl!5e0!3m2!1str!2str!4v1737918898496!5m2!1str!2str"
                                allowFullScreen
                                className="w-full h-full"
                            ></iframe>
                        </div>
                    </div>

                    {/* İletişim Formu Kartı */}
                    <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) =>
                                            setFormData({ ...formData, name: e.target.value })
                                        }
                                        className="mt-1 block w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Email
                                        </label>
                                        <input
                                            type="email"
                                            required
                                            value={formData.email}
                                            onChange={(e) =>
                                                setFormData({ ...formData, email: e.target.value })
                                            }
                                            className="mt-1 block w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Phone
                                        </label>
                                        <input
                                            type="tel"
                                            required
                                            value={formData.phone}
                                            onChange={(e) =>
                                                setFormData({ ...formData, phone: e.target.value })
                                            }
                                            className="mt-1 block w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Message
                                    </label>
                                    <textarea
                                        rows={4}
                                        required
                                        value={formData.message}
                                        onChange={(e) =>
                                            setFormData({ ...formData, message: e.target.value })
                                        }
                                        className="mt-1 block w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                                        placeholder="Your message here..."
                                    ></textarea>
                                </div>
                            </div>

                            {/* Consents */}
                            <div className="space-y-3">
                                <label className="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
                                    <input
                                        type="checkbox"
                                        checked={consents.financing}
                                        onChange={(e) =>
                                            setConsents({ ...consents, financing: e.target.checked })
                                        }
                                        className="rounded text-blue-600 dark:bg-gray-700"
                                    />
                                    <span className="text-sm">
                                        I would like to be contacted for a financing offer
                                    </span>
                                </label>

                                <label className="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
                                    <input
                                        type="checkbox"
                                        required
                                        checked={consents.privacy}
                                        onChange={(e) =>
                                            setConsents({ ...consents, privacy: e.target.checked })
                                        }
                                        className="rounded text-blue-600 dark:bg-gray-700"
                                    />
                                    <span className="text-sm">I accept the privacy policy</span>
                                </label>
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white py-3 rounded-full shadow-lg hover:scale-105 transition-all duration-300 font-semibold"
                            >
                                Send Message
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}