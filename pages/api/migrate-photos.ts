// pages/api/migrate-photos.ts
// Bu endpoint Supabase Storage'daki mevcut fotoğrafları Cloudinary'e taşır.

import { NextApiRequest, NextApiResponse } from "next";
import { v2 as cloudinary } from "cloudinary";
import { createClient } from "@supabase/supabase-js";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

function isSupabaseUrl(url: string): boolean {
  return url.includes("supabase.co");
}

async function uploadToCloudinary(imageUrl: string): Promise<string> {
  const result = await cloudinary.uploader.upload(imageUrl, {
    folder: "car-photos",
    resource_type: "image",
  });
  return result.secure_url;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Admin authentication via jwt token
  const token = req.cookies.admin_token;
  if (!token) {
    return res.status(401).json({ error: "Unauthorized. Missing admin token." });
  }

  try {
    const jwt = await import("jose");
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    await jwt.jwtVerify(token, secret);
  } catch (error) {
    return res.status(401).json({ error: "Unauthorized. Invalid token." });
  }

  try {
    // Tüm araçları çek
    const { data: cars, error: fetchError } = await supabase
      .from("cars")
      .select("id, photos");

    if (fetchError) throw fetchError;
    if (!cars || cars.length === 0) {
      return res.status(200).json({ message: "No cars found", migrated: 0 });
    }

    let totalMigrated = 0;
    const results: { carId: string; migrated: number; errors: string[] }[] = [];

    for (const car of cars) {
      const photos: string[] = car.photos || [];
      const carResults = { carId: car.id, migrated: 0, errors: [] as string[] };

      // Sadece Supabase URL'lerini taşı
      const supabasePhotos = photos.filter(isSupabaseUrl);
      if (supabasePhotos.length === 0) {
        results.push(carResults);
        continue;
      }

      const newPhotos = [...photos];

      for (let i = 0; i < photos.length; i++) {
        const url = photos[i];
        if (!isSupabaseUrl(url)) continue;

        try {
          const cloudinaryUrl = await uploadToCloudinary(url);
          newPhotos[i] = cloudinaryUrl;
          carResults.migrated++;
          totalMigrated++;
        } catch (err) {
          const msg = err instanceof Error ? err.message : "Unknown error";
          carResults.errors.push(`Photo ${i}: ${msg}`);
          console.error(`Car ${car.id}, photo ${i} error:`, err);
        }
      }

      // Bir araç için en az bir foto başarılıysa güncelle
      if (carResults.migrated > 0) {
        const { error: updateError } = await supabase
          .from("cars")
          .update({ photos: newPhotos })
          .eq("id", car.id);

        if (updateError) {
          carResults.errors.push(`DB update failed: ${updateError.message}`);
        }
      }

      results.push(carResults);
    }

    return res.status(200).json({
      success: true,
      totalMigrated,
      carsProcessed: cars.length,
      results,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Migration failed";
    console.error("Migration error:", error);
    return res.status(500).json({ error: message });
  }
}
