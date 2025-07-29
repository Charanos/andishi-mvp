import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAuthToken } from '@/lib/auth-utils';

// POST /api/blogs/[id]/like - Like or unlike a blog post
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ success: false, error: 'Missing blog id' }, { status: 400 });
  }
  
  try {
    // Get the user from the auth token if available
    let userId: string | null = null;
    let guestName: string | null = null;
    
    const authHeader = request.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      try {
        // For anonymous users, we don't have a token, so we'll handle that case
        // The verifyAuthToken function expects a NextRequest, but we're checking
        // for a Bearer token in the header first
        const authResult = await verifyAuthToken(request);
        if (authResult.success && authResult.user) {
          userId = authResult.user.id;
        }
      } catch (err) {
        // If token is invalid, continue as anonymous user
        console.warn('Invalid auth token for blog like');
      }
    }
    
    // If no authenticated user, get guest name from request body
    if (!userId) {
      try {
        const body = await request.json();
        guestName = body.guestName || 'Anonymous';
      } catch (err) {
        // If there's no body or it's invalid, default to Anonymous
        guestName = 'Anonymous';
      }
    }
    
    // Find the blog post
    const blog = await prisma.blog.findUnique({
      where: { id }
    });

    if (!blog) {
      return NextResponse.json(
        { success: false, error: 'Blog post not found' },
        { status: 404 }
      );
    }

    // Check if user has already liked this blog
    const existingLike = await prisma.blogLike.findUnique({
      where: userId 
        ? { blogId_userId: { blogId: blog.id, userId } }
        : { blogId_guestName: { blogId: blog.id, guestName: guestName || 'Anonymous' } }
    });

    if (existingLike) {
      // Unlike - remove the like
      await prisma.blogLike.delete({
        where: { id: existingLike.id }
      });
      
      // Decrement blog likes count
      const updatedBlog = await prisma.blog.update({
        where: { id: blog.id },
        data: {
          likes: {
            decrement: 1
          }
        }
      });
      
      return NextResponse.json({
        success: true,
        data: {
          liked: false,
          likes: updatedBlog.likes
        },
        message: 'Blog unliked successfully'
      });
    } else {
      // Like - create new like
      await prisma.blogLike.create({
        data: {
          blogId: blog.id,
          ...(userId ? { userId } : { guestName: guestName || 'Anonymous' })
        }
      });
      
      // Increment blog likes count
      const updatedBlog = await prisma.blog.update({
        where: { id: blog.id },
        data: {
          likes: {
            increment: 1
          }
        }
      });
      
      return NextResponse.json({
        success: true,
        data: {
          liked: true,
          likes: updatedBlog.likes
        },
        message: 'Blog liked successfully'
      });
    }

  } catch (error) {
    console.error('Error processing blog like:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process like' },
      { status: 500 }
    );
  }
}

// GET /api/blogs/[id]/like - Check if user has liked a blog post
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ success: false, error: 'Missing blog id' }, { status: 400 });
  }
  
  try {
    // Get the user from the auth token if available
    let userId: string | null = null;
    let guestName: string | null = null;
    
    const authHeader = request.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      try {
        // For anonymous users, we don't have a token, so we'll handle that case
        // The verifyAuthToken function expects a NextRequest, but we're checking
        // for a Bearer token in the header first
        const authResult = await verifyAuthToken(request);
        if (authResult.success && authResult.user) {
          userId = authResult.user.id;
        }
      } catch (err) {
        // If token is invalid, continue as anonymous user
        console.warn('Invalid auth token for blog like check');
      }
    }
    
    // If no authenticated user, we'll check with a default guest name
    if (!userId) {
      guestName = 'Anonymous';
    }
    
    // Find the blog post
    const blog = await prisma.blog.findUnique({
      where: { id }
    });

    if (!blog) {
      return NextResponse.json(
        { success: false, error: 'Blog post not found' },
        { status: 404 }
      );
    }

    // Check if user has liked this blog
    const existingLike = await prisma.blogLike.findUnique({
      where: userId 
        ? { blogId_userId: { blogId: blog.id, userId } }
        : { blogId_guestName: { blogId: blog.id, guestName: guestName || 'Anonymous' } }
    });

    return NextResponse.json({
      success: true,
      liked: !!existingLike
    });

  } catch (error) {
    console.error('Error checking blog like status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to check like status' },
      { status: 500 }
    );
  }
}
