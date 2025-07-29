import { NextRequest, NextResponse } from 'next/server';
import { blogData, BlogPostType } from '@/lib/blogData';
import { jwtVerify } from 'jose';
import prisma from '@/lib/prisma';

// GET /api/blogs/[slug] - Get specific blog post
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  if (!slug) {
    return NextResponse.json({ success: false, error: 'Missing blog slug' }, { status: 400 });
  }
  try {
    const blog = await prisma.blog.findUnique({
      where: { slug }
    });

    if (!blog) {
      return NextResponse.json(
        { success: false, error: 'Blog post not found' },
        { status: 404 }
      );
    }

    // Transform the data to match the expected format
    const formattedBlog = {
      ...blog,
      views: blog.views.toString(),
      likes: blog.likes.toString()
    };

    return NextResponse.json({
      success: true,
      data: formattedBlog
    });
  } catch (error) {
    console.error('Error fetching blog:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch blog post' },
      { status: 500 }
    );
  }
}

// PUT /api/blogs/[slug] - Update blog post (Admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  if (!slug) {
    return NextResponse.json({ success: false, error: 'Missing blog slug' }, { status: 400 });
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


    
    const existingBlog = await prisma.blog.findUnique({
      where: { slug }
    });

    if (!existingBlog) {
      return NextResponse.json(
        { success: false, error: 'Blog post not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { title, excerpt, content, author, category, image, gradient } = body;

    // Update blog post in database
    const updatedBlog = await prisma.blog.update({
      where: { slug },
      data: {
        title: title || existingBlog.title,
        excerpt: excerpt || existingBlog.excerpt,
        content: content || existingBlog.content,
        author: author || existingBlog.author,
        category: category || existingBlog.category,
        image: image !== undefined ? image : existingBlog.image,
        gradient: gradient !== undefined ? gradient : existingBlog.gradient,
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

// DELETE /api/blogs/[slug] - Delete blog post (Admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  if (!slug) {
    return NextResponse.json({ success: false, error: 'Missing blog slug' }, { status: 400 });
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


    
    const existingBlog = await prisma.blog.findUnique({
      where: { slug }
    });

    if (!existingBlog) {
      return NextResponse.json(
        { success: false, error: 'Blog post not found' },
        { status: 404 }
      );
    }

    // Delete from database
    await prisma.blog.delete({
      where: { slug }
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
