import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { uploadImage, uploadAuthorImage } from '@/lib/cloudinary';

// Configure Cloudinary
if (process.env.CLOUDINARY_URL) {
  cloudinary.config({
    cloudinary_url: process.env.CLOUDINARY_URL
  });
}

export async function POST(request: NextRequest) {
  try {
    // Get form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string;

    if (!file) {
      return NextResponse.json(
        { success: false, message: 'No file provided' },
        { status: 400 }
      );
    }

    // Upload to Cloudinary based on type
    let imageUrl: string;
    if (type === 'author') {
      imageUrl = await uploadAuthorImage(file);
    } else {
      imageUrl = await uploadImage(file);
    }

    return NextResponse.json({
      success: true,
      url: imageUrl
    });
  } catch (error) {
    console.error('Image upload error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to upload image' },
      { status: 500 }
    );
  }
}

// Disable bodyParser for file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};
