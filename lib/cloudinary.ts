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

export async function uploadImage(file: File): Promise<string> {
  try {
    // Convert file to base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString('base64');
    const dataURI = `data:${file.type};base64,${base64}`;

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: 'andishi/blog_images',
      resource_type: 'image',
      transformation: [
        { width: 1200, height: 630, crop: 'fill', quality: 'auto', fetch_format: 'auto' }
      ]
    });

    return result.secure_url;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error('Failed to upload image to Cloudinary');
  }
}

export async function uploadAuthorImage(file: File): Promise<string> {
  try {
    // Convert file to base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString('base64');
    const dataURI = `data:${file.type};base64,${base64}`;

    // Upload to Cloudinary with different transformation for author images
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: 'andishi/blog_authors',
      resource_type: 'image',
      transformation: [
        { width: 100, height: 100, crop: 'fill', quality: 'auto', fetch_format: 'auto' }
      ]
    });

    return result.secure_url;
  } catch (error) {
    console.error('Cloudinary author image upload error:', error);
    throw new Error('Failed to upload author image to Cloudinary');
  }
}
