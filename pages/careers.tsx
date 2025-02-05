import { useState } from "react";
import Head from "next/head";

export default function CareersPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    position: "",
    message: "",
  });
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      // 1. CV'yi Uploadcare'e yükle
      let cvUrl = "";
      if (cvFile) {
        const uploadcareResponse = await fetch(
          `https://upload.uploadcare.com/base/`,
          {
            method: "POST",
            body: JSON.stringify({
              file: cvFile,
              UPLOADCARE_PUB_KEY: "YOUR_UPLOADCARE_PUBLIC_KEY", // Uploadcare Public Key
            }),
          }
        );
        const uploadcareData = await uploadcareResponse.json();
        cvUrl = uploadcareData.file;
      }

      // 2. Form verilerini Formspree'ye gönder
      const formspreeResponse = await fetch(
        "https://formspree.io/f/YOUR_FORMSPREE_FORM_ID", // Formspree Form ID
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...formData,
            cvUrl, // Uploadcare'den gelen CV URL'si
          }),
        }
      );

      if (!formspreeResponse.ok) {
        throw new Error("Form submission failed");
      }

      setSubmitSuccess(true);
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        position: "",
        message: "",
      });
      setCvFile(null);
    } catch (err: any) {
      setError(err.message || "An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <Head>
        <title>Careers - Troysarl</title>
      </Head>

      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Join Our Team
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Explore career opportunities at Troysarl
          </p>
        </div>

        {submitSuccess && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            Application submitted successfully!
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Form alanları aynı kalacak */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                First Name*
              </label>
              <input
                type="text"
                required
                value={formData.firstName}
                onChange={(e) =>
                  setFormData({ ...formData, firstName: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Last Name*
              </label>
              <input
                type="text"
                required
                value={formData.lastName}
                onChange={(e) =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>

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
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Phone Number*
            </label>
            <input
              type="tel"
              required
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              CV Upload* (PDF only, max 5MB)
            </label>
            <input
              type="file"
              required
              accept="application/pdf"
              onChange={(e) => setCvFile(e.target.files?.[0] || null)}
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-gray-700 dark:file:text-gray-200"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Cover Letter
            </label>
            <textarea
              rows={4}
              value={formData.message}
              onChange={(e) =>
                setFormData({ ...formData, message: e.target.value })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              placeholder="Tell us why you'd be a great fit..."
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-800 text-white py-3 px-4 rounded-md hover:from-blue-700 hover:to-blue-900 transition-all disabled:opacity-50"
          >
            {isSubmitting ? "Submitting..." : "Submit Application"}
          </button>
        </form>
      </div>
    </div>
  );
}
