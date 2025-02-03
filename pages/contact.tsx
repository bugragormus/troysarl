import { useState } from 'react';
import Head from 'next/head';

export default function Contact() {
    const [darkMode, setDarkMode] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        message: ''
    });
    const [consents, setConsents] = useState({
        financing: false,
        privacy: false,
        contact: false
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!consents.privacy) {
            alert('You must accept the privacy policy');
            return;
        }

        const response = await fetch(`https://formspree.io/f/${process.env.NEXT_PUBLIC_FORMSPREE_FORM_ID}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            alert('Mesajınız başarıyla gönderildi!');
            setFormData({ name: '', email: '', phone: '', message: '' });
        } else {
            alert('Bir hata oluştu. Lütfen tekrar deneyin.');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-premium-light to-white dark:from-premium-dark dark:to-gray-900">
            <Head>
                <title>Contact Us - Troysarl</title>
            </Head>

            <div className="max-w-4xl mx-auto py-16 px-4">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-premium to-luxury">
                        Get in Touch
                    </h1>
                </div>

                <div className="space-y-8">
                    {/* Contact Info */}
                    <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg">
                        <h2 className="text-2xl font-bold mb-6 dark:text-white">Contact Information</h2>

                        <div className="space-y-4">
                            <div>
                                <h3 className="text-lg font-semibold">Address</h3>
                                <p className="text-gray-600">{process.env.NEXT_PUBLIC_ADRESS}</p>
                            </div>

                            <div>
                                <h3 className="text-lg font-semibold">Phone</h3>
                                <p className="text-gray-600">{process.env.NEXT_PUBLIC_PHONE_NUMBER}</p>
                            </div>

                            <div>
                                <h3 className="text-lg font-semibold">E-Mail</h3>
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

                    <div className="space-y-8">
                        {/* Contact Form */}
                        <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium dark:text-gray-300">Full Name</label>
                                    <input
                                        type="text"
                                        required
                                        className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-premium focus:ring-premium dark:bg-gray-700"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium dark:text-gray-300">Email</label>
                                        <input
                                            type="email"
                                            required
                                            className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-premium focus:ring-premium dark:bg-gray-700"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium dark:text-gray-300">Phone</label>
                                        <input
                                            type="tel"
                                            required
                                            className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-premium focus:ring-premium dark:bg-gray-700"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium dark:text-gray-300">Message</label>
                                    <textarea
                                        rows={4}
                                        required
                                        className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-premium focus:ring-premium dark:bg-gray-700"
                                    ></textarea>
                                </div>
                            </div>

                            {/* Consents */}
                            <div className="space-y-3">
                                <label className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        checked={consents.financing}
                                        onChange={(e) => setConsents({ ...consents, financing: e.target.checked })}
                                        className="rounded text-premium focus:ring-premium"
                                    />
                                    <span className="text-sm dark:text-gray-300">I would like to be contacted for a financing offer</span>
                                </label>

                                <label className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        required
                                        checked={consents.privacy}
                                        onChange={(e) => setConsents({ ...consents, privacy: e.target.checked })}
                                        className="rounded text-premium focus:ring-premium"
                                    />
                                    <span className="text-sm dark:text-gray-300">I accept the privacy policy</span>
                                </label>
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-premium text-white py-3 rounded-lg hover:bg-premium-dark transition-colors"
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