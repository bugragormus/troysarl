import { NextApiRequest, NextApiResponse } from "next";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "20mb",
    },
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { data, filename } = req.body;

  if (!data) {
    return res.status(400).json({ error: "No image data provided" });
  }

  try {
    const result = await cloudinary.uploader.upload(data, {
      folder: "car-photos",
      public_id: `${Date.now()}_${filename?.replace(/\.[^/.]+$/, "") || "photo"}`,
      overwrite: false,
      resource_type: "image",
    });

    return res.status(200).json({
      url: result.secure_url,
      publicId: result.public_id,
    });
  } catch (error: unknown) {
    console.error("Cloudinary upload error:", error);
    const message = error instanceof Error ? error.message : "Upload failed";
    return res.status(500).json({ error: message });
  }
}
