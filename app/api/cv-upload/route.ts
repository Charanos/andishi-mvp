import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { uploadCV } from '@/lib/cv-upload';

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

    if (!file) {
      return NextResponse.json(
        { success: false, message: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, message: 'Invalid file type. Please upload a PDF, DOC, DOCX, or TXT file.' },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, message: 'File size must be less than 10MB' },
        { status: 400 }
      );
    }

    // Upload CV to Cloudinary
    const cvUrl = await uploadCV(file);

    return NextResponse.json({
      success: true,
      url: cvUrl
    });
  } catch (error) {
    console.error('CV upload error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to upload CV' },
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
