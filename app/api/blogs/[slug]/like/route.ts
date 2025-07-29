import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/getSession';

// POST /api/blogs/[slug]/like - Like or unlike a blog post
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
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

    // Check if user has already liked this blog
    const existingLike = await prisma.blogLike.findUnique({
      where: {
        blogId_userId: {
          blogId: blog.id,
          userId: userId
        }
      }
    });

    if (existingLike) {
      // Unlike - remove the like
      await prisma.blogLike.delete({
        where: {
          blogId_userId: {
            blogId: blog.id,
            userId: userId
          }
        }
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
          userId: userId
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

// GET /api/blogs/[slug]/like - Check if user has liked a blog post
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  if (!slug) {
    return NextResponse.json({ success: false, error: 'Missing blog slug' }, { status: 400 });
  }
  
  try {
    // Get user session
    const session = await getSession(request);
    if (!session || !session.user) {
      return NextResponse.json({ liked: false });
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

    // Check if user has liked this blog
    const existingLike = await prisma.blogLike.findUnique({
      where: {
        blogId_userId: {
          blogId: blog.id,
          userId: userId
        }
      }
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
