import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthToken } from '@/lib/auth-utils';
import prisma from '@/lib/prisma';

// CORS headers
const getCorsHeaders = (req: NextRequest) => {
  return {
    'Access-Control-Allow-Origin': req.headers.get('origin') || '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true',
  };
};

// GET /api/homepage-projects - Get all homepage projects
export async function GET(req: NextRequest) {
  try {
    const projects = await prisma.homepageProject.findMany({
      orderBy: [
        { featured: 'desc' }, // Featured projects first
        { createdAt: 'desc' }, // Then by creation date
      ],
    });

    const response = new NextResponse(JSON.stringify({
      success: true,
      data: projects
    }), { 
      status: 200, 
      headers: getCorsHeaders(req) 
    });

    // Add cache headers for better performance
    response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
    response.headers.set('CDN-Cache-Control', 'public, s-maxage=60');
    response.headers.set('Vercel-CDN-Cache-Control', 'public, s-maxage=60');

    return response;
  } catch (error) {
    console.error('Error fetching homepage projects:', error);
    return new NextResponse(
      JSON.stringify({ 
        success: false, 
        error: 'Failed to fetch homepage projects' 
      }), 
      { 
        status: 500, 
        headers: getCorsHeaders(req) 
      }
    );
  }
}

// POST /api/homepage-projects - Create new homepage project (Admin only)
export async function POST(req: NextRequest) {
  try {
    const authResult = await verifyAuthToken(req);
    const user = authResult.user;
    
    // Check if user is admin
    if (!authResult.success || !user || user.role !== 'admin') {
      return new NextResponse(
        JSON.stringify({ success: false, message: 'Unauthorized. Admin access required.' }),
        { status: 401, headers: getCorsHeaders(req) }
      );
    }

    const body = await req.json();
    const { 
      title, 
      description, 
      category, 
      image,
      projectImages,
      technologies,
      client,
      duration,
      teamSize,
      featured,
      status,
      gradient,
      liveUrl,
      githubUrl,
      projectUrl
    } = body;

    // Validate required fields
    if (!title || !description || !category) {
      return new NextResponse(
        JSON.stringify({ 
          success: false, 
          message: 'Missing required fields: title, description, and category are required' 
        }),
        { status: 400, headers: getCorsHeaders(req) }
      );
    }

    // Create new project in database
    // Extract nested fields from projectDetails
    const projectDetails = {
      title,
      description,
      category,
      technologies: technologies || [],
      image: image || '/images/default-project.jpg',
      client: client || '',
      duration: duration || '',
      teamSize: teamSize || '',
      featured: featured || false,
      status: status || 'planning',
      gradient: gradient || 'from-gray-500/20 to-gray-600/10',
      liveUrl: liveUrl || '',
      githubUrl: githubUrl || '',
    };

    const newProject = await prisma.homepageProject.create({
      data: {
        title,
        description,
        category,
        image: image || '/images/default-project.jpg',
        projectImages: projectImages || [],
        technologies: technologies || [],
        gradient: gradient || 'from-gray-500/20 to-gray-600/10',
        liveUrl: liveUrl || '',
        githubUrl: githubUrl || '',
        projectUrl: projectUrl || '',
        client: client || '',
        duration: duration || '',
        teamSize: teamSize || '',
        featured: featured || false,
        status: status || 'planning',
      }
    });

    return new NextResponse(JSON.stringify({
      success: true,
      data: newProject,
      message: 'Homepage project created successfully'
    }), { status: 201, headers: getCorsHeaders(req) });

  } catch (error) {
    console.error('Error creating homepage project:', error);
    return new NextResponse(
      JSON.stringify({
        success: false,
        message: 'Failed to create homepage project',
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: getCorsHeaders(req) }
    );
  }
}

// PUT /api/homepage-projects - Update homepage project (Admin only)
export async function PUT(req: NextRequest) {
  try {
    const authResult = await verifyAuthToken(req);
    const user = authResult.user;
    
    // Check if user is admin
    if (!authResult.success || !user || user.role !== 'admin') {
      return new NextResponse(
        JSON.stringify({ success: false, message: 'Unauthorized. Admin access required.' }),
        { status: 401, headers: getCorsHeaders(req) }
      );
    }

    const body = await req.json();
    const { id, ...updates } = body;

    if (!id) {
      return new NextResponse(
        JSON.stringify({ 
          success: false, 
          message: 'Project ID is required' 
        }),
        { status: 400, headers: getCorsHeaders(req) }
      );
    }

    // Update project in database
    const updatedProject = await prisma.homepageProject.update({
      where: { id },
      data: {
        ...updates,
        updatedAt: new Date()
      }
    });

    return new NextResponse(JSON.stringify({
      success: true,
      data: updatedProject,
      message: 'Homepage project updated successfully'
    }), { status: 200, headers: getCorsHeaders(req) });

  } catch (error) {
    console.error('Error updating homepage project:', error);
    return new NextResponse(
      JSON.stringify({
        success: false,
        message: 'Failed to update homepage project',
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: getCorsHeaders(req) }
    );
  }
}

// DELETE /api/homepage-projects - Delete homepage project (Admin only)
export async function DELETE(req: NextRequest) {
  try {
    const authResult = await verifyAuthToken(req);
    const user = authResult.user;
    
    // Check if user is admin
    if (!authResult.success || !user || user.role !== 'admin') {
      return new NextResponse(
        JSON.stringify({ success: false, message: 'Unauthorized. Admin access required.' }),
        { status: 401, headers: getCorsHeaders(req) }
      );
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return new NextResponse(
        JSON.stringify({ 
          success: false, 
          message: 'Project ID is required' 
        }),
        { status: 400, headers: getCorsHeaders(req) }
      );
    }

    // Delete project from database
    await prisma.homepageProject.delete({
      where: { id }
    });

    return new NextResponse(JSON.stringify({
      success: true,
      message: 'Homepage project deleted successfully'
    }), { status: 200, headers: getCorsHeaders(req) });

  } catch (error) {
    console.error('Error deleting homepage project:', error);
    return new NextResponse(
      JSON.stringify({
        success: false,
        message: 'Failed to delete homepage project',
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: getCorsHeaders(req) }
    );
  }
}
