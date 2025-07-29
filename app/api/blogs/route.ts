import { NextRequest, NextResponse } from 'next/server';
import { blogData, BlogPostType } from '@/lib/blogData';
import { jwtVerify } from 'jose';
import prisma from '@/lib/prisma';

// GET /api/blogs - Get all blog posts
export async function GET() {
  try {
    const blogs = await prisma.blog.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    // Transform the data to match the expected format
    const formattedBlogs = blogs.map(blog => ({
      ...blog,
      views: blog.views.toString(),
      likes: blog.likes.toString()
    }));
    
    return NextResponse.json({
      success: true,
      data: formattedBlogs
    });
  } catch (error) {
    console.error('Error fetching blogs:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch blogs' },
      { status: 500 }
    );
  }
}

// POST /api/blogs - Create new blog post (Admin only)
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
    const { title, excerpt, content, author, category, image, gradient } = body;

    // Validate required fields
    if (!title || !excerpt || !content || !author || !category) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 50);

    // Check if slug already exists
    const existingBlog = await prisma.blog.findUnique({
      where: { slug }
    });
    
    if (existingBlog) {
      return NextResponse.json(
        { success: false, error: 'Blog post with this title already exists' },
        { status: 400 }
      );
    }

    // Create new blog post in database
    const newBlog = await prisma.blog.create({
      data: {
        slug,
        title,
        excerpt,
        content,
        author,
        date: new Date().toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        }),
        readTime: calculateReadTime(content),
        category,
        image: image || '/images/default-blog.jpg',
        gradient: gradient || 'from-blue-500/20 to-purple-500/10'
      }
    });

    // Transform the data to match the expected format
    const formattedBlog = {
      ...newBlog,
      views: newBlog.views.toString(),
      likes: newBlog.likes.toString()
    };

    return NextResponse.json({
      success: true,
      data: formattedBlog,
      message: 'Blog post created successfully'
    });

  } catch (error) {
    console.error('Error creating blog post:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create blog post' },
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
