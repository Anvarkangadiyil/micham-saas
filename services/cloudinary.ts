import { promises as fs } from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

/**
 * Uploads a receipt file.
 * If Cloudinary environment variables are set (CLOUDINARY_CLOUD_NAME & CLOUDINARY_UPLOAD_PRESET),
 * it uploads to Cloudinary via REST API. Otherwise, it falls back to writing the file to public/uploads/.
 */
export async function uploadReceipt(file: File): Promise<string> {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET;

  if (cloudName && uploadPreset) {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const base64 = buffer.toString("base64");
      const dataUrl = `data:${file.type};base64,${base64}`;

      const formData = new FormData();
      formData.append("file", dataUrl);
      formData.append("upload_preset", uploadPreset);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.secure_url) {
          return data.secure_url;
        }
      }
      console.warn("Cloudinary upload response was not OK, trying local fallback.");
    } catch (error) {
      console.warn("Cloudinary upload error, falling back to local:", error);
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
