import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import path from 'path';
import { writeFile, mkdir } from 'fs/promises';
import { getSession } from '@/lib/getSession';

// CORS headers for production
const corsHeaders = {
  'Access-Control-Allow-Origin': process.env.NODE_ENV === 'production' ? 'https://andishi.dev' : '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Credentials': 'true',
};

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;

    // Validate environment variables
    if (!process.env.DATABASE_URL) {
      // DATABASE_URL configuration error
      return new NextResponse("Server configuration error", { status: 500, headers: corsHeaders });
    }

    // Add authentication check
    const session = await getSession(req);
    if (!session || !session.user) {
      // Unauthorized access attempt
      return new NextResponse("Unauthorized", { status: 401, headers: corsHeaders });
    }

    // User uploading file to project

    // Validate ObjectId format
    if (!ObjectId.isValid(projectId)) {
      // Invalid ObjectId format
      return new NextResponse("Invalid project ID format", { status: 400, headers: corsHeaders });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const fileName = formData.get('fileName') as string | null;
    const fileType = formData.get('fileType') as string | null;
    const description = formData.get('description') as string | null;
    const uploadedBy = formData.get('uploadedBy') as string | null;

    if (!file || !fileName) {
      return NextResponse.json(
        { success: false, error: 'File and fileName are required' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Connect to MongoDB and verify project exists and user has access
    const client = await clientPromise;
    const db = client.db();
    
    const project = await db.collection('projects').findOne({
      _id: new ObjectId(projectId)
    });

    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404, headers: corsHeaders }
      );
    }

    // Check if user has access to this project
    const hasAccess = 
      session.user.role === "admin" || // Admin can access all projects
      project.clientId === session.user.id; // Client can access their projects

    if (!hasAccess) {
      // Access denied for user to project
      return new NextResponse("Access denied", { status: 403, headers: corsHeaders });
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadsDir, { recursive: true });

    // Generate unique filename
    const fileExt = path.extname(file.name);
    const uniqueFileName = `${Date.now()}-${Math.random().toString(16).slice(2)}${fileExt}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    const filePath = path.join(uploadsDir, uniqueFileName);

    // Write file to disk
    await writeFile(filePath, buffer);

    // Construct public URL
    const fileUrl = `/uploads/${uniqueFileName}`;

    // Create file metadata
    const newFile = {
      id: new ObjectId().toString(),
      fileName: fileName,
      fileUrl,
      fileSize: file.size,
      fileType: fileType || file.type || 'document',
      uploadedBy: uploadedBy || 'client',
      createdAt: new Date(),
      ...(description && { description }),
    };

    // Update project with new file
    const result = await db.collection('projects').updateOne(
      { _id: new ObjectId(projectId) },
      {
        $push: {
          files: newFile,
        } as any,
        $set: {
          updatedAt: new Date(),
        },
      }
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Failed to update project with file' },
        { status: 500, headers: corsHeaders }
      );
    }

    // Successfully uploaded file to project

    return NextResponse.json(
      { success: true, file: newFile },
      { status: 201, headers: corsHeaders }
    );

  } catch (error) {
    // Log error for debugging while providing user-friendly response
    console.error('POST /api/client-projects/[projectId]/files - File upload error:', error);

    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to upload file',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500, headers: corsHeaders }
    );
  }
}

// GET endpoint to retrieve files for a project
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;

    // Add authentication check
    const session = await getSession(req);
    if (!session || !session.user) {
      return new NextResponse("Unauthorized", { status: 401, headers: corsHeaders });
    }

    // Validate ObjectId format
    if (!ObjectId.isValid(projectId)) {
      return new NextResponse("Invalid project ID format", { status: 400, headers: corsHeaders });
    }

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db();
    
    const project = await db.collection('projects').findOne({
      _id: new ObjectId(projectId)
    });

    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404, headers: corsHeaders }
      );
    }

    // Check if user has access to this project
    const hasAccess = 
      session.user.role === "admin" || // Admin can access all projects
      project.clientId === session.user.id; // Client can access their projects

    if (!hasAccess) {
      return new NextResponse("Access denied", { status: 403, headers: corsHeaders });
    }

    return NextResponse.json(
      { success: true, files: project.files || [] },
      { status: 200, headers: corsHeaders }
    );

  } catch (error) {
    // Log error for debugging while providing user-friendly response
    console.error('GET /api/client-projects/[projectId]/files - Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve files' },
      { status: 500, headers: corsHeaders }
    );
  }
}

// DELETE endpoint to remove a file from a project
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    const { searchParams } = new URL(req.url);
    const fileId = searchParams.get('fileId');

    if (!fileId) {
      return NextResponse.json(
        { success: false, error: 'File ID is required' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Add authentication check
    const session = await getSession(req);
    if (!session || !session.user) {
      return new NextResponse("Unauthorized", { status: 401, headers: corsHeaders });
    }

    // Validate ObjectId format
    if (!ObjectId.isValid(projectId)) {
      return new NextResponse("Invalid project ID format", { status: 400, headers: corsHeaders });
    }

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db();
    
    const project = await db.collection('projects').findOne({
      _id: new ObjectId(projectId)
    });

    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404, headers: corsHeaders }
      );
    }

    // Check if user has access to this project
    const hasAccess = 
      session.user.role === "admin" || // Admin can access all projects
      project.clientId === session.user.id; // Client can access their projects

    if (!hasAccess) {
      return new NextResponse("Access denied", { status: 403, headers: corsHeaders });
    }

    // Remove file from project
    const result = await db.collection('projects').updateOne(
      { _id: new ObjectId(projectId) },
      {
        $pull: {
          files: { id: fileId }
        } as any,
        $set: {
          updatedAt: new Date(),
        },
      }
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'File not found or not removed' },
        { status: 404, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      { success: true, message: 'File removed successfully' },
      { status: 200, headers: corsHeaders }
    );

  } catch (error) {
    // Log error for debugging while providing user-friendly response
    console.error('DELETE /api/client-projects/[projectId]/files - Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete file' },
      { status: 500, headers: corsHeaders }
    );
  }
}

// OPTIONS handler for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders });
}
