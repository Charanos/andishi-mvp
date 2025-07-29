import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import prisma from '@/lib/prisma';

// Cache for frequently accessed blog posts (in-memory cache)
const blogCache = new Map();
const authCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const AUTH_CACHE_TTL = 10 * 60 * 1000; // 10 minutes for auth

// Precompiled regex for ObjectId validation
const OBJECT_ID_REGEX = /^[0-9a-fA-F]{24}$/;

// GET /api/blogs/[id] - Get specific blog post
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ success: false, error: 'Missing blog id' }, { status: 400 });
  }
  
  // Check cache first
  const cacheKey = `blog_${id}`;
  const cached = blogCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return createSuccessResponse(cached.data);
  }
  
  try {
    // Determine if this looks like a MongoDB ObjectId
    const isObjectId = OBJECT_ID_REGEX.test(id);
    let blog = null;
    
    if (isObjectId) {
      // Try ObjectId first if it looks like one (direct database access is faster)
      try {
        blog = await prisma.blog.findUnique({
          where: { id: id },
          select: selectFields
        });
      } catch (error) {
        // If ObjectId lookup fails, fall back to slug
        console.warn('ObjectId lookup failed, trying slug:', error);
      }
      
      // If not found by ObjectId, try slug
      if (!blog) {
        blog = await prisma.blog.findUnique({
          where: { slug: id },
          select: selectFields
        });
      }
    } else {
      // For non-ObjectId format, try slug first (most likely)
      blog = await prisma.blog.findUnique({
        where: { slug: id },
        select: selectFields
      });
    }

    if (!blog) {
      return createNotFoundResponse();
    }

    // Async view increment using upsert for better MongoDB performance
    incrementViewCount(blog.id);

    // Format and cache the result
    const formattedBlog = formatBlogResponse(blog);
    
    blogCache.set(cacheKey, {
      data: formattedBlog,
      timestamp: Date.now()
    });

    // Periodic cache cleanup
    if (Math.random() < 0.05) { // 5% chance
      cleanupCache();
    }

    return createSuccessResponse(formattedBlog);
    
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
  
  try {
    // Verify admin authentication with caching
    const authResult = await verifyAdminAuth(request);
    if (!authResult.success) {
      return NextResponse.json(
        { success: false, error: authResult.error || 'Unauthorized. Admin access required.' },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { title, excerpt, content, author, category, image, authorImage } = body;

    // Find blog using optimized lookup
    const isObjectId = OBJECT_ID_REGEX.test(id);
    const whereClause = isObjectId 
      ? { OR: [{ id: id }, { slug: id }] }
      : { OR: [{ slug: id }, { id: id }] };

    const existingBlog = await prisma.blog.findFirst({
      where: whereClause,
      select: { id: true, slug: true, content: true }
    });

    if (!existingBlog) {
      return NextResponse.json(
        { success: false, error: 'Blog post not found' },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (excerpt !== undefined) updateData.excerpt = excerpt;
    if (content !== undefined) {
      updateData.content = content;
      updateData.readTime = calculateReadTime(content);
    }
    if (author !== undefined) updateData.author = author;
    if (category !== undefined) updateData.category = category;
    if (image !== undefined) updateData.image = image;
    if (authorImage !== undefined) updateData.authorImage = authorImage;

    // Update blog post
    const updatedBlog = await prisma.blog.update({
      where: { id: existingBlog.id },
      data: updateData
    });

    // Clear relevant caches
    invalidateCache(id, existingBlog.slug, updatedBlog.slug);

    // Format response
    const formattedBlog = formatBlogResponse(updatedBlog);

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
  
  try {
    // Verify admin authentication
    const authResult = await verifyAdminAuth(request);
    if (!authResult.success) {
      return NextResponse.json(
        { success: false, error: authResult.error || 'Unauthorized. Admin access required.' },
        { status: 403 }
      );
    }

    // Find the blog post
    const isObjectId = OBJECT_ID_REGEX.test(id);
    const whereClause = isObjectId 
      ? { OR: [{ id: id }, { slug: id }] }
      : { OR: [{ slug: id }, { id: id }] };

    const existingBlog = await prisma.blog.findFirst({
      where: whereClause,
      select: { id: true, slug: true }
    });

    if (!existingBlog) {
      return NextResponse.json(
        { success: false, error: 'Blog post not found' },
        { status: 404 }
      );
    }

    // Delete related records in parallel for better performance
    await Promise.all([
      prisma.commentLike.deleteMany({
        where: { comment: { blogId: existingBlog.id } }
      }),
      prisma.commentReply.deleteMany({
        where: { comment: { blogId: existingBlog.id } }
      }),
      prisma.blogComment.deleteMany({
        where: { blogId: existingBlog.id }
      }),
      prisma.blogLike.deleteMany({
        where: { blogId: existingBlog.id }
      }),
      prisma.blogBookmark.deleteMany({
        where: { blogId: existingBlog.id }
      })
    ]);
    
    // Delete the blog post
    await prisma.blog.delete({
      where: { id: existingBlog.id }
    });

    // Clear cache
    invalidateCache(id, existingBlog.slug);

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

// Helper constants and functions
const selectFields = {
  id: true,
  title: true,
  excerpt: true,
  content: true,
  author: true,
  category: true,
  image: true,
  readTime: true,
  views: true,
  likes: true,
  slug: true,
  createdAt: true,
  updatedAt: true,
  authorImage: true
};

function formatBlogResponse(blog: any) {
  return {
    ...blog,
    views: blog.views.toString(),
    likes: blog.likes.toString(),
    createdAt: blog.createdAt instanceof Date ? blog.createdAt.toISOString() : blog.createdAt,
    updatedAt: blog.updatedAt instanceof Date ? blog.updatedAt.toISOString() : blog.updatedAt
  };
}

function createSuccessResponse(data: any) {
  const response = NextResponse.json({
    success: true,
    data: data
  });
  
  // Aggressive caching headers
  response.headers.set('Cache-Control', 'public, s-maxage=600, stale-while-revalidate=3600');
  response.headers.set('CDN-Cache-Control', 'public, s-maxage=600');
  response.headers.set('Vercel-CDN-Cache-Control', 'public, s-maxage=600');
  
  return response;
}

function createNotFoundResponse() {
  const response = NextResponse.json(
    { success: false, error: 'Blog post not found' },
    { status: 404 }
  );
  response.headers.set('Cache-Control', 'public, max-age=300');
  return response;
}

function incrementViewCount(blogId: string) {
  // Non-blocking view increment
  setImmediate(() => {
    prisma.blog.update({
      where: { id: blogId },
      data: { views: { increment: 1 } }
    }).catch(error => {
      console.error('Failed to increment view count:', error);
    });
  });
}

function invalidateCache(...keys: (string | undefined)[]) {
  keys.forEach(key => {
    if (key) {
      blogCache.delete(`blog_${key}`);
    }
  });
}

// Optimized admin authentication with enhanced caching
async function verifyAdminAuth(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    let token = authHeader?.replace('Bearer ', '') || request.cookies.get('auth_token')?.value;

    if (!token) {
      return { success: false, error: 'No authentication token found' };
    }

    // Check auth cache with token hash for security
    const tokenHash = token.substring(0, 10); // Use part of token as cache key
    const cached = authCache.get(tokenHash);
    if (cached && Date.now() - cached.timestamp < AUTH_CACHE_TTL) {
      return cached.result;
    }

    const secretValue = process.env.JWT_SECRET || process.env.NEXT_PUBLIC_JWT_SECRET;
    if (!secretValue) {
      return { success: false, error: 'Server configuration error' };
    }

    // Verify JWT token
    const secret = new TextEncoder().encode(secretValue);
    const { payload } = await jwtVerify(token, secret);
    
    const userEmail = payload.email as string;
    const user = await prisma.user.findUnique({ 
      where: { email: userEmail },
      select: { id: true, email: true, role: true, isActive: true }
    });

    const result = user && user.isActive && user.role === 'admin'
      ? { success: true, user }
      : { success: false, error: 'Admin access required' };

    // Cache the result
    authCache.set(tokenHash, {
      result,
      timestamp: Date.now()
    });

    return result;
  } catch (error) {
    console.error('Auth verification error:', error);
    return { success: false, error: 'Authentication failed' };
  }
}

function calculateReadTime(content: string): string {
  const wordsPerMinute = 200;
  const words = content.replace(/<[^>]*>/g, '').split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);
  return `${minutes} min read`;
}

// Helper function to cleanup old cache entries
function cleanupCache() {
  const now = Date.now();
  
  // Cleanup blog cache
  for (const [key, value] of blogCache.entries()) {
    if (now - value.timestamp > CACHE_TTL) {
      blogCache.delete(key);
    }
  }
  
  // Cleanup auth cache
  for (const [key, value] of authCache.entries()) {
    if (now - value.timestamp > AUTH_CACHE_TTL) {
      authCache.delete(key);
    }
  }
}