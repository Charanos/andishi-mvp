import { NextRequest, NextResponse } from 'next/server';
import { blogData, BlogPostType } from '@/lib/blogData';
import { jwtVerify } from 'jose';
import prisma from '@/lib/prisma';

// GET /api/blogs - Get all blog posts
export async function GET() {
  try {
    let blogs;
    try {
      blogs = await prisma.blog.findMany({
        orderBy: {
          createdAt: 'desc'
        }
      });
    } catch (prismaError) {
      console.error('Database error when fetching blogs:', prismaError);
      return NextResponse.json(
        { success: false, error: 'Database connection error when fetching blogs' },
        { status: 500 }
      );
    }
    
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
    const { title, excerpt, content, author, category, image, authorImage } = body;

    // Validate required fields
    if (!title || !excerpt || !content || !author || !category) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate a slug for URL purposes
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 50);
    
    // Ensure slug is not empty
    if (!slug) {
      return NextResponse.json(
        { success: false, error: 'Title must contain alphanumeric characters' },
        { status: 400 }
      );
    }

    // Check if a blog with this slug already exists
    let existingBlog;
    try {
      existingBlog = await prisma.blog.findFirst({
        where: { slug }
      });
    } catch (prismaError) {
      console.error('Database error when checking for existing blog:', prismaError);
      return NextResponse.json(
        { success: false, error: 'Database connection error when checking for existing blog' },
        { status: 500 }
      );
    }
    
    if (existingBlog) {
      return NextResponse.json(
        { success: false, error: 'Blog post with this title already exists' },
        { status: 400 }
      );
    }

    // Format the date safely
    let formattedDate;
    try {
      formattedDate = new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } catch (dateError) {
      console.error('Error formatting date:', dateError);
      formattedDate = new Date().toISOString(); // Fallback to ISO string
    }
    
    // Log the data we're about to insert for debugging
    console.log('Creating blog with data:', {
      title,
      slug,
      excerpt: excerpt.substring(0, 50) + '...', // Truncate for logging
      author,
      date: formattedDate,
      category,
      image,
      authorImage
    });
    
    // Create new blog post in database
    let newBlog;
    try {
      newBlog = await prisma.blog.create({
        data: {
          title,
          slug,
          excerpt,
          content,
          author,
          date: formattedDate,
          readTime: calculateReadTime(content),
          category,
          image: image || '/images/default-blog.jpg',
          authorImage: authorImage || '/images/default-avatar.png'
        }
      });
    } catch (prismaError) {
      console.error('Database error when creating blog:', prismaError);
      return NextResponse.json(
        { success: false, error: 'Database connection error when creating blog post' },
        { status: 500 }
      );
    }

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
    
    // Provide more detailed error information
    let errorMessage = 'Failed to create blog post';
    if (error instanceof Error) {
      errorMessage = error.message;
      // Log the full error stack for debugging
      console.error('Full error stack:', error.stack);
    }
    
    return NextResponse.json(
      { success: false, error: errorMessage },
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
    console.log('JWT Secret exists:', !!secretValue); // Log for debugging
    
    if (!secretValue) {
      console.error('JWT_SECRET or NEXT_PUBLIC_JWT_SECRET not found in environment variables');
      return { success: false, error: 'Server configuration error: Missing JWT secret' };
    }

    // Verify JWT token
    let payload;
    try {
      const secret = new TextEncoder().encode(secretValue);
      const result = await jwtVerify(token, secret);
      payload = result.payload;
    } catch (jwtError) {
      console.error('JWT verification failed:', jwtError);
      return { success: false, error: 'Invalid or expired authentication token' };
    }
    
    // Get user data from payload
    const userEmail = payload.email as string;
    console.log('Looking up user with email:', userEmail); // Log for debugging

    let user;
    try {
      user = await prisma.user.findUnique({ 
        where: { email: userEmail } 
      });
    } catch (userLookupError) {
      console.error('Database error when looking up user:', userLookupError);
      return { success: false, error: 'Database connection error when looking up user' };
    }

    if (!user || !user.isActive || user.role !== 'admin') {
      return { success: false, error: 'Admin access required' };
    }

    return { success: true, user };
  } catch (error) {
    console.error('Auth verification error:', error);
    
    // Provide more detailed error information
    let errorMessage = 'Authentication failed';
    if (error instanceof Error) {
      errorMessage = error.message;
      // Log the full error stack for debugging
      console.error('Full auth error stack:', error.stack);
    }
    
    return { success: false, error: errorMessage };
  }
}

// Helper function to calculate read time
function calculateReadTime(content: string): string {
  const wordsPerMinute = 200;
  const words = content.replace(/<[^>]*>/g, '').split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);
  return `${minutes} min read`;
}
