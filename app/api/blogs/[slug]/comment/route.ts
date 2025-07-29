import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/getSession';

// POST /api/blogs/[slug]/comment - Add a comment to a blog post
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
    const { content } = await request.json();
    
    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Comment content is required' },
        { status: 400 }
      );
    }
    
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

    // Create the comment
    const comment = await prisma.blogComment.create({
      data: {
        blogId: blog.id,
        userId: userId,
        content: content.trim()
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        ...comment,
        user: {
          id: comment.user.id,
          name: `${comment.user.firstName} ${comment.user.lastName}`,
          email: comment.user.email
        }
      },
      message: 'Comment added successfully'
    });

  } catch (error) {
    console.error('Error adding blog comment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add comment' },
      { status: 500 }
    );
  }
}

// GET /api/blogs/[slug]/comment - Get all comments for a blog post
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  if (!slug) {
    return NextResponse.json({ success: false, error: 'Missing blog slug' }, { status: 400 });
  }
  
  try {
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

    // Get all comments for this blog post
    const comments = await prisma.blogComment.findMany({
      where: {
        blogId: blog.id
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Format comments for response
    const formattedComments = comments.map(comment => ({
      id: comment.id,
      content: comment.content,
      createdAt: comment.createdAt,
      user: {
        id: comment.user.id,
        name: `${comment.user.firstName} ${comment.user.lastName}`,
        email: comment.user.email
      }
    }));

    return NextResponse.json({
      success: true,
      data: formattedComments,
      count: formattedComments.length
    });

  } catch (error) {
    console.error('Error fetching blog comments:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch comments' },
      { status: 500 }
    );
  }
}
