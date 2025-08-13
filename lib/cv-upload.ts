import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary using CLOUDINARY_URL
if (process.env.CLOUDINARY_URL) {
  cloudinary.config({
    cloudinary_url: process.env.CLOUDINARY_URL
  });
} else {
  // Fallback to individual environment variables
  cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

export async function uploadCV(file: File): Promise<string> {
  try {
    // Convert file to base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString('base64');
    const dataURI = `data:${file.type};base64,${base64}`;

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: 'andishi/dev_cvs',
      resource_type: 'raw',
      allowed_formats: ['pdf', 'doc', 'docx', 'txt'],
      use_filename: true,
      unique_filename: false
    });

    return result.secure_url;
  } catch (error) {
    console.error('Cloudinary CV upload error:', error);
    throw new Error('Failed to upload CV to Cloudinary');
  }
}
