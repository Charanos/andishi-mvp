import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/getSession';

// POST /api/blogs/[slug]/bookmark - Bookmark or unbookmark a blog post
export async function POST(
  request: NextRequest,
  context: { params?: { slug?: string } } = {}
) {
  const params = await context.params;
  const slug = params?.slug;
  if (!slug) {
    return NextResponse.json({ success: false, error: 'Missing blog slug' }, { status: 400 });
  }
  
  try {
    // Get user session
    const session = await getSession(request);
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    
    // Find the blog post
    const blog = await prisma.blog.findUnique({
      where: { slug }
    });

    if (!blog) {
      return NextResponse.json(
        { success: false, error: 'Blog post not found' },
        { status: 404 }
      );
    }

    // Check if user has already bookmarked this blog
    const existingBookmark = await prisma.blogBookmark.findUnique({
      where: {
        blogId_userId: {
          blogId: blog.id,
          userId: userId
        }
      }
    });

    if (existingBookmark) {
      // Unbookmark - remove the bookmark
      await prisma.blogBookmark.delete({
        where: {
          blogId_userId: {
            blogId: blog.id,
            userId: userId
          }
        }
      });
      
      return NextResponse.json({
        success: true,
        data: {
          bookmarked: false
        },
        message: 'Blog unbookmarked successfully'
      });
    } else {
      // Bookmark - create new bookmark
      await prisma.blogBookmark.create({
        data: {
          blogId: blog.id,
          userId: userId
        }
      });
      
      return NextResponse.json({
        success: true,
        data: {
          bookmarked: true
        },
        message: 'Blog bookmarked successfully'
      });
    }

  } catch (error) {
    console.error('Error processing blog bookmark:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process bookmark' },
      { status: 500 }
    );
  }
}

// GET /api/blogs/[slug]/bookmark - Check if user has bookmarked a blog post
export async function GET(
  request: NextRequest,
  context: { params?: { slug?: string } } = {}
) {
  const params = await context.params;
  const slug = params?.slug;
  if (!slug) {
    return NextResponse.json({ success: false, error: 'Missing blog slug' }, { status: 400 });
  }
  
  try {
    // Get user session
    const session = await getSession(request);
    if (!session || !session.user) {
      return NextResponse.json({ bookmarked: false });
    }
    
    const userId = session.user.id;
    
    // Find the blog post
    const blog = await prisma.blog.findUnique({
      where: { slug }
    });

    if (!blog) {
      return NextResponse.json(
        { success: false, error: 'Blog post not found' },
        { status: 404 }
      );
    }

    // Check if user has bookmarked this blog
    const existingBookmark = await prisma.blogBookmark.findUnique({
      where: {
        blogId_userId: {
          blogId: blog.id,
          userId: userId
        }
      }
    });

    return NextResponse.json({
      success: true,
      bookmarked: !!existingBookmark
    });

  } catch (error) {
    console.error('Error checking blog bookmark status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to check bookmark status' },
      { status: 500 }
    );
  }
}
