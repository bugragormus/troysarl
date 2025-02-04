import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import Head from 'next/head';
import { Carousel } from 'react-responsive-carousel';
import Modal from 'react-modal';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import Car from '@/types/car';
// Modal stil ayarları
Modal.setAppElement('#__next');
const modalStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    transform: 'translate(-50%, -50%)',
    padding: '2rem',
    borderRadius: '0.5rem',
    background: '#fff',
    maxWidth: '90vw',
    maxHeight: '90vh',
  },
  overlay: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    zIndex: 1000,
  },
};
export default function CarDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [car, setCar] = useState<Car | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [showPhone, setShowPhone] = useState(false);
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
  const handleImageClick = (index: number) => {
    setActiveImageIndex(index);
    setIsModalOpen(true);
  };
  const handlePrev = () => {
    setActiveImageIndex((prev) =>
      prev > 0 ? prev - 1 : car ? car.photos.length - 1 : 0
    );
  };
  const handleNext = () => {
    setActiveImageIndex((prev) =>
      car && prev < car.photos.length - 1 ? prev + 1 : 0
    );
  };
  useEffect(() => {
    if (id) {
      const fetchCar = async () => {
        const { data, error } = await supabase
          .from('cars')
          .select('*')
          .eq('id', id)
          .eq('is_hidden', false)
          .single();
        if (error) {
          console.error(error);
          router.push('/404');
        } else {
          setCar(data);
        }
      };
      fetchCar();
    }
  }, [id]);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consents.privacy) {
      alert('You must accept the privacy policy to continue');
      return;
    }
    const response = await fetch(
      `https://formspree.io/f/${process.env.NEXT_PUBLIC_FORMSPREE_FORM_ID}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          consents,
          car_id: id,
          car_model: `${car?.brand} ${car?.model}`,
          listing_type: car?.listing_type,
        }),
      }
    );
    if (response.ok) {
      alert('Your request has been submitted successfully!');
      setFormData({ name: '', email: '', phone: '', message: '' });
      setShowContactForm(false);
    }
  };
  if (!car)
    return <div className="container mx-auto p-4 text-center">Loading...</div>;
  return (
    <div className="container mx-auto p-4 dark:bg-gray-900 min-h-screen transition-colors duration-300">
      <Head>
        <title>{car.brand} {car.model} | Troysarl</title>
        <meta name="description" content={car.description || `${car.year} ${car.brand} ${car.model}`} />
      </Head>
      <div className="max-w-4xl mx-auto">
        {/* Başlık Alanı */}
        <header className="mb-10">
          <h1 className="text-4xl font-extrabold text-gray-800 dark:text-white">
            {car.brand} {car.model}
          </h1>
          <p className="mt-2 text-lg text-gray-600 dark:text-gray-300">
            {car.year} • {car.body_type}
          </p>
        </header>
        {/* Slideshow (Resim Galerisi) */}
        <section className="mb-10">
          <div className="relative">
            <Carousel
              showThumbs={true}
              infiniteLoop
              selectedItem={activeImageIndex}
              className="rounded-2xl overflow-hidden shadow-xl"
              renderThumbs={(children) =>
                children.map((_, index) => (
                  <div key={index} className="h-20 w-20 cursor-pointer border border-gray-300 dark:border-gray-600 rounded-md overflow-hidden">
                    <img
                      src={car.photos[index]}
                      alt={`Thumbnail ${index + 1}`}
                      className="object-cover w-full h-full"
                    />
                  </div>
                ))
              }
            >
              {car.photos.map((photo, index) => (
                <div
                  key={index}
                  className="h-[500px] relative cursor-zoom-in border border-gray-300 dark:border-gray-600 rounded-lg"
                  onClick={() => handleImageClick(index)}
                >
                  <img
                    src={photo}
                    alt={`${car.brand} ${car.model}`}
                    className="object-contain w-full h-full"
                    style={{ cursor: 'zoom-in' }}
                  />
                  <div className="absolute inset-0 bg-black/8" />
                </div>
              ))}
            </Carousel>
          </div>
        </section>
        {/* Tam Ekran Modal */}
        <Modal
          isOpen={isModalOpen}
          onRequestClose={() => setIsModalOpen(false)}
          style={modalStyles}
        >
          <div className="relative">
            {/* Kapatma Butonu */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute -top-10 right-0 text-white text-4xl hover:text-gray-300 transition-colors z-50"
            >
              &times;
            </button>
            <img
              src={car.photos[activeImageIndex]}
              alt="Fullscreen view"
              className="max-h-[80vh] max-w-[90vw] object-contain rounded-lg"
            />
            {/* Navigasyon Butonları */}
            <button
              onClick={handlePrev}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-3 rounded-full hover:bg-black/70 transition-colors z-50"
            >
              &larr;
            </button>
            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-3 rounded-full hover:bg-black/70 transition-colors z-50"
            >
              &rarr;
            </button>
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
              {activeImageIndex + 1} / {car.photos.length}
            </div>
          </div>
        </Modal>
        {/* Detaylar, Fiyat ve İletişim Formu Alanı */}
        <section className="space-y-10">
          {/* Fiyat / İletişim Bilgileri */}
          <div className="bg-gray-100 dark:bg-gray-800 p-8 rounded-2xl shadow-lg">
            {car.listing_type === 'rental' ? (
              <div className="space-y-6 text-center">
                <p className="text-2xl font-semibold text-gray-800 dark:text-white">
                  Flexible Rental Plans Available
                </p>
                <button
                  onClick={() => setShowContactForm((prev) => !prev)}
                  className="w-full py-4 rounded-full bg-gradient-to-r from-green-500 to-blue-500 text-white font-bold shadow-lg transition-all duration-300 hover:bg-gradient-to-r hover:from-green-600 hover:to-blue-600 focus:outline-none"
                >
                  {showContactForm ? 'Close Form' : 'Request Rental Information'}
                </button>
                <p className="text-xl font-semibold text-gray-800 dark:text-white">Or Call Us Directly</p>
                <button
                  onClick={() => setShowPhone((prev) => !prev)}
                  className="w-full py-4 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold shadow-lg transition-all duration-300 hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 focus:outline-none"
                >
                  {showPhone ? process.env.NEXT_PUBLIC_PHONE_NUMBER : 'Show Contact'}
                </button>
              </div>
            ) : (
              <div className="flex justify-center items-center">
                <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">€{car.price.toLocaleString()}</p>
              </div>
            )}
          </div>
          {/* İletişim Formu (Rental Listing için) */}
          {showContactForm && car.listing_type === 'rental' && (
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Full Name*</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-3 mt-1 rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email*</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full p-3 mt-1 rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone*</label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full p-3 mt-1 rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Message*</label>
                  <textarea
                    rows={4}
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full p-3 mt-1 rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-green-500"
                    placeholder="Your rental details, preferred dates, etc."
                  ></textarea>
                </div>
                <div className="space-y-3">
                  <label className="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
                    <input
                      type="checkbox"
                      checked={consents.financing}
                      onChange={(e) => setConsents({ ...consents, financing: e.target.checked })}
                      className="rounded text-blue-600 dark:bg-gray-700"
                    />
                    <span className="text-sm">I would like to be contacted for a financing offer</span>
                  </label>
                  <label className="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
                    <input
                      type="checkbox"
                      required
                      checked={consents.privacy}
                      onChange={(e) => setConsents({ ...consents, privacy: e.target.checked })}
                      className="rounded text-blue-600 dark:bg-gray-700"
                    />
                    <span className="text-sm">
                      I accept the{' '}
                      <a
                        href="/privacy-policy"
                        className="text-green-500 hover:underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        privacy policy
                      </a>
                    </span>
                  </label>
                </div>
                <button
                  type="submit"
                  className="w-full py-4 rounded-full bg-green-600 text-white font-bold shadow-lg hover:bg-green-700 transition-colors"
                >
                  Submit Request
                </button>
              </form>
            </div>
          )}
          {/* Specifications */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[
              { label: 'Year', value: car.year },
              { label: 'Body Type', value: car.body_type },
              { label: 'Mileage', value: `${car.mileage?.toLocaleString()} km` },
              { label: 'Transmission', value: car.transmission },
              { label: 'Doors', value: car.doors },
              { label: 'Color', value: car.color },
            ].map((spec, index) => (
              <div key={index} className="bg-gray-100 dark:bg-gray-800 p-6 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700">
                <p className="text-gray-600 dark:text-gray-400">{spec.label}</p>
                <p className="mt-2 text-xl font-semibold dark:text-white">{spec.value}</p>
              </div>
            ))}
          </div>
          {/* Detailed Description */}
          <div className="mt-8">
            <div className="bg-gray-100 dark:bg-gray-800 p-8 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700">
              <h3 className="text-2xl font-bold mb-4 dark:text-white">Detailed Information</h3>
              <p className="text-gray-700 dark:text-gray-300">{car.description}</p>
            </div>
          </div>
          {/* Features */}
          <div className="mt-8 space-y-8">
            <div className="bg-gray-100 dark:bg-gray-800 p-8 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700">
              <h3 className="text-2xl font-bold mb-4 dark:text-white">Safety Features</h3>
              <div className="grid grid-cols-2 gap-4">
                {car.features.safety?.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <span className="text-green-600 font-bold">✓</span>
                    <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gray-100 dark:bg-gray-800 p-8 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700">
              <h3 className="text-2xl font-bold mb-4 dark:text-white">Comfort &amp; Convenience</h3>
              <div className="grid grid-cols-2 gap-4">
                {car.features.comfort?.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <span className="text-green-600 font-bold">✓</span>
                    <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}