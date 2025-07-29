import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAuthToken } from '@/lib/auth-utils';

// POST /api/blogs/[id]/comment/[commentId]/like - Like a comment
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; commentId: string }> }
) {
  const { id, commentId } = await params;
  
  if (!id || !commentId) {
    return NextResponse.json({ success: false, error: 'Missing blog id or comment id' }, { status: 400 });
  }
  
  try {
    // Check if the comment exists
    const comment = await prisma.blogComment.findUnique({
      where: { id: commentId }
    });
    
    if (!comment) {
      return NextResponse.json({ success: false, error: 'Comment not found' }, { status: 404 });
    }
    
    // Check if the blog post exists
    const blog = await prisma.blog.findUnique({
      where: { id }
    });
    
    if (!blog) {
      return NextResponse.json({ success: false, error: 'Blog post not found' }, { status: 404 });
    }
    
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
        console.warn('Invalid auth token for comment like');
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
    
    // Check if like already exists
    const existingLike = await prisma.commentLike.findUnique({
      where: userId 
        ? { commentId_userId: { commentId, userId } }
        : { commentId_guestName: { commentId, guestName: guestName || 'Anonymous' } }
    });
    
    if (existingLike) {
      // Unlike the comment
      await prisma.commentLike.delete({
        where: { id: existingLike.id }
      });
      
      return NextResponse.json({
        success: true,
        data: { liked: false },
        message: 'Comment unliked successfully'
      });
    }
    
    // Create the like
    const like = await prisma.commentLike.create({
      data: {
        commentId,
        ...(userId ? { userId } : { guestName: guestName || 'Anonymous' })
      }
    });
    
    return NextResponse.json({
      success: true,
      data: { 
        liked: true,
        like
      },
      message: 'Comment liked successfully'
    });
  } catch (error) {
    console.error('Error liking comment:', error);
    return NextResponse.json({ success: false, error: 'Failed to like comment' }, { status: 500 });
  }
}
