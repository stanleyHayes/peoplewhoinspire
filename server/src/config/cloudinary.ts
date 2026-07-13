import { v2 as cloudinary } from 'cloudinary';

let configured = false;

/** True when all three Cloudinary credentials are present in the environment. */
export function cloudinaryConfigured(): boolean {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
  );
}

// Configured lazily (on first upload) so it reads env vars AFTER dotenv.config()
// has run — route imports are evaluated before dotenv loads in index.ts.
function ensureConfigured(): void {
  if (configured) return;
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
  configured = true;
}

/** Streams an in-memory file buffer to Cloudinary and resolves with the hosted URL. */
export function uploadBufferToCloudinary(
  buffer: Buffer,
  folder = 'peoplewhoinspire'
): Promise<{ url: string; publicId: string }> {
  ensureConfigured();
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image' },
      (error, result) => {
        if (error || !result) {
          reject(error || new Error('Cloudinary upload failed'));
          return;
        }
        resolve({ url: result.secure_url, publicId: result.public_id });
      }
    );
    stream.end(buffer);
  });
}

export default cloudinary;
