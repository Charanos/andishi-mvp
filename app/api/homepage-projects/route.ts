import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthToken } from '@/lib/auth-utils';
import { generateSlug } from '@/lib/utils';
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

// GET /api/homepage-projects - Get all homepage projects or a single project by slug/id
export async function GET(req: NextRequest) {
  try {
    console.log('Homepage projects API called');
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get('slug');
    const id = searchParams.get('id');
    console.log('Query params:', { slug, id });

    // Test database connection first
    await prisma.$connect();
    console.log('Database connected successfully');

    if (slug || id) {
      console.log('Fetching single project by:', slug ? 'slug' : 'id');
      // Fetch single project by slug or id
      const project = await prisma.homepageProject.findFirst({
        where: slug ? { slug: slug } : (id ? { id: id } : undefined)
      });
      console.log('Project found:', !!project);

      if (!project) {
        return new NextResponse(
          JSON.stringify({ 
            success: false, 
            error: 'Project not found' 
          }), 
          { status: 404, headers: getCorsHeaders(req) }
        );
      }

      const response = new NextResponse(JSON.stringify({
        success: true,
        data: project
      }), { 
        status: 200, 
        headers: getCorsHeaders(req) 
      });

      // Add cache headers for better performance
      response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
      response.headers.set('CDN-Cache-Control', 'public, s-maxage=60');
      response.headers.set('Vercel-CDN-Cache-Control', 'public, s-maxage=60');

      return response;
    } else {
      console.log('Fetching all projects');
      // Fetch all projects
      const projects = await prisma.homepageProject.findMany({
        orderBy: [
          { featured: 'desc' }, // Featured projects first
          { createdAt: 'desc' }, // Then by creation date
        ],
      });
      console.log('Projects found:', projects.length);

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
    }
  } catch (error) {
    console.error('Error fetching homepage projects:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace',
      name: error instanceof Error ? error.name : 'Unknown error type'
    });
    return new NextResponse(
      JSON.stringify({ 
        success: false, 
        error: 'Failed to fetch homepage projects',
        details: error instanceof Error ? error.message : 'Unknown error'
      }), 
      { status: 500, headers: getCorsHeaders(req) }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// OPTIONS handler for CORS
export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: getCorsHeaders(req)
  });
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
      githubUrl
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

    // Generate slug from title using utility function
    const projectSlug = generateSlug(title);
    
    // Check if slug already exists and make it unique if needed
    const existingProject = await prisma.homepageProject.findFirst({
      where: { slug: projectSlug }
    });
    
    let finalSlug = projectSlug;
    if (existingProject) {
      // Add timestamp to make it unique
      finalSlug = `${projectSlug}-${Date.now()}`;
    }

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
        slug: finalSlug,
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

    // Always generate slug from title if title is being updated
    let updateData = { ...updates };
    if (updates.title) {
      const newSlug = generateSlug(updates.title);
      
      // Check if the new slug conflicts with existing projects (excluding current one)
      const existingProject = await prisma.homepageProject.findFirst({
        where: { 
          slug: newSlug,
          id: { not: id }
        }
      });
      
      if (existingProject) {
        // Make slug unique by adding timestamp
        updateData.slug = `${newSlug}-${Date.now()}`;
      } else {
        updateData.slug = newSlug;
      }
    }

    // Update project in database
    const updatedProject = await prisma.homepageProject.update({
      where: { id },
      data: {
        ...updateData,
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
