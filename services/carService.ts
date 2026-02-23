import { supabase } from "@/lib/supabaseClient";
import Car from "@/types/car";

// Helper for extracting Cloudinary public_id
const getCloudinaryPublicId = (url: string): string | null => {
  try {
    if (!url.includes("res.cloudinary.com")) return null;
    const parts = url.split("/");
    const uploadIndex = parts.findIndex((p) => p === "upload");
    if (uploadIndex === -1) return null;
    const publicIdWithExt = parts.slice(uploadIndex + 2).join("/");
    return publicIdWithExt.split(".")[0];
  } catch (error) {
    console.error("Cloudinary public_id parse error:", error);
    return null;
  }
};

export const carService = {
  /**
   * Fetch all cars, optionally filtering out hidden ones
   */
  async getCars(includeHidden = true): Promise<Car[]> {
    let query = supabase.from("cars").select("*").order("created_at", { ascending: false });
    
    if (!includeHidden) {
      query = query.eq("is_hidden", false);
    }

    const { data, error } = await query;
    if (error) throw error;
    
    return data as Car[];
  },

  /**
   * Add a new car
   */
  async createCar(carData: Partial<Car>): Promise<Car> {
    const { data, error } = await supabase
      .from("cars")
      .insert([carData])
      .select()
      .single();

    if (error) throw error;
    return data as Car;
  },

  /**
   * Update an existing car
   */
  async updateCar(id: string, carData: Partial<Car>): Promise<Car> {
    const { data, error } = await supabase
      .from("cars")
      .update(carData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data as Car;
  },

  /**
   * Delete a car and all its associated photos
   */
  async deleteCar(id: string, photos?: string[]): Promise<void> {
    if (photos && photos.length > 0) {
      const cloudinaryPhotos = photos.filter((url) =>
        url.includes("res.cloudinary.com")
      );
      const supabasePhotos = photos.filter(
        (url) => !url.includes("res.cloudinary.com")
      );

      // Delete Cloudinary photos via API
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

      // Delete old Supabase storage photos
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
          const { error } = await supabase.storage
            .from("car-photos")
            .remove(filePaths);
          if (error) console.error("Supabase storage delete error:", error);
        }
      }
    }

    const { error } = await supabase.from("cars").delete().eq("id", id);
    if (error) throw error;
  },

  /**
   * Toggle the visibility (is_hidden) of a car
   */
  async toggleVisibility(id: string, currentIsHidden: boolean): Promise<void> {
    const { error } = await supabase
      .from("cars")
      .update({ is_hidden: !currentIsHidden })
      .eq("id", id);

    if (error) throw error;
  },

  /**
   * Update the listing type of a car
   */
  async updateListingType(id: string, newType: Car["listing_type"]): Promise<void> {
    const { error } = await supabase
      .from("cars")
      .update({ listing_type: newType })
      .eq("id", id);

    if (error) throw error;
  }
};
