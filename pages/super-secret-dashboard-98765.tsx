// pages/super-secret-dashboard-98765.tsx
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import Car from "@/types/car";
import toast, { Toaster } from "react-hot-toast";
import * as Sentry from "@sentry/react";
import Image from "next/image";
import { Transaction } from "@/types/transaction";

const bodyTypeOptions = [
  "Sedan",
  "Coupe",
  "Hatchback",
  "Pickup",
  "Off-Road",
  "Sport",
  "Van",
  "Convertible",
  "Crossover",
  "SUV",
  "Station Wagon",
  "Muscle",
  "Roadster",
  "Cabriolet",
  "Compact",
];

const featureOptions: { [key: string]: string[] } = {
  safety: [
    "ABS",
    "Airbags",
    "Parking Sensors",
    "Lane Assist",
    "Blind Spot Detection",
    "AEB", // Automatic Emergency Braking
    "BAS", // Brake Assist System
    "Child Lock",
    "Distronic",
    "ESP / VSA", // Electronic Stability Program / Vehicle Stability Assist
    "Night Vision System",
    "Immobilizer",
    "Isofix",
    "Central Locking",
    "Hill Start Assist", // Yokuş Kalkış Desteği
    "Driver Fatigue Detection", // Yorgunluk Tespit Sistemi
  ],

  comfort: [
    "Climate Control",
    "Heated Seats",
    "Keyless Entry",
    "Sunroof",
    "Power Windows",
    "Leather Seats",
    "Power Seats",
    "Functional Steering Wheel",
    "Rearview Camera",
    "Head-up Display",
    "Cruise Control",
    "Hydraulic Steering",
    "Heated Steering Wheel",
    "Memory Seats",
    "Cooled Seats",
    "Fabric Seats",
    "Automatic Dimming Rearview Mirror",
    "Front Armrest",
    "Cooled Glove Compartment",
    "Start / Stop",
    "Trip Computer",
    "Power Mirrors",
    "Heated Mirrors",
    "Adaptive Headlights",
    "Automatic Doors",
    "Panoramic Sunroof",
    "Parking Assist",
    "Rear Parking Sensors",
    "Trailer Tow Hitch",
    "Sliding Door (Single)",
  ],

  entertainment: [
    "Navigation",
    "USB / AUX",
    "Bluetooth",
    "Apple CarPlay",
    "Android Auto",
    "Rear Camera",
  ],
};

export default function AdminPanel() {
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCar, setEditingCar] = useState<Car | null>(null);

  const [showDashboard, setShowDashboard] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const [selectedCarId, setSelectedCarId] = useState("");
  const [customerFullname, setCustomerFullname] = useState("");
  const [chassisNumber, setChassisNumber] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("nakit");
  const [purchaseDate, setPurchaseDate] = useState("");
  const [purchaseAmount, setPurchaseAmount] = useState<number>();
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [sellerName, setSellerName] = useState("");
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [totalPrice, setTotalPrice] = useState<number>();
  const [transactionType, setTransactionType] = useState<"rental" | "sale">(
    "sale"
  );

  // Car Form State
  const [cars, setCars] = useState<Car[]>([]);
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  // Eski "year" state yerine manufactureDate adında string state kullanıyoruz
  const [manufactureDate, setManufactureDate] = useState<string>("");
  const [price, setPrice] = useState<number | undefined>(undefined);
  const [mileage, setMileage] = useState<number | undefined>(undefined);
  const [bodyType, setBodyType] = useState("");
  const [color, setColor] = useState("");
  const [transmission, setTransmission] = useState("Automatic");
  const [doors, setDoors] = useState<number>(5);
  const [fuelType, setFuelType] = useState("Petrol");
  const [listingType, setListingType] = useState<
    "sale" | "rental" | "reserved" | "sold"
  >("sale");
  const [description, setDescription] = useState("");
  const [selectedFeatures, setSelectedFeatures] = useState<{
    [key: string]: boolean;
  }>({});

  // Photo Upload State
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);

  // Sayfalama state'leri
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const totalPages = Math.ceil(cars.length / pageSize);
  const displayedCars = cars.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Fetch Cars
  useEffect(() => {
    const fetchCars = async () => {
      const { data, error } = await supabase.from("cars").select("*");
      if (error) console.error("Error:", error);
      else setCars(data || []);
    };
    if (isAuthenticated) fetchCars();
  }, [isAuthenticated]);

  // Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const response = await fetch("/api/admin-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (response.ok) {
      toast.success("Login successful!");
      setIsAuthenticated(true);
    } else {
      const data = await response.json();
      toast.error(data.message || "Incorrect password!");
    }
  };

  // Fetch Transactions
  const fetchTransactions = async () => {
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Veri çekme hatası: " + error.message);
      Sentry.captureException(error);
    } else {
      setTransactions(data || []);
    }
  };

  // Add Transaction
  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !selectedCarId ||
      !customerFullname ||
      !phoneNumber ||
      !startDate ||
      !totalPrice ||
      !paymentMethod
    ) {
      toast.error("Zorunlu alanları doldurun! (*)");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("transactions")
        .insert([
          {
            car_id: selectedCarId,
            customer_fullname: customerFullname,
            phone_number: phoneNumber,
            start_date: startDate,
            end_date: transactionType === "rental" ? endDate : null,
            total_price: totalPrice,
            transaction_type: transactionType,
            chassis_number: chassisNumber,
            payment_method: paymentMethod,
            purchase_date: purchaseDate,
            purchase_amount: purchaseAmount,
            invoice_number: invoiceNumber,
            seller_name: sellerName,
          },
        ])
        .select();

      if (error) throw error;
      if (data?.[0]) {
        setTransactions((prev) => [data[0], ...prev]);
        // Formu temizle
        setCustomerFullname("");
        setPhoneNumber("");
        setTotalPrice(undefined);
        setChassisNumber("");
        setPaymentMethod("nakit");
        setPurchaseDate("");
        setPurchaseAmount(undefined);
        setInvoiceNumber("");
        setSellerName("");
        toast.success("İşlem kaydedildi!");
      }
    } catch (error) {
      toast.error("Kayıt hatası!");
      Sentry.captureException(error);
    }
  };

  // İşlem Silme Fonksiyonu
  const handleDeleteTransaction = async (id: string) => {
    if (!confirm("Bu işlemi silmek istediğinize emin misiniz?")) return;

    try {
      const { error } = await supabase
        .from("transactions")
        .delete()
        .eq("id", id);

      if (error) throw error;
      setTransactions((prev) => prev.filter((t) => t.id !== id));
      toast.success("İşlem başarıyla silindi!");
    } catch (error) {
      toast.error("Silme işlemi başarısız!");
      Sentry.captureException(error);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gradient-to-b from-premium-light to-white">
        <form
          onSubmit={handleLogin}
          className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md w-80 border border-gray-200 dark:border-gray-700"
        >
          <h1 className="text-2xl font-bold mb-6 text-center text-gray-800 dark:text-gray-100">
            Admin Login
          </h1>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="block w-full mb-4 p-3 rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white p-3 rounded-full transition-transform font-semibold"
          >
            Login
          </button>
        </form>
        <Toaster position="top-right" reverseOrder={false} />
      </div>
    );
  }

  // Check - Uncheck All
  const handleCheckAll = (category: string, checkAll: boolean) => {
    const updatedFeatures = { ...selectedFeatures };

    featureOptions[category].forEach((feature) => {
      updatedFeatures[`${category}-${feature}`] = checkAll;
    });

    setSelectedFeatures(updatedFeatures);
  };

  const handleEditCheckAll = (category: string, check: boolean) => {
    const updatedFeatures = check
      ? featureOptions[category] // Check All: tüm özellikler seçilecek
      : []; // Uncheck All: tüm özellikler kaldırılacak

    setEditingCar((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        features: {
          ...prev.features,
          [category]: updatedFeatures,
        },
      };
    });
  };

  // File Handling
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    setSelectedFiles(Array.from(e.target.files));
  };

  const handleFileUpload = async (isEditing: boolean = false) => {
    if (!selectedFiles.length) return;
    setUploading(true);

    try {
      const convertedFiles = await Promise.all(
        selectedFiles.map(async (file) => {
          if (
            file.type === "image/heic" ||
            file.name.toLowerCase().endsWith(".heic")
          ) {
            // Tarayıcı ortamında olduğumuzu kontrol ediyoruz
            if (typeof window !== "undefined") {
              // Dinamik olarak heic2any'yi içe aktar
              const heic2anyModule = await import("heic2any");
              const heic2any = heic2anyModule.default;
              // HEIC dosyasını JPEG'e dönüştür
              const blob = await heic2any({ blob: file, toType: "image/jpeg" });
              return new File(
                [blob as Blob],
                file.name.replace(/\.heic$/i, ".jpg"),
                { type: "image/jpeg" }
              );
            }
            // Eğer window undefined ise (sunucu tarafı) dosyayı olduğu gibi döndür
            return file;
          }
          return file; // Diğer dosya türleri için dönüştürme yapma
        })
      );

      const urls = await Promise.all(
        convertedFiles.map(async (file) => {
          const fileName = `${Date.now()}_${file.name}`;
          const { data, error } = await supabase.storage
            .from("car-photos")
            .upload(fileName, file);
          if (error) throw error;
          return supabase.storage.from("car-photos").getPublicUrl(data.path)
            .data.publicUrl;
        })
      );

      if (isEditing && editingCar) {
        setEditingCar({
          ...editingCar,
          photos: [...editingCar.photos, ...urls],
        });
      } else {
        setUploadedUrls((prev) => [...prev, ...urls]);
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(`Upload error: ${error.message}`);
        Sentry.captureException(error);
      } else {
        toast.error("Upload error occurred");
        Sentry.captureException(new Error("An unknown error occurred"));
      }
    } finally {
      setUploading(false);
      setSelectedFiles([]);
    }
  };

  // Delete Photo
  const handleDeletePhoto = async (url: string) => {
    if (!confirm("Delete this photo?")) return;
    const fileName = new URL(url).pathname.split("/").pop();
    const { error } = await supabase.storage
      .from("car-photos")
      .remove([fileName || ""]);
    if (error) toast.error(`Delete failed: ${error.message}`);
    else setUploadedUrls((prev) => prev.filter((u) => u !== url));
  };

  // Updating features
  const handleEditFeatureToggle = (category: string, feature: string) => {
    if (!editingCar) return;

    const updatedFeatures = { ...editingCar.features };
    const currentFeatures = updatedFeatures[category] || [];

    if (currentFeatures.includes(feature)) {
      updatedFeatures[category] = currentFeatures.filter((f) => f !== feature);
    } else {
      updatedFeatures[category] = [...currentFeatures, feature];
    }

    setEditingCar({ ...editingCar, features: updatedFeatures });
  };

  // Updating car details
  const handleUpdateCar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCar) return;

    try {
      const originalCar = cars.find((c) => c.id === editingCar.id);
      if (originalCar) {
        const deletedPhotos = originalCar.photos.filter(
          (photo) => !editingCar.photos.includes(photo)
        );

        if (deletedPhotos.length > 0) {
          const filePaths = deletedPhotos
            .map((url) => {
              try {
                const parsedUrl = new URL(url);
                const fullPath = decodeURIComponent(parsedUrl.pathname);
                const pathSegments = fullPath.split("/car-photos/");
                return pathSegments[1] || null;
              } catch (error) {
                console.error("URL parse error:", url, error);
                Sentry.captureException(error);
                return null;
              }
            })
            .filter(Boolean) as string[];

          if (filePaths.length > 0) {
            const { error } = await supabase.storage
              .from("car-photos")
              .remove(filePaths);
            if (error) {
              console.error("Supabase storage remove error:", {
                filePaths,
                error,
              });
              throw new Error(`Photo deletion failed: ${error.message}`);
            }
          }
        }
      }

      const { data, error } = await supabase
        .from("cars")
        .update({
          ...editingCar,
          year: manufactureDate,
          price: Number(editingCar.price),
          mileage: editingCar.mileage ? Number(editingCar.mileage) : null,
          doors: Number(editingCar.doors),
        })
        .eq("id", editingCar.id)
        .select();

      if (error) throw error;
      if (data?.[0]) {
        setCars((prev) => prev.map((c) => (c.id === data[0].id ? data[0] : c)));
        setIsEditModalOpen(false);
        toast.success("Araç başarıyla güncellendi!");
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(`Güncelleme hatası: ${error.message}`);
        Sentry.captureException(error);
      } else {
        toast.error("Güncelleme hatası oluştu");
        Sentry.captureException(new Error("Bilinmeyen hata"));
      }
    }
  };

  // Feature Selection
  const handleFeatureToggle = (category: string, feature: string) => {
    setSelectedFeatures((prev) => ({
      ...prev,
      [`${category}-${feature}`]: !prev[`${category}-${feature}`],
    }));
  };

  // Submit Car
  const handleAddCar = async (e: React.FormEvent) => {
    e.preventDefault();
    // manufactureDate (tarih) zorunlu, price de zorunlu
    if (
      !brand ||
      !model ||
      !manufactureDate ||
      !price ||
      uploadedUrls.length === 0
    ) {
      toast.error("Please fill all required fields!");
      return;
    }
    const features = {
      safety: Object.keys(selectedFeatures)
        .filter((key) => key.startsWith("safety-") && selectedFeatures[key])
        .map((key) => key.replace("safety-", "")),
      comfort: Object.keys(selectedFeatures)
        .filter((key) => key.startsWith("comfort-") && selectedFeatures[key])
        .map((key) => key.replace("comfort-", "")),
      entertainment: Object.keys(selectedFeatures)
        .filter(
          (key) => key.startsWith("entertainment-") && selectedFeatures[key]
        )
        .map((key) => key.replace("entertainment-", "")),
    };

    try {
      const { data, error } = await supabase
        .from("cars")
        .insert([
          {
            brand,
            model,
            year: manufactureDate, // ISO format (YYYY-MM-DD) olarak gönderilecek
            price,
            mileage,
            body_type: bodyType,
            color,
            transmission,
            doors,
            fuel_type: fuelType,
            listing_type: listingType,
            photos: uploadedUrls,
            description,
            features,
          },
        ])
        .select();
      if (error) throw error;
      if (data?.[0]) {
        setCars((prev) => [...prev, data[0]]);
        // Reset form
        setBrand("");
        setModel("");
        setManufactureDate("");
        setPrice(undefined);
        setUploadedUrls([]);
        setSelectedFeatures({});
        toast.success("Car added successfully!");
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(`Error: ${error.message}`);
        Sentry.captureException(error);
      } else {
        toast.error("An unknown error occurred");
        Sentry.captureException(new Error("An unknown error occurred"));
      }
    }
  };

  // Yardımcı bileşen
  const DetailItem = ({
    label,
    value,
    className,
  }: {
    label: string;
    value: string | number;
    className?: string;
  }) => (
    <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 py-2">
      <span className="font-medium dark:text-gray-300">{label}:</span>
      <span className={`dark:text-gray-400 ${className}`}>{value || "-"}</span>
    </div>
  );

  // Delete Car (Fotoğraflar da silinecek)
  const handleDeleteCar = async (id: string) => {
    if (!confirm("Delete this car and all photos?")) return;
    try {
      const car = cars.find((c) => c.id === id);
      if (!car) throw new Error("Car not found");

      if (car.photos?.length) {
        const filePaths = car.photos
          .map((url) => {
            try {
              const parsedUrl = new URL(url);
              const fullPath = decodeURIComponent(parsedUrl.pathname);
              const pathSegments = fullPath.split("/car-photos/");
              return pathSegments[1] || null;
            } catch (error) {
              console.error("URL parse error:", url, error);
              Sentry.captureException(error);
              return null;
            }
          })
          .filter(Boolean) as string[];

        if (filePaths.length > 0) {
          const { error } = await supabase.storage
            .from("car-photos")
            .remove(filePaths);
          if (error) {
            console.error("Supabase storage remove error:", {
              filePaths,
              error,
            });
            throw new Error(`Photo deletion failed: ${error.message}`);
          }
        }
      }

      const { error: deleteError } = await supabase
        .from("cars")
        .delete()
        .eq("id", id);

      if (deleteError) throw deleteError;

      setCars((prev) => prev.filter((c) => c.id !== id));
      toast.success("Car deleted successfully!");
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(`Error: ${error.message}`);
        Sentry.captureException(error);
      } else {
        toast.error("An unknown error occurred");
        Sentry.captureException(new Error("An unknown error occurred"));
      }
    }
  };

  // Toggle Visibility
  const toggleVisibility = async (id: string, current: boolean) => {
    try {
      await supabase.from("cars").update({ is_hidden: !current }).eq("id", id);
      setCars((prev) =>
        prev.map((c) => (c.id === id ? { ...c, is_hidden: !current } : c))
      );
    } catch (error) {
      toast.error("Update failed!");
      Sentry.captureException(error);
    }
  };

  // Update Listing Type
  const updateListingType = async (
    carId: string,
    newType: "sale" | "rental" | "reserved" | "sold"
  ) => {
    try {
      const { error } = await supabase
        .from("cars")
        .update({ listing_type: newType })
        .eq("id", carId);
      if (error) throw error;
      setCars((prev) =>
        prev.map((car) =>
          car.id === carId ? { ...car, listing_type: newType } : car
        )
      );
      toast.success("Listing type updated successfully!");
    } catch (error) {
      console.error("Update error:", error);
      Sentry.captureException(error);
      toast.error("Failed to update listing type!");
    }
  };

  // Eğer henüz doğrulanmamışsa, login formunu göster
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:dark:bg-gradient-to-b from-premium-light to-white">
        <form
          onSubmit={handleLogin}
          className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md w-80 border border-gray-200 dark:border-gray-700"
        >
          <h1 className="text-2xl font-bold mb-6 text-center text-gray-800 dark:text-gray-100">
            Admin Login
          </h1>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="block w-full mb-4 p-3 rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white p-3 rounded-full transition-transform font-semibold"
          >
            Login
          </button>
        </form>
        <Toaster position="top-right" reverseOrder={false} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:dark:bg-gradient-to-b from-premium-light to-white p-4 transition-colors duration-300">
      <div className="mt-7 max-w-7xl mx-auto">
        <button
          onClick={() => {
            setShowDashboard(!showDashboard);
            if (!showDashboard) fetchTransactions();
          }}
          className="mb-4 bg-purple-500 text-white px-4 py-2 rounded"
        >
          {showDashboard
            ? "Dashboard'u Kapat"
            : "Satış/Kiralama Kayıtlarını Göster"}
        </button>

        {showDashboard && (
          <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl shadow-lg">
            <h2 className="text-2xl font-bold mb-6 dark:text-white">
              İşlem Kayıtları
            </h2>

            {/* Yeni İşlem Formu */}
            <form onSubmit={handleAddTransaction} className="mb-8">
              <div className="grid md:grid-cols-2 gap-4">
                {/* Araba ve İşlem Tipi Seçimi */}
                <select
                  value={selectedCarId}
                  onChange={(e) => setSelectedCarId(e.target.value)}
                  className="p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                  required
                >
                  <option value="">Araba Seçin*</option>
                  {cars
                    .filter((car) => car.listing_type !== "sold") // Sold durumunu filtrele
                    .map((car) => (
                      <option key={car.id} value={car.id}>
                        {car.brand} {car.model} ({car.color})
                      </option>
                    ))}
                </select>

                <select
                  value={transactionType}
                  onChange={(e) =>
                    setTransactionType(e.target.value as "rental" | "sale")
                  }
                  className="p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                >
                  <option value="rental">Kiralama</option>
                  <option value="sale">Satış</option>
                </select>

                {/* Müşteri Bilgileri */}
                <input
                  type="text"
                  placeholder="Müşteri Adı*"
                  value={customerFullname}
                  onChange={(e) => setCustomerFullname(e.target.value)}
                  className="p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                  required
                />

                <input
                  type="tel"
                  placeholder="Telefon Numarası*"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                  required
                />

                {/* İşlem Bilgileri */}
                <div className="space-y-4 col-span-full border-t pt-4">
                  <h3 className="text-lg font-semibold dark:text-white">
                    Araç Satış/Kiralama Bilgileri
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <input
                      type="date"
                      placeholder="Başlangıç Tarihi*"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                      required
                    />

                    {transactionType === "rental" && (
                      <input
                        type="date"
                        placeholder="Bitiş Tarihi"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                      />
                    )}

                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                      required
                    >
                      <option value="nakit">Nakit</option>
                      <option value="kredi_karti">Kredi Kartı</option>
                      <option value="havale">Havale/EFT</option>
                    </select>

                    <input
                      type="text"
                      placeholder="Satıcı Adı"
                      value={sellerName}
                      onChange={(e) => setSellerName(e.target.value)}
                      className="p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                    />

                    <input
                      type="number"
                      placeholder="Toplam Fiyat (€)*"
                      value={totalPrice || ""}
                      onChange={(e) => setTotalPrice(Number(e.target.value))}
                      className="p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                      required
                    />
                  </div>
                </div>

                {/* Ödeme ve Araç Bilgileri */}
                <div className="space-y-4 col-span-full border-t pt-4">
                  <h3 className="text-lg font-semibold dark:text-white">
                    Araç Alım Bilgileri
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Şasi No"
                      value={chassisNumber}
                      onChange={(e) => setChassisNumber(e.target.value)}
                      className="p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                    />

                    <input
                      type="date"
                      placeholder="Alım Tarihi"
                      value={purchaseDate}
                      onChange={(e) => setPurchaseDate(e.target.value)}
                      className="p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                    />

                    <input
                      type="number"
                      placeholder="Alış Tutarı (€)"
                      value={purchaseAmount || ""}
                      onChange={(e) =>
                        setPurchaseAmount(Number(e.target.value))
                      }
                      className="p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                    />

                    <input
                      type="text"
                      placeholder="Alış Fatura No"
                      value={invoiceNumber}
                      onChange={(e) => setInvoiceNumber(e.target.value)}
                      className="p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="mt-6 w-full bg-gradient-to-r from-green-500 to-blue-500 text-white py-3 rounded-full shadow-lg transition-all duration-300 font-semibold"
              >
                İşlemi Kaydet
              </button>
            </form>

            {/* İşlem Listesi */}
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-100 dark:bg-gray-700">
                  <tr>
                    <th className="p-3 text-left">Araba</th>
                    <th className="p-3 text-left">Şasi No</th>
                    <th className="p-3 text-left">Satış Tarihi</th>
                    <th className="p-3 text-left">Kar Miktarı</th>
                    <th className="p-3 text-left">İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((t) => {
                    const car = cars.find((c) => c.id === t.car_id);
                    const profit = t.total_price - (t.purchase_amount || 0);

                    return (
                      <tr
                        key={t.id}
                        className="border-t dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        <td className="p-3">
                          {car ? `${car.brand} ${car.model}` : "Silinmiş Araç"}
                        </td>
                        <td className="p-3">{t.chassis_number || "-"}</td>
                        <td className="p-3">
                          {new Date(t.start_date).toLocaleDateString()}
                        </td>
                        <td className="p-3 font-semibold text-green-600">
                          €{profit.toLocaleString()}
                        </td>
                        <td className="p-3 space-x-2">
                          <button
                            onClick={() => setSelectedTransaction(t)}
                            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                          >
                            Detayları Göster
                          </button>
                          <button
                            onClick={() => handleDeleteTransaction(t.id)}
                            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                          >
                            Sil
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {/* Detay Popup */}
            {selectedTransaction && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-2xl font-bold dark:text-white">
                      İşlem Detayları
                    </h3>
                    <button
                      onClick={() => setSelectedTransaction(null)}
                      className="text-gray-500 hover:text-gray-700 dark:text-gray-300"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Müşteri Bilgileri */}
                    <div className="space-y-2">
                      <DetailItem
                        label="Müşteri Adı"
                        value={selectedTransaction.customer_fullname}
                      />
                      <DetailItem
                        label="Telefon"
                        value={selectedTransaction.phone_number}
                      />
                      <DetailItem
                        label="Ödeme Şekli"
                        value={selectedTransaction.payment_method}
                      />
                    </div>

                    {/* Araç Bilgileri */}
                    <div className="space-y-2">
                      <DetailItem
                        label="Şasi No"
                        value={selectedTransaction.chassis_number || ""}
                      />
                      <DetailItem
                        label="Satıcı"
                        value={selectedTransaction.seller_name || ""}
                      />
                      <DetailItem
                        label="Alış Tarihi"
                        value={
                          selectedTransaction.purchase_date
                            ? new Date(
                                selectedTransaction.purchase_date
                              ).toLocaleDateString()
                            : "-"
                        }
                      />
                    </div>

                    {/* Finansal Bilgiler */}
                    <div className="space-y-2">
                      <DetailItem
                        label="Alış Tutarı"
                        value={
                          selectedTransaction.purchase_amount
                            ? `€${selectedTransaction.purchase_amount.toLocaleString()}`
                            : "-"
                        }
                      />
                      <DetailItem
                        label="Satış Tutarı"
                        value={`€${selectedTransaction.total_price.toLocaleString()}`}
                      />
                      <DetailItem
                        label="Kar Miktarı"
                        value={`€${(
                          selectedTransaction.total_price -
                          (selectedTransaction.purchase_amount || 0)
                        ).toLocaleString()}`}
                        className="text-green-500 font-semibold"
                      />
                    </div>

                    {/* Diğer Bilgiler */}
                    <div className="space-y-2">
                      <DetailItem
                        label="İşlem Tarihi"
                        value={new Date(
                          selectedTransaction.start_date
                        ).toLocaleDateString()}
                      />
                      {selectedTransaction.transaction_type === "rental" && (
                        <DetailItem
                          label="Bitiş Tarihi"
                          value={
                            selectedTransaction.end_date
                              ? new Date(
                                  selectedTransaction.end_date
                                ).toLocaleDateString()
                              : "-"
                          }
                        />
                      )}
                      <DetailItem
                        label="Fatura No"
                        value={selectedTransaction.invoice_number || ""}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      <div className="mt-7 max-w-7xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-blue-500">
          Admin Dashboard
        </h1>

        {/* Add Car Form */}
        <form
          onSubmit={handleAddCar}
          className="bg-gray-50 dark:bg-gray-800 p-8 rounded-xl mb-8 shadow-lg border border-gray-200 dark:border-gray-700"
        >
          <div className="grid md:grid-cols-2 gap-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <div className="space-y-4 border-b border-gray-300 dark:border-gray-600 pb-4">
                <h2 className="text-xl font-bold dark:text-white">
                  Vehicle Information
                </h2>
                <input
                  type="text"
                  placeholder="Brand*"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
                <input
                  type="text"
                  placeholder="Model*"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
                <input
                  type="text"
                  placeholder="Color*"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
                <select
                  value={doors}
                  onChange={(e) => setDoors(Number(e.target.value))}
                  className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                  required
                >
                  <option value={2}>2 Doors</option>
                  <option value={3}>3 Doors</option>
                  <option value={4}>4 Doors</option>
                  <option value={5}>5 Doors</option>
                </select>
                <select
                  value={listingType}
                  onChange={(e) =>
                    setListingType(
                      e.target.value as "sale" | "rental" | "reserved" | "sold"
                    )
                  }
                  className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                  required
                >
                  <option value="sale">For Sale</option>
                  <option value="rental">For Rent</option>
                  <option value="reserved">Reserved</option>
                  <option value="sold">Sold</option>
                </select>
                <select
                  value={bodyType}
                  onChange={(e) => setBodyType(e.target.value)}
                  className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                  required
                >
                  <option value="">Select Body Type</option>
                  {bodyTypeOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <input
                  type="date"
                  placeholder="Manufacture Date*"
                  value={manufactureDate}
                  onChange={(e) => setManufactureDate(e.target.value)}
                  className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
                <textarea
                  placeholder="Detailed Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 h-32 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              {/* Specifications */}
              <div className="space-y-4">
                <h2 className="text-xl font-bold dark:text-white">
                  Technical Details
                </h2>
                <div className="grid grid-cols-2 gap-4 border-b border-gray-300 dark:border-gray-600 pb-4">
                  <input
                    type="number"
                    placeholder="Price (€)*"
                    value={price || ""}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                    required
                  />
                  <input
                    type="number"
                    placeholder="Mileage (km)"
                    value={mileage || ""}
                    onChange={(e) => setMileage(Number(e.target.value))}
                    className="p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                  />
                  <select
                    value={transmission}
                    onChange={(e) => setTransmission(e.target.value)}
                    className="p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                  >
                    <option>Automatic</option>
                    <option>Manual</option>
                  </select>
                  <select
                    value={fuelType}
                    onChange={(e) => setFuelType(e.target.value)}
                    className="p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                  >
                    <option>Petrol</option>
                    <option>Diesel</option>
                    <option>Electric</option>
                    <option>Hybrid</option>
                  </select>
                </div>
                {/* Photos */}
                <div className="space-y-4">
                  <h2 className="text-xl font-bold dark:text-white">Photos</h2>
                  <input
                    type="file"
                    multiple
                    onChange={handleFileSelect}
                    className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                    accept="image/*"
                  />
                  <button
                    type="button"
                    onClick={() => handleFileUpload()}
                    disabled={uploading || !selectedFiles.length}
                    className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white p-3 rounded-full transition-all duration-300 disabled:opacity-50"
                  >
                    {uploading
                      ? "Uploading..."
                      : `Upload ${selectedFiles.length} Photos`}
                  </button>
                  <div className="flex flex-wrap gap-2">
                    {uploadedUrls.map((url) => (
                      <div key={url} className="relative">
                        <Image
                          height={96}
                          width={96}
                          src={url}
                          className="w-24 h-24 object-cover rounded border"
                          alt="Uploaded"
                        />
                        <button
                          type="button"
                          onClick={() => handleDeletePhoto(url)}
                          className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 text-xs"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold dark:text-white">Features</h2>
              {Object.entries(featureOptions).map(([category, features]) => (
                <div
                  key={category}
                  className="mb-4 border-b border-gray-300 dark:border-gray-600 pb-4"
                >
                  <h3 className="font-semibold mb-4 capitalize text-gray-700 dark:text-gray-300">
                    {category}:
                  </h3>

                  {/* Check All / Uncheck All buttons */}
                  <div className="flex justify-between mb-3">
                    <button
                      type="button" // type="button" eklenmeli
                      onClick={(e) => {
                        e.preventDefault(); // Submit'i engelle
                        handleCheckAll(category, true);
                      }}
                      className="text-blue-600 dark:text-blue-400 text-sm"
                    >
                      Check All
                    </button>
                    <button
                      type="button" // type="button" eklenmeli
                      onClick={(e) => {
                        e.preventDefault(); // Submit'i engelle
                        handleCheckAll(category, false);
                      }}
                      className="text-blue-600 dark:text-blue-400 text-sm"
                    >
                      Uncheck All
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {features.map((feature) => (
                      <label
                        key={feature}
                        className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 text-sm"
                      >
                        <input
                          type="checkbox"
                          checked={
                            selectedFeatures[`${category}-${feature}`] || false
                          }
                          onChange={() =>
                            handleFeatureToggle(category, feature)
                          }
                          className="rounded text-blue-600 dark:bg-gray-700"
                        />
                        <span>{feature}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="mt-6 w-full bg-gradient-to-r from-green-500 to-blue-500 text-white py-3 rounded-full shadow-lg transition-all duration-300 font-semibold"
          >
            Add Vehicle
          </button>
        </form>

        {isEditModalOpen && editingCar && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-6 dark:text-white">
                Aracı Düzenle
              </h2>
              <form onSubmit={handleUpdateCar}>
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Sol Sütun */}
                  <div className="space-y-4">
                    <input
                      type="text"
                      placeholder="Brand*"
                      value={editingCar.brand}
                      onChange={(e) =>
                        setEditingCar({ ...editingCar, brand: e.target.value })
                      }
                      className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Model*"
                      value={editingCar.model}
                      onChange={(e) =>
                        setEditingCar({ ...editingCar, model: e.target.value })
                      }
                      className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                    />
                    <input
                      type="date"
                      value={editingCar.manufactureDate}
                      onChange={(e) => setManufactureDate(e.target.value)}
                      className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                    />
                    <select
                      value={editingCar.doors}
                      onChange={(e) =>
                        setEditingCar({
                          ...editingCar,
                          doors: Number(e.target.value),
                        })
                      }
                      className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                      required
                    >
                      <option value={2}>2 Doors</option>
                      <option value={3}>3 Doors</option>
                      <option value={4}>4 Doors</option>
                      <option value={5}>5 Doors</option>
                    </select>
                    <select
                      value={editingCar.body_type}
                      onChange={(e) =>
                        setEditingCar({
                          ...editingCar,
                          body_type: e.target.value,
                        })
                      }
                      className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                      required
                    >
                      {bodyTypeOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                    <textarea
                      placeholder="Detailed Description*"
                      value={editingCar.description}
                      onChange={(e) =>
                        setEditingCar({
                          ...editingCar,
                          description: e.target.value,
                        })
                      }
                      className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 h-32 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <input
                      type="number"
                      placeholder="Price (€)*"
                      value={editingCar.price || ""}
                      onChange={(e) =>
                        setEditingCar({
                          ...editingCar,
                          price: Number(e.target.value),
                        })
                      }
                      className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                      required
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        type="number"
                        placeholder="Mileage (km)"
                        value={editingCar.mileage || ""}
                        onChange={(e) =>
                          setEditingCar({
                            ...editingCar,
                            mileage: Number(e.target.value),
                          })
                        }
                        className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                      />
                      <select
                        value={editingCar.transmission}
                        onChange={(e) =>
                          setEditingCar({
                            ...editingCar,
                            transmission: e.target.value,
                          })
                        }
                        className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                      >
                        <option>Automatic</option>
                        <option>Manual</option>
                      </select>
                      <select
                        value={editingCar.fuel_type}
                        onChange={(e) =>
                          setEditingCar({
                            ...editingCar,
                            fuel_type: e.target.value,
                          })
                        }
                        className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                      >
                        <option>Petrol</option>
                        <option>Diesel</option>
                        <option>Electric</option>
                        <option>Hybrid</option>
                      </select>
                      <input
                        type="text"
                        placeholder="Color*"
                        value={editingCar.color}
                        onChange={(e) =>
                          setEditingCar({
                            ...editingCar,
                            color: e.target.value,
                          })
                        }
                        className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                        required
                      />
                    </div>

                    {/* Fotoğraflar */}
                    <div className="space-y-4">
                      <h2 className="text-xl font-bold dark:text-white">
                        Photos
                      </h2>
                      <input
                        type="file"
                        multiple
                        onChange={handleFileSelect}
                        className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                        accept="image/*"
                      />
                      <button
                        type="button"
                        onClick={() => handleFileUpload(true)}
                        disabled={uploading || !selectedFiles.length}
                        className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white p-3 rounded-full transition-all duration-300 disabled:opacity-50"
                      >
                        {uploading
                          ? "Uploading..."
                          : `Upload ${selectedFiles.length} Photos`}
                      </button>
                      <div className="flex flex-wrap gap-2">
                        {editingCar.photos?.map((url) => (
                          <div key={url} className="relative">
                            <Image
                              height={96}
                              width={96}
                              src={url}
                              className="w-24 h-24 object-cover rounded border"
                              alt="Uploaded"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setEditingCar({
                                  ...editingCar,
                                  photos: editingCar.photos.filter(
                                    (photo) => photo !== url
                                  ),
                                });
                              }}
                              className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 text-xs"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Sağ Sütun */}
                  {/* Özellikler */}
                  <div className="space-y-4">
                    <div className="space-y-4">
                      {Object.entries(featureOptions).map(
                        ([category, features]) => (
                          <div
                            key={category}
                            className="mb-4 border-b border-gray-300 dark:border-gray-600 pb-4"
                          >
                            <h3 className="font-semibold mb-2 capitalize">
                              {category}
                            </h3>

                            {/* Check All / Uncheck All buttons */}
                            <div className="flex justify-between mb-2">
                              <button
                                type="button" // type="button" eklenmeli
                                onClick={(e) => {
                                  e.preventDefault(); // Submit'i engelle
                                  handleEditCheckAll(category, true);
                                }}
                                className="text-blue-600 dark:text-blue-400 text-sm"
                              >
                                Check All
                              </button>
                              <button
                                type="button" // type="button" eklenmeli
                                onClick={(e) => {
                                  e.preventDefault(); // Submit'i engelle
                                  handleEditCheckAll(category, false);
                                }}
                                className="text-blue-600 dark:text-blue-400 text-sm"
                              >
                                Uncheck All
                              </button>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              {features.map((feature) => (
                                <label
                                  key={feature}
                                  className="flex items-center space-x-2"
                                >
                                  <input
                                    type="checkbox"
                                    checked={
                                      editingCar.features?.[category]?.includes(
                                        feature
                                      ) || false
                                    }
                                    onChange={() =>
                                      handleEditFeatureToggle(category, feature)
                                    }
                                    className="rounded text-blue-600"
                                  />
                                  <span>{feature}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </div>
                <div className="mt-6 flex gap-4 justify-end">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                  >
                    Değişiklikleri Kaydet
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Car List */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-x-auto border border-gray-200 dark:border-gray-700">
          <table className="min-w-full">
            <thead className="bg-gray-100 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-4 text-left dark:text-white">Brand</th>
                <th className="px-6 py-4 text-left dark:text-white">Model</th>
                <th className="px-6 py-4 text-left dark:text-white">Color</th>
                <th className="px-6 py-4 text-left dark:text-white">Doors</th>
                <th className="px-6 py-4 text-left dark:text-white">
                  Body Type
                </th>
                <th className="px-6 py-4 text-left dark:text-white">Price</th>
                <th className="px-6 py-4 text-left dark:text-white">
                  Listing Type
                </th>
                <th className="px-6 py-4 text-left dark:text-white">Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayedCars.map((car) => (
                <tr
                  key={car.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <td className="px-6 py-4 dark:text-white">{car.brand}</td>
                  <td className="px-6 py-4 dark:text-white">{car.model}</td>
                  <td className="px-6 py-4 dark:text-white">{car.color}</td>
                  <td className="px-6 py-4 dark:text-white">{car.doors}</td>
                  <td className="px-6 py-4 dark:text-white">{car.body_type}</td>
                  <td className="px-6 py-4 dark:text-white">
                    €{car.price?.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 dark:text-white">
                    <select
                      value={car.listing_type}
                      onChange={(e) =>
                        updateListingType(
                          car.id,
                          e.target.value as
                            | "sale"
                            | "rental"
                            | "reserved"
                            | "sold"
                        )
                      }
                      className="bg-gray-100 dark:bg-gray-700 p-2 rounded"
                    >
                      <option value="sale">For Sale</option>
                      <option value="rental">For Rent</option>
                      <option value="reserved">Reserved</option>
                      <option value="sold">Sold</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 space-x-2">
                    <button
                      onClick={() => {
                        setEditingCar(car);
                        setIsEditModalOpen(true);
                      }}
                      className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => toggleVisibility(car.id, car.is_hidden)}
                      className="px-3 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors"
                    >
                      {car.is_hidden ? "Show" : "Hide"}
                    </button>
                    <button
                      onClick={() => handleDeleteCar(car.id)}
                      className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Pagination Kontrolleri */}
        <div className="flex justify-center mt-4">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-800 rounded-l disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-800">
            {currentPage} / {totalPages}
          </span>
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-800 rounded-r disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
      <Toaster position="top-right" reverseOrder={false} />
    </div>
  );
}
