// components/ContactForm.tsx
import { useState } from "react";
import toast from "react-hot-toast";

type Props = {
  carId: string;
  carBrand: string;
  carModel: string;
  listingType: "sale" | "rental" | "reserved" | "sold";
  carYear?: number;
  carMileage?: number;
  carColor?: string;
  isExclusive?: boolean;
  onClose: () => void;
};

export default function ContactForm({
  carId,
  carBrand,
  carModel,
  listingType,
  carYear,
  carMileage,
  carColor,
  isExclusive,
  onClose,
}: Props) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [consents, setConsents] = useState({
    financing: false,
    privacy: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isRental = listingType === "rental";
  const buttonLabel = isRental
    ? "Request Rental Information"
    : "Send Appointment Request";
  const placeholder = isRental
    ? "Your rental details, preferred dates, etc."
    : "Your preferred dates, etc.";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consents.privacy) {
      toast.error("You must accept the privacy policy to continue");
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await fetch(
        `https://formspree.io/f/${process.env.NEXT_PUBLIC_FORMSPREE_FORM_ID}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...formData,
            consents,
            car_id: carId,
            car_model: `${carBrand} ${carModel}`,
            listing_type: listingType,
            is_exclusive: isExclusive,
            car_year: carYear,
            car_km: carMileage,
            car_color: carColor,
          }),
        }
      );
      if (response.ok) {
        toast.success("Your request has been submitted successfully!");
        setFormData({ name: "", email: "", phone: "", message: "" });
        onClose();
      } else {
        toast.error("Submission failed. Please try again.");
      }
    } catch {
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700">
      <form onSubmit={handleSubmit} className="space-y-6" data-captcha="true">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Full Name*
          </label>
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
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Email*
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full p-3 mt-1 rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Phone*
            </label>
            <input
              type="tel"
              required
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              className="w-full p-3 mt-1 rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Message*
          </label>
          <textarea
            rows={4}
            required
            value={formData.message}
            onChange={(e) =>
              setFormData({ ...formData, message: e.target.value })
            }
            className="w-full p-3 mt-1 rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-green-500"
            placeholder={placeholder}
          />
        </div>

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
            <span className="text-sm">
              I accept the{" "}
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
          disabled={isSubmitting}
          className="w-full py-4 rounded-lg bg-gray-900 hover:bg-gray-800 disabled:opacity-60 text-white dark:bg-gray-100 dark:hover:bg-gray-200 dark:text-gray-900 font-medium shadow-md transition-all duration-300"
        >
          {isSubmitting ? "Sending..." : buttonLabel}
        </button>
      </form>
    </div>
  );
}
