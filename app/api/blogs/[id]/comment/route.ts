import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// POST /api/blogs/[id]/comment - Add a comment to a blog post
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ success: false, error: 'Missing blog id' }, { status: 400 });
  }
  
  try {
    const { content, author, userId } = await request.json();
    
    // For anonymous comments, generate a guest name
    // For authenticated comments, userId should be provided by the client
    const guestName = !userId && author ? author : null;
    
    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Comment content is required' },
        { status: 400 }
      );
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

    // Create the comment
    const commentData: any = {
      blogId: blog.id,
      content: content.trim()
    };
    
    // Set userId if provided (for authenticated users)
    if (userId) {
      commentData.userId = userId;
    }
    
    // Set guestName if this is an anonymous comment with a provided name
    if (guestName) {
      commentData.guestName = guestName;
    }
    
    const comment = await prisma.blogComment.create({
      data: commentData
    });

    return NextResponse.json({
      success: true,
      data: {
        id: comment.id,
        content: comment.content,
        createdAt: comment.createdAt,
        author: comment.guestName || 'Anonymous',
        authorTitle: 'Commenter',
        likes: 0,
        user: {
          id: comment.userId || null,
          name: comment.guestName || 'Anonymous',
          email: null
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

// GET /api/blogs/[id]/comment - Get all comments for a blog post
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ success: false, error: 'Missing blog id' }, { status: 400 });
  }
  
  try {
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

    // Fetch all comments for this blog post with likes and replies
    const comments = await prisma.blogComment.findMany({
      where: { blogId: id },
      include: {
        user: true,
        likes: true,
        replies: {
          include: {
            user: true
          },
          orderBy: {
            createdAt: 'asc'
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
      author: comment.guestName || (comment.user ? comment.user.name : 'Anonymous'),
      authorTitle: 'Commenter',
      likes: comment.likes.length,
      user: {
        id: comment.userId || null,
        name: comment.guestName || (comment.user ? comment.user.name : 'Anonymous'),
        email: null
      },
      replies: comment.replies.map(reply => ({
        id: reply.id,
        content: reply.content,
        createdAt: reply.createdAt,
        author: reply.guestName || (reply.user ? reply.user.name : 'Anonymous'),
        authorTitle: 'Commenter',
        likes: 0
      }))
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