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

// GET handler to fetch featured projects
export async function GET(req: NextRequest) {
  try {
    const projects = await prisma.project.findMany({
      where: {
        featured: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return new NextResponse(
      JSON.stringify({
        success: true,
        projects: projects,
      }),
      { status: 200, headers: getCorsHeaders(req) }
    );
  } catch (error) {
    console.error('Error fetching featured projects:', error);
    return new NextResponse(
      JSON.stringify({
        success: false,
        message: 'Failed to fetch featured projects',
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: 500, headers: getCorsHeaders(req) }
    );
  }
}

// POST handler to update featured projects (admin only)
export async function POST(req: NextRequest) {
  try {
    const authResult = await verifyAuthToken(req);
    const user = authResult.user;
    
    // Check if user is admin
    if (!authResult.success || !user || user.role !== 'admin') {
      return new NextResponse(
        JSON.stringify({ success: false, message: 'Unauthorized' }),
        { status: 401, headers: getCorsHeaders(req) }
      );
    }

    const body = await req.json();
    const { featuredProjectIds, mainFeaturedProjectId } = body;

    // Validate input
    if (!Array.isArray(featuredProjectIds) || typeof mainFeaturedProjectId !== 'string') {
      return new NextResponse(
        JSON.stringify({ 
          success: false, 
          message: 'Invalid input data' 
        }),
        { status: 400, headers: getCorsHeaders(req) }
      );
    }

    // Reset all featured flags
    await prisma.project.updateMany({
      where: {},
      data: {
        featured: false,
        mainFeatured: false,
      },
    });

    // Set featured flags for selected projects
    await prisma.project.updateMany({
      where: {
        id: {
          in: featuredProjectIds,
        },
      },
      data: {
        featured: true,
      },
    });

    // Set main featured flag for selected project
    if (mainFeaturedProjectId) {
      await prisma.project.update({
        where: {
          id: mainFeaturedProjectId,
        },
        data: {
          mainFeatured: true,
        },
      });
    }

    return new NextResponse(
      JSON.stringify({
        success: true,
        message: 'Featured projects updated successfully',
      }),
      { status: 200, headers: getCorsHeaders(req) }
    );
  } catch (error) {
    console.error('Error updating featured projects:', error);
    return new NextResponse(
      JSON.stringify({
        success: false,
        message: 'Failed to update featured projects',
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: 500, headers: getCorsHeaders(req) }
    );
  }
}
