import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import Head from 'next/head';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';

interface Car {
  id: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  fuel_type: string;
  photos: string[];
  listing_type: 'sale' | 'rental' | 'both';
  mileage: number;
  body_type: string;
  color: string;
  horsepower: number;
  transmission: string;
  doors: number;
  features: {
    safety: string[];
    comfort: string[];
    entertainment: string[];
  };
  description: string;
}

export default function CarDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [car, setCar] = useState<Car | null>(null);
  const [showContactForm, setShowContactForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [consents, setConsents] = useState({
    financing: false,
    privacy: false,
  });

  useEffect(() => {
    const fetchCar = async () => {
      const { data, error } = await supabase
        .from('cars')
        .select('*')
        .eq('id', id)
        .eq('is_hidden', false)
        .single();

      if (error) {
        console.error('Error:', error);
        router.push('/404');
      } else {
        setCar(data);
      }
    };

    if (id) fetchCar();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!consents.privacy) {
      alert('You must accept the privacy policy to continue');
      return;
    }

    const response = await fetch(`https://formspree.io/f/${process.env.NEXT_PUBLIC_FORMSPREE_FORM_ID}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...formData,
        consents,
        car_id: id,
        car_model: `${car?.brand} ${car?.model}`,
        listing_type: car?.listing_type
      })
    });

    if (response.ok) {
      alert('Your request has been submitted successfully!');
      setFormData({ name: '', email: '', phone: '', message: '' });
      setShowContactForm(false);
    }
  };

  if (!car) return <div className="container mx-auto p-4">Loading...</div>;

  return (
    <div className="container mx-auto p-4 dark:bg-gray-900 min-h-screen">
      <Head>
        <title>{car.brand} {car.model} | Troysarl</title>
        <meta name="description" content={car.description || `${car.year} ${car.brand} ${car.model}`} />
      </Head>

      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 dark:text-white">
          {car.brand} {car.model}
        </h1>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div className="md:order-1">
            <Carousel
              showThumbs={true}
              infiniteLoop={true}
              className="rounded-xl overflow-hidden shadow-lg"
            >
              {car.photos.map((photo, index) => (
                <div key={index} className="h-96">
                  <img
                    src={photo}
                    alt={`${car.brand} ${car.model} - Photo ${index + 1}`}
                    className="object-cover w-full h-full"
                  />
                </div>
              ))}
            </Carousel>
          </div>

          {/* Details Section */}
          <div className="space-y-6 md:order-2">
            {/* Pricing & Contact */}
            <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-xl">
              {car.listing_type === 'rental' ? (
                <div className="text-center space-y-4">
                  <p className="text-xl font-semibold dark:text-white">
                    Custom Rental Plans Available
                  </p>
                  <button
                    onClick={() => setShowContactForm(!showContactForm)}
                    className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors w-full"
                  >
                    {showContactForm ? 'Close Form' : 'Request Rental Information'}
                  </button>
                </div>
              ) : (
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                      €{car.price.toLocaleString()}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Contact Form */}
            {showContactForm && (
              <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg space-y-4">
                <div>
                  <label className="block text-sm font-medium dark:text-gray-300">Full Name*</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-2 rounded border dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium dark:text-gray-300">Email*</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full p-2 rounded border dark:bg-gray-700 dark:border-gray-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium dark:text-gray-300">Phone*</label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full p-2 rounded border dark:bg-gray-700 dark:border-gray-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium dark:text-gray-300">Message*</label>
                  <textarea
                    rows={4}
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full p-2 rounded border dark:bg-gray-700 dark:border-gray-600"
                    placeholder="Please include your preferred rental dates and any special requests"
                  ></textarea>
                </div>

                {/* Consent Checkboxes */}
                <div className="space-y-3">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={consents.financing}
                      onChange={(e) => setConsents({ ...consents, financing: e.target.checked })}
                      className="rounded text-premium focus:ring-premium dark:bg-gray-700"
                    />
                    <span className="text-sm dark:text-gray-300">
                      I would like to be contacted for a financing offer
                    </span>
                  </label>

                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      required
                      checked={consents.privacy}
                      onChange={(e) => setConsents({ ...consents, privacy: e.target.checked })}
                      className="rounded text-premium focus:ring-premium dark:bg-gray-700"
                    />
                    <span className="text-sm dark:text-gray-300">
                      I accept the{' '}
                      <a
                        href="/privacy-policy"
                        className="text-premium hover:underline"
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
                  className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Submit Request
                </button>
              </form>
            )}

            {/* Specifications */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                <p className="text-gray-600 dark:text-gray-400">Year</p>
                <p className="font-semibold dark:text-white">{car.year}</p>
              </div>
              <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                <p className="text-gray-600 dark:text-gray-400">Body Type</p>
                <p className="font-semibold dark:text-white">{car.body_type}</p>
              </div>
              <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                <p className="text-gray-600 dark:text-gray-400">Mileage</p>
                <p className="font-semibold dark:text-white">{car.mileage?.toLocaleString()} km</p>
              </div>
              <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                <p className="text-gray-600 dark:text-gray-400">Transmission</p>
                <p className="font-semibold dark:text-white">{car.transmission}</p>
              </div>
            </div>

            {/* Features */}
            <div className="space-y-6">
              <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-xl">
                <h3 className="text-xl font-semibold mb-4 dark:text-white">Safety Features</h3>
                <div className="grid grid-cols-2 gap-2">
                  {car.features.safety?.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <span className="text-blue-600">✓</span>
                      <span className="dark:text-gray-300">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-xl">
                <h3 className="text-xl font-semibold mb-4 dark:text-white">Comfort & Convenience</h3>
                <div className="grid grid-cols-2 gap-2">
                  {car.features.comfort?.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <span className="text-blue-600">✓</span>
                      <span className="dark:text-gray-300">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div >
  );
}