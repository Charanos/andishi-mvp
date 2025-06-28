import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import path from 'path';
import { writeFile, mkdir } from 'fs/promises';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const file = formData.get('file') as File | null;
    const projectId = formData.get('projectId') as string | null;

    if (!file || !projectId) {
      return NextResponse.json(
        { success: false, message: 'File and projectId are required' },
        { status: 400 }
      );
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadsDir, { recursive: true });

    const fileExt = path.extname(file.name);
    const fileName = `${Date.now()}-${Math.random().toString(16).slice(2)}${fileExt}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    const filePath = path.join(uploadsDir, fileName);

    await writeFile(filePath, buffer);

    // Construct public URL (assuming /public is the static folder)
    const fileUrl = `/uploads/${fileName}`;

    // Connect to MongoDB and push file metadata to project
    const client = await clientPromise;
    const db = client.db();

    const newFile = {
      _id: new ObjectId(),
      fileName: file.name,
      fileUrl,
      fileSize: file.size,
      fileType: file.type,
      createdAt: new Date(),
    };

    const result = await db.collection('projects').updateOne(
      { _id: new ObjectId(projectId) },
      {
        $push: {
          files: newFile,
        },
        $set: {
          updatedAt: new Date(),
        },
      } as any
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { success: false, message: 'Project not found or not updated' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, file: newFile });
  } catch (error) {
    console.error('File upload error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to upload file', error: (error as any).message },
      { status: 500 }
    );
  }
}
