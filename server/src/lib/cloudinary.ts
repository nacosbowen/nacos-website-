import { v2 as cloudinary } from 'cloudinary';

// Uploads an in-memory image to Cloudinary and returns its permanent https URL.
// Config is set inside the function so it reads the env vars after they are loaded.
export function uploadImageBuffer(buffer: Buffer, folder: string): Promise<string> {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image' },
      (error, result) => {
        if (error || !result) return reject(error ?? new Error('Upload failed'));
        resolve(result.secure_url);
      }
    );
    stream.end(buffer);
  });
}