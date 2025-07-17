import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
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

    // Push file metadata to project using Prisma
    const newFile = {
      id: `${Date.now()}${Math.random().toString(16).slice(2)}`, // Generate a unique ID
      fileName: file.name,
      fileUrl,
      fileSize: file.size,
      fileType: file.type,
      createdAt: new Date(),
    };

    const result = await prisma.project.update({
      where: { id: projectId },
      data: {
        files: {
          push: newFile,
        },
        updatedAt: new Date(),
      }
    });

    if (!result) {
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
