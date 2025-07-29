'use server';

import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import prisma from '@/lib/prisma';

// Helper function to verify admin authentication
async function verifyAdminAuth(request: NextRequest) {
  try {
    // Try to get token from Authorization header first
    const authHeader = request.headers.get('authorization');
    let token = authHeader?.replace('Bearer ', '');

    // If no token in header, try cookie
    if (!token) {
      token = request.cookies.get('auth_token')?.value;
    }

    if (!token) {
      return { success: false, error: 'No authentication token found' };
    }

    // Get JWT secret from environment
    const secretValue = process.env.JWT_SECRET || process.env.NEXT_PUBLIC_JWT_SECRET;
    if (!secretValue) {
      return { success: false, error: 'Server configuration error' };
    }

    // Verify JWT token
    const secret = new TextEncoder().encode(secretValue);
    const { payload } = await jwtVerify(token, secret);
    
    // Get user data from payload
    const userEmail = payload.email as string;

    const user = await prisma.user.findUnique({ 
      where: { email: userEmail } 
    });

    if (!user || !user.isActive || user.role !== 'admin') {
      return { success: false, error: 'Admin access required' };
    }

    return { success: true, user };
  } catch (error) {
    console.error('Auth verification error:', error);
    return { success: false, error: 'Authentication failed' };
  }
}

// GET /api/blogs/featured - Get featured blogs with optimizations
export async function GET() {
  try {
    // Use Promise.all to run both queries in parallel for better performance
    const [featuredBlogs, mainFeaturedBlog] = await Promise.all([
      // Get featured blogs with field selection to reduce payload
      prisma.blog.findMany({
        where: { featured: true },
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          author: true,
          date: true,
          readTime: true,
          category: true,
          image: true,
          authorImage: true,
          views: true,
          likes: true,
          featured: true,
          mainFeatured: true,
          createdAt: true,
          updatedAt: true
          // Exclude 'content' field for list view to reduce payload size
        },
        orderBy: { createdAt: 'desc' },
        take: 3 // Limit to 3 featured blogs for performance
      }),
      // Get main featured blog
      prisma.blog.findFirst({
        where: { mainFeatured: true },
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          author: true,
          date: true,
          readTime: true,
          category: true,
          image: true,
          authorImage: true,
          views: true,
          likes: true,
          featured: true,
          mainFeatured: true,
          createdAt: true,
          updatedAt: true
          // Exclude 'content' field for list view to reduce payload size
        }
      })
    ]);
    
    // Transform the data to match the expected format
    const formattedFeaturedBlogs = featuredBlogs.map(blog => ({
      ...blog,
      views: blog.views.toString(),
      likes: blog.likes.toString()
    }));
    
    const formattedMainFeaturedBlog = mainFeaturedBlog ? {
      ...mainFeaturedBlog,
      views: mainFeaturedBlog.views.toString(),
      likes: mainFeaturedBlog.likes.toString()
    } : null;
    
    const response = NextResponse.json({
      success: true,
      data: {
        featuredBlogs: formattedFeaturedBlogs,
        mainFeaturedBlog: formattedMainFeaturedBlog
      }
    });
    
    // Add aggressive caching for featured blogs since they change less frequently
    response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=3600');
    response.headers.set('CDN-Cache-Control', 'public, s-maxage=300');
    response.headers.set('Vercel-CDN-Cache-Control', 'public, s-maxage=300');
    
    return response;
  } catch (error) {
    console.error('Error fetching featured blogs:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch featured blogs' },
      { status: 500 }
    );
  }
}

// POST /api/blogs/featured - Update featured blogs (Admin only)
export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const authResult = await verifyAdminAuth(request);
    if (!authResult.success) {
      return NextResponse.json(
        { success: false, error: authResult.error || 'Unauthorized. Admin access required.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { featuredBlogids, mainFeaturedBlogid } = body;

    // Validate input
    if (!Array.isArray(featuredBlogids) || featuredBlogids.length > 3) {
      return NextResponse.json(
        { success: false, error: 'Invalid featured blogs data. Maximum 3 featured blogs allowed.' },
        { status: 400 }
      );
    }

    // Reset all blogs to not featured
    await prisma.blog.updateMany({
      where: {},
      data: { featured: false, mainFeatured: false }
    });

    // Set featured blogs
    if (featuredBlogids.length > 0) {
      // Validate that all IDs look like valid MongoDB ObjectIds
      const validIds = featuredBlogids.filter((id: string) => 
        id.length === 24 && /^[0-9a-fA-F]+$/.test(id)
      );
      
      if (validIds.length > 0) {
        await prisma.blog.updateMany({
          where: { id: { in: validIds } },
          data: { featured: true }
        });
      }
    }

    // Set main featured blog
    if (mainFeaturedBlogid) {
      // Validate that the ID looks like a valid MongoDB ObjectId
      if (mainFeaturedBlogid.length === 24 && /^[0-9a-fA-F]+$/.test(mainFeaturedBlogid)) {
        await prisma.blog.updateMany({
          where: { id: mainFeaturedBlogid },
          data: { mainFeatured: true }
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Featured blogs updated successfully'
    });

  } catch (error) {
    console.error('Error updating featured blogs:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update featured blogs' },
      { status: 500 }
    );
  }
}
