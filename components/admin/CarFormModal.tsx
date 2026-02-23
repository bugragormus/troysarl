import { useState, useEffect } from "react";
import { carService } from "@/services/carService";
import Car from "@/types/car";
import toast from "react-hot-toast";
import * as Sentry from "@sentry/react";
import Image from "next/image";
import {
  bodyTypeOptions,
  transmissionOptions,
  doorOptions,
  colorOptions,
  fuelTypeOptions,
  featureOptions,
} from "@/lib/constants";

type CarFormModalProps = {
  isOpen?: boolean;
  onClose?: () => void;
  carToEdit?: Car | null;
  onSuccess: () => void;
  inline?: boolean;
};

// Cloudinary URL'inden public_id çıkaran yardımcı fonksiyon
const getCloudinaryPublicId = (url: string): string | null => {
  try {
    if (!url.includes("res.cloudinary.com")) return null;
    const parts = url.split("/");
    const uploadIndex = parts.findIndex((p) => p === "upload");
    if (uploadIndex === -1) return null;
    const publicIdWithExt = parts.slice(uploadIndex + 2).join("/"); // versiyon parçasını atla
    return publicIdWithExt.split(".")[0];
  } catch (error) {
    console.error("Cloudinary public_id parse error:", error);
    Sentry.captureException(error);
    return null;
  }
};

export default function CarFormModal({
  isOpen = false,
  onClose = () => {},
  carToEdit,
  onSuccess,
  inline = false,
}: CarFormModalProps) {
  const isEditing = !!carToEdit;

  // Form States
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [manufactureDate, setManufactureDate] = useState("");
  const [price, setPrice] = useState<number | undefined>(undefined);
  const [mileage, setMileage] = useState<number | undefined>(undefined);
  const [bodyType, setBodyType] = useState<string>(bodyTypeOptions[0]);
  const [color, setColor] = useState<string>(colorOptions[0]);
  const [transmission, setTransmission] = useState<string>(transmissionOptions[0]);
  const [doors, setDoors] = useState<number>(5);
  const [fuelType, setFuelType] = useState<string>(fuelTypeOptions[0]);
  const [listingType, setListingType] = useState<"sale" | "rental" | "reserved" | "sold">("sale");
  const [description, setDescription] = useState("");
  const [isExclusive, setIsExclusive] = useState(false);
  const [selectedFeatures, setSelectedFeatures] = useState<{ [key: string]: boolean }>({});

  // Photo Upload States
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);

  // Initialize form when opened or carToEdit changes
  useEffect(() => {
    if (inline || isOpen) {
      if (carToEdit) {
        setBrand(carToEdit.brand);
        setModel(carToEdit.model);
        setManufactureDate(carToEdit.year);
        setPrice(carToEdit.price);
        setMileage(carToEdit.mileage || undefined);
        setBodyType(carToEdit.body_type);
        setColor(carToEdit.color);
        setTransmission(carToEdit.transmission);
        setDoors(carToEdit.doors || 5);
        setFuelType(carToEdit.fuel_type);
        setListingType(carToEdit.listing_type);
        setDescription(carToEdit.description || "");
        setIsExclusive(carToEdit.is_exclusive || false);
        setUploadedUrls(carToEdit.photos || []);

        const initialFeatures: { [key: string]: boolean } = {};
        if (carToEdit.features) {
          Object.entries(carToEdit.features).forEach(([category, features]) => {
            if (Array.isArray(features)) {
              features.forEach((feature) => {
                initialFeatures[`${category}-${feature}`] = true;
              });
            }
          });
        }
        setSelectedFeatures(initialFeatures);
      } else {
        // Reset form for Add
        setBrand("");
        setModel("");
        setManufactureDate("");
        setPrice(undefined);
        setMileage(undefined);
        setBodyType(bodyTypeOptions[0]);
        setColor(colorOptions[0]);
        setTransmission(transmissionOptions[0]);
        setDoors(5);
        setFuelType(fuelTypeOptions[0]);
        setListingType("sale");
        setDescription("");
        setIsExclusive(false);
        setUploadedUrls([]);
        setSelectedFeatures({});
      }
      setSelectedFiles([]);
      setUploading(false);
    }
  }, [isOpen, carToEdit, inline]);

  if (!inline && !isOpen) return null;

  // File Handling
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  const handleFileUpload = async () => {
    if (selectedFiles.length === 0) return;
    setUploading(true);
    let successfulUploads = 0;

    try {
      const newUrls: string[] = [];

      for (const file of selectedFiles) {
        // Dosyayı base64'e çevir ve Cloudinary API'ye gönder (Eski Dashboard'daki çalışan mantık)
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        try {
          const res = await fetch("/api/upload-image", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ data: base64, filename: file.name }),
          });

          if (!res.ok) {
            const errorText = await res.json();
            throw new Error(errorText.error || "Upload failed");
          }

          const data = await res.json();

          if (data.url) {
            // URL'i optimize et (kaliteyi düşür ve formatı avif/webp yap)
            let optimizedUrl = data.url;
            if (optimizedUrl.includes("/upload/")) {
              optimizedUrl = optimizedUrl.replace(
                "/upload/",
                "/upload/q_auto,f_auto/"
              );
            }
            newUrls.push(optimizedUrl);
            successfulUploads++;
          }
        } catch (error) {
          console.error("Single file upload error:", error);
          toast.error(`${file.name} yüklenemedi`);
        }
      }

      if (successfulUploads > 0) {
        setUploadedUrls((prev) => [...prev, ...newUrls]);
        toast.success(
          `${successfulUploads} fotoğraf Cloudinary'ye başarıyla yüklendi!`
        );
        setSelectedFiles([]);
      }
    } catch (error) {
      console.error("Upload error:", error);
      Sentry.captureException(error);
      toast.error("Fotoğraf yükleme sırasında bir hata oluştu.");
    } finally {
      setUploading(false);
    }
  };

  const handleDeletePhoto = async (url: string) => {
    if (!confirm("Are you sure you want to delete this photo?")) return;

    if (url.includes("res.cloudinary.com")) {
      const publicId = getCloudinaryPublicId(url);
      if (publicId) {
        try {
          const res = await fetch("/api/delete-image", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ publicId }),
          });

          if (!res.ok) {
            const data = await res.json();
            throw new Error(data.error || "Failed to delete from Cloudinary");
          }
        } catch (error) {
          console.error("Cloudinary delete error:", error);
          Sentry.captureException(error);
          toast.error("Fotoğraf Cloudinary'den silinemedi.");
          return; // Hata varsa state'den silme
        }
      }
    } else {
      // Eski Supabase fotoğrafı sil
      toast.error("Cloudinary'de olmayan eski Supabase fotoğraflarını sadece araç silinirken kaldırılabilir. Şimdilik listeden kaldırıldı.");
    }

    setUploadedUrls((prev) => prev.filter((u) => u !== url));
  };

  // Feature Selection
  const handleFeatureToggle = (category: string, feature: string) => {
    setSelectedFeatures((prev) => ({
      ...prev,
      [`${category}-${feature}`]: !prev[`${category}-${feature}`],
    }));
  };

  const handleCheckAll = (category: string, checkAll: boolean) => {
    const updatedFeatures = { ...selectedFeatures };
    featureOptions[category].forEach((feature) => {
      updatedFeatures[`${category}-${feature}`] = checkAll;
    });
    setSelectedFeatures(updatedFeatures);
  };

  // Submit Logic
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!brand || !model || !manufactureDate || !price || uploadedUrls.length === 0) {
      toast.error("Lütfen tüm zorunlu alanları (*) doldurun ve en az 1 fotoğraf yükleyin.");
      return;
    }

    const compiledFeatures = {
      safety: Object.keys(selectedFeatures)
        .filter((key) => key.startsWith("safety-") && selectedFeatures[key])
        .map((key) => key.replace("safety-", "")),
      comfort: Object.keys(selectedFeatures)
        .filter((key) => key.startsWith("comfort-") && selectedFeatures[key])
        .map((key) => key.replace("comfort-", "")),
      entertainment: Object.keys(selectedFeatures)
        .filter((key) => key.startsWith("entertainment-") && selectedFeatures[key])
        .map((key) => key.replace("entertainment-", "")),
    };

    try {
      if (isEditing && carToEdit) {
        // Edit Logic
        const deletedPhotos = carToEdit.photos.filter((photo) => !uploadedUrls.includes(photo));

        if (deletedPhotos.length > 0) {
          const cloudinaryPhotos = deletedPhotos.filter((url) => url.includes("res.cloudinary.com"));
          const supabasePhotos = deletedPhotos.filter((url) => !url.includes("res.cloudinary.com"));

          await Promise.all(
            cloudinaryPhotos.map(async (url) => {
              const publicId = getCloudinaryPublicId(url);
              if (!publicId) return;
              await fetch("/api/delete-image", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ publicId }),
              });
            })
          );

          if (supabasePhotos.length > 0) {
            const filePaths = supabasePhotos
              .map((url) => {
                try {
                  const parsedUrl = new URL(url);
                  const fullPath = decodeURIComponent(parsedUrl.pathname);
                  const pathSegments = fullPath.split("/car-photos/");
                  return pathSegments[1] || null;
                } catch (error) {
                  return null;
                }
              })
              .filter(Boolean) as string[];

            if (filePaths.length > 0) {
              // Not deleting old supabase storage photos here for simplicity since 
              // we don't have the supabase client here anymore. Handled during car deletion.
            }
          }
        }

        await carService.updateCar(carToEdit.id, {
          brand,
          model,
          year: manufactureDate,
          price: Number(price),
          mileage: mileage ? Number(mileage) : undefined,
          body_type: bodyType,
          color,
          transmission,
          doors: Number(doors),
          fuel_type: fuelType,
          listing_type: listingType as any,
          description,
          is_exclusive: isExclusive,
          photos: uploadedUrls,
          features: compiledFeatures as any,
        });

        toast.success("Araç başarıyla güncellendi!");
      } else {
        // Add Logic
        await carService.createCar({
          brand,
          model,
          year: manufactureDate,
          price: Number(price),
          mileage: mileage ? Number(mileage) : undefined,
          body_type: bodyType,
          color,
          transmission,
          doors: Number(doors),
          fuel_type: fuelType,
          listing_type: listingType as any,
          description,
          is_exclusive: isExclusive,
          photos: uploadedUrls,
          features: compiledFeatures as any,
        });

        toast.success("Araç başarıyla eklendi!");

        // If inline, reset form contents
        if (inline) {
          setBrand("");
          setModel("");
          setManufactureDate("");
          setPrice(undefined);
          setMileage(undefined);
          setBodyType(bodyTypeOptions[0]);
          setColor(colorOptions[0]);
          setTransmission(transmissionOptions[0]);
          setDoors(5);
          setFuelType(fuelTypeOptions[0]);
          setListingType("sale");
          setDescription("");
          setIsExclusive(false);
          setUploadedUrls([]);
          setSelectedFeatures({});
          setSelectedFiles([]);
        }
      }

      onSuccess();
      if (!inline) onClose();
    } catch (error: any) {
      toast.error(`Kayıt hatası: ${error.message}`);
      Sentry.captureException(error);
    }
  };

  const formContent = (
    <div className={inline ? "bg-gray-50 dark:bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700" : "bg-white dark:bg-gray-800 rounded-xl w-full max-w-5xl max-h-[90vh] overflow-y-auto relative"}>
      {!inline && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}

      <div className={inline ? "" : "p-8"}>
        <h2 className={inline ? "text-xl font-bold mb-6 dark:text-white" : "text-2xl font-bold mb-6 text-gray-800 dark:text-white"}>
          {isEditing ? "Araç Düzenle" : "YENİ ARAÇ EKLE"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="Marka*"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="p-3 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
              <input
                type="text"
                placeholder="Model*"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="p-3 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
              <input
                type="date"
                placeholder="Yıl*"
                value={manufactureDate}
                onChange={(e) => setManufactureDate(e.target.value)}
                className="p-3 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
              <input
                type="number"
                placeholder="Fiyat (€)*"
                value={price || ""}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="p-3 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
              <input
                type="number"
                placeholder="Kilometre"
                value={mileage || ""}
                onChange={(e) => setMileage(Number(e.target.value))}
                className="p-3 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
              <select
                value={bodyType}
                onChange={(e) => setBodyType(e.target.value)}
                className="p-3 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                {bodyTypeOptions.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
              <select
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="p-3 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                {colorOptions.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
              <select
                value={transmission}
                onChange={(e) => setTransmission(e.target.value)}
                className="p-3 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                {transmissionOptions.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
              <select
                value={doors.toString()}
                onChange={(e) => setDoors(Number(e.target.value))}
                className="p-3 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                {doorOptions.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
              <select
                value={fuelType}
                onChange={(e) => setFuelType(e.target.value)}
                className="p-3 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                {fuelTypeOptions.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
              <select
                value={listingType}
                onChange={(e) =>
                  setListingType(e.target.value as "sale" | "rental" | "reserved" | "sold")
                }
                className="p-3 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="sale">Sale</option>
                <option value="rental">Rental</option>
                <option value="reserved">Reserved</option>
                <option value="sold">Sold</option>
              </select>

              <div className="flex items-center space-x-3 p-3 border rounded dark:bg-gray-700 dark:border-gray-600">
                <input
                  type="checkbox"
                  id="exclusiveCar"
                  checked={isExclusive}
                  onChange={(e) => setIsExclusive(e.target.checked)}
                  className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 bg-white dark:bg-gray-800 dark:border-gray-600"
                />
                <label htmlFor="exclusiveCar" className="text-gray-700 dark:text-gray-200 font-medium cursor-pointer">
                  Exclusive Car (Show "Contact Us", Hide Price)
                </label>
              </div>
            </div>

            <textarea
              placeholder="Description (Optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white h-32"
            />

            {/* Cloudinary Upload Section */}
            <div className="border border-gray-200 dark:border-gray-700 p-6 rounded-xl bg-gray-50 dark:bg-gray-800">
              <h3 className="font-bold mb-4 dark:text-white">Fotoğraflar* (Cloudinary CDN)</h3>
              
              <div className="flex flex-col md:flex-row items-center gap-4 mb-4">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100 dark:file:bg-blue-900 dark:file:text-blue-200"
                />
                
                <button
                  type="button"
                  onClick={handleFileUpload}
                  disabled={uploading || selectedFiles.length === 0}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-full transition-colors whitespace-nowrap"
                >
                  {uploading ? "Yükleniyor..." : `Seçilenleri Yükle (${selectedFiles.length})`}
                </button>
              </div>

              {/* Ture Yüklenen Fotoğraflar Önizleme */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                {uploadedUrls.map((url, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={url}
                      alt={`Upload ${index}`}
                      className="w-full h-32 object-cover rounded-lg border-2 border-gray-200 dark:border-gray-600"
                    />
                    <button
                      type="button"
                      onClick={() => handleDeletePhoto(url)}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-md"
                      title="Fotoğrafı Sil"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Features Categories */}
            <div className="space-y-6">
              <h3 className="font-bold text-xl border-b pb-2 dark:text-gray-200 dark:border-gray-700">Araç Donanımları</h3>
              {Object.keys(featureOptions).map((category) => (
                <div key={category} className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-semibold capitalize text-lg dark:text-gray-300 text-blue-600 dark:text-blue-400">
                      {category} Özellikleri
                    </h4>
                    <button
                      type="button"
                      onClick={() => {
                        const allChecked = featureOptions[category].every(
                          (feature) => selectedFeatures[`${category}-${feature}`]
                        );
                        handleCheckAll(category, !allChecked);
                      }}
                      className="text-sm bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 px-3 py-1 rounded text-gray-800 dark:text-gray-200 transition-colors"
                    >
                      Tümünü Seç/Kaldır
                    </button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {featureOptions[category].map((feature) => (
                      <label key={feature} className="flex items-center space-x-2 p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={!!selectedFeatures[`${category}-${feature}`]}
                          onChange={() => handleFeatureToggle(category, feature)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">
                          {feature}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-6 border-t dark:border-gray-700 flex justify-end gap-4">
              {!inline && (
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded shadow-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  İptal
                </button>
              )}
              <button
                type="submit"
                className={inline ? "mt-6 w-[200px] bg-gradient-to-r from-green-500 to-blue-500 text-white py-3 rounded-full shadow-lg transition-all duration-300 font-semibold" : "px-8 py-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white rounded shadow-md font-medium"}
              >
                {isEditing ? "Değişiklikleri Kaydet" : "Aracı Sisteme Ekle"}
              </button>
            </div>
          </form>
        </div>
      </div>
  );

  if (inline) {
    return formContent;
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      {formContent}
    </div>
  );
}
