import { promises as fs } from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

/**
 * Uploads a receipt file.
 * If Cloudinary environment variables are set (CLOUDINARY_CLOUD_NAME & CLOUDINARY_UPLOAD_PRESET),
 * it uploads to Cloudinary via REST API. Otherwise, it falls back to writing the file to public/uploads/.
 */

// lib/cloudinary.ts
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;

export async function uploadReceipt(file: File): Promise<string> {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
 

 if (cloudName) {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const result = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: "receipts",
          },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        )
        .end(buffer);
    });

    return result.secure_url;
  } catch (error) {
    console.warn("Cloudinary upload failed, using local storage:", error);
  }
}
  // Local storage fallback:
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const uploadDir = path.join(process.cwd(), "public", "uploads");

  // Ensure upload directory exists
  await fs.mkdir(uploadDir, { recursive: true });

  // Generate unique filename to avoid collision
  const fileExtension = path.extname(file.name) || ".jpg";
  const fileName = `${uuidv4()}${fileExtension}`;
  const filePath = path.join(uploadDir, fileName);

  await fs.writeFile(filePath, buffer);

  return `/uploads/${fileName}`;
}
