import { NextApiRequest, NextApiResponse } from "next";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { publicId } = req.body;

  if (!publicId) {
    return res.status(400).json({ error: "No publicId provided" });
  }

  try {
    const result = await cloudinary.uploader.destroy(publicId);

    if (result.result !== "ok" && result.result !== "not found") {
      return res.status(500).json({ error: "Failed to delete image" });
    }

    return res.status(200).json({ success: true });
  } catch (error: unknown) {
    console.error("Cloudinary delete error:", error);
    const message = error instanceof Error ? error.message : "Delete failed";
    return res.status(500).json({ error: message });
  }
}
