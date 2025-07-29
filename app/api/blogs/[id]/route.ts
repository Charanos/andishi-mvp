import { NextRequest, NextResponse } from 'next/server';
import { blogData, BlogPostType } from '@/lib/blogData';
import { jwtVerify } from 'jose';
import prisma from '@/lib/prisma';

// GET /api/blogs/[id] - Get specific blog post
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ success: false, error: 'Missing blog id' }, { status: 400 });
  }
  
  // Validate ID format if it looks like a MongoDB ObjectId
  if (id.length === 24 && /^[0-9a-fA-F]+$/.test(id)) {
    // This looks like a valid MongoDB ObjectId, we can proceed
  } else if (id.length < 2 || id.length > 100) {
    // If it's not a valid ObjectId format and it's too short or too long, it's likely invalid
    // We'll still try the slug lookup but log a warning
    console.warn(`Suspicious blog ID format: ${id}`);
  }
  
  try {
    // Optimize query strategy: try slug first (more common), then ID
    let blog = null;
    
    // First try to find by slug (most common case for SEO-friendly URLs)
    try {
      blog = await prisma.blog.findUnique({
        where: { slug: id }
      });
    } catch (prismaError: any) {
      // If slug lookup fails, it might be an ID
      console.warn('Slug lookup failed, trying ID:', prismaError?.message);
    }
    
    // If not found by slug and ID looks like a valid ObjectId, try ID lookup
    if (!blog && id.length === 24 && /^[0-9a-fA-F]+$/.test(id)) {
      try {
        blog = await prisma.blog.findUnique({
          where: { id: id }
        });
      } catch (prismaError: any) {
        // Handle Prisma P2023 error (invalid ID format)
        if (prismaError?.code === 'P2023') {
          console.warn('Invalid ObjectId format:', id);
        } else {
          throw prismaError; // Re-throw if it's a different error
        }
      }
    }

    if (!blog) {
      const response = NextResponse.json(
        { success: false, error: 'Blog post not found' },
        { status: 404 }
      );
      // Cache 404 responses for a short time to prevent repeated invalid requests
      response.headers.set('Cache-Control', 'public, max-age=60');
      return response;
    }

    // Increment view count asynchronously (fire and forget)
    prisma.blog.update({
      where: { id: blog.id },
      data: { views: { increment: 1 } }
    }).catch(error => {
      console.error('Failed to increment view count:', error);
    });

    // Transform the data to match the expected format
    const formattedBlog = {
      ...blog,
      views: (blog.views + 1).toString(), // Show incremented view count immediately
      likes: blog.likes.toString()
    };

    const response = NextResponse.json({
      success: true,
      data: formattedBlog
    });
    
    // Add cache headers for better performance
    // Cache for 5 minutes with stale-while-revalidate for 30 minutes
    response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=1800');
    response.headers.set('CDN-Cache-Control', 'public, s-maxage=300');
    response.headers.set('Vercel-CDN-Cache-Control', 'public, s-maxage=300');
    
    return response;
  } catch (error) {
    console.error('Error fetching blog:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch blog post' },
      { status: 500 }
    );
  }
}

// PUT /api/blogs/[id] - Update blog post (Admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ success: false, error: 'Missing blog id' }, { status: 400 });
  }
  
  // Validate ID format if it looks like a MongoDB ObjectId
  if (id.length === 24 && /^[0-9a-fA-F]+$/.test(id)) {
    // This looks like a valid MongoDB ObjectId, we can proceed
  } else if (id.length < 2 || id.length > 100) {
    // If it's not a valid ObjectId format and it's too short or too long, it's likely invalid
    // We'll still try the slug lookup but log a warning
    console.warn(`Suspicious blog ID format: ${id}`);
  }
  
  try {
    // Verify admin authentication
    const authResult = await verifyAdminAuth(request);
    if (!authResult.success) {
      return NextResponse.json(
        { success: false, error: authResult.error || 'Unauthorized. Admin access required.' },
        { status: 403 }
      );
    }


    
    // First try to find by slug, fallback to id for backward compatibility
    const existingBlog = await prisma.blog.findFirst({
      where: { 
        OR: [
          { slug: id },
          { id: id }
        ]
      }
    });

    if (!existingBlog) {
      return NextResponse.json(
        { success: false, error: 'Blog post not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { title, excerpt, content, author, category, image, authorImage } = body;

    // Update blog post in database using the actual id
    const updatedBlog = await prisma.blog.update({
      where: { id: existingBlog.id },
      data: {
        title: title || existingBlog.title,
        excerpt: excerpt || existingBlog.excerpt,
        content: content || existingBlog.content,
        author: author || existingBlog.author,
        category: category || existingBlog.category,
        image: image !== undefined ? image : existingBlog.image,
        authorImage: authorImage !== undefined ? authorImage : existingBlog.authorImage,
        readTime: content ? calculateReadTime(content) : existingBlog.readTime
      }
    });

    // Transform the data to match the expected format
    const formattedBlog = {
      ...updatedBlog,
      views: updatedBlog.views.toString(),
      likes: updatedBlog.likes.toString()
    };

    return NextResponse.json({
      success: true,
      data: formattedBlog,
      message: 'Blog post updated successfully'
    });

  } catch (error) {
    console.error('Error updating blog post:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update blog post' },
      { status: 500 }
    );
  }
}

// DELETE /api/blogs/[id] - Delete blog post (Admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ success: false, error: 'Missing blog id' }, { status: 400 });
  }
  
  // Validate ID format if it looks like a MongoDB ObjectId
  if (id.length === 24 && /^[0-9a-fA-F]+$/.test(id)) {
    // This looks like a valid MongoDB ObjectId, we can proceed
  } else if (id.length < 2 || id.length > 100) {
    // If it's not a valid ObjectId format and it's too short or too long, it's likely invalid
    // We'll still try the slug lookup but log a warning
    console.warn(`Suspicious blog ID format: ${id}`);
  }
  
  try {
    // Verify admin authentication
    const authResult = await verifyAdminAuth(request);
    if (!authResult.success) {
      return NextResponse.json(
        { success: false, error: authResult.error || 'Unauthorized. Admin access required.' },
        { status: 403 }
      );
    }


    
    // First try to find by slug, fallback to id for backward compatibility
    const existingBlog = await prisma.blog.findFirst({
      where: { 
        OR: [
          { slug: id },
          { id: id }
        ]
      }
    });

    if (!existingBlog) {
      return NextResponse.json(
        { success: false, error: 'Blog post not found' },
        { status: 404 }
      );
    }

    // First delete all related BlogLike records to avoid foreign key constraint violation
    await prisma.blogLike.deleteMany({
      where: { blogId: existingBlog.id }
    });
    
    // Also delete related BlogBookmark records
    await prisma.blogBookmark.deleteMany({
      where: { blogId: existingBlog.id }
    });
    
    // Also delete related BlogComment records and their likes/replies
    // First delete comment likes
    await prisma.commentLike.deleteMany({
      where: { 
        comment: {
          blogId: existingBlog.id
        }
      }
    });
    
    // Then delete comment replies
    await prisma.commentReply.deleteMany({
      where: { 
        comment: {
          blogId: existingBlog.id
        }
      }
    });
    
    // Finally delete the comments themselves
    await prisma.blogComment.deleteMany({
      where: { blogId: existingBlog.id }
    });
    
    // Now delete the blog post itself
    await prisma.blog.delete({
      where: { id: existingBlog.id }
    });

    return NextResponse.json({
      success: true,
      message: 'Blog post deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting blog post:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete blog post' },
      { status: 500 }
    );
  }
}

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

// Helper function to calculate read time
function calculateReadTime(content: string): string {
  const wordsPerMinute = 200;
  const words = content.replace(/<[^>]*>/g, '').split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);
  return `${minutes} min read`;
}
