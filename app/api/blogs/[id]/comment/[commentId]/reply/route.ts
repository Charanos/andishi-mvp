import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAuthToken } from '@/lib/auth-utils';

// POST /api/blogs/[id]/comment/[commentId]/reply - Reply to a comment
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
        console.warn('Invalid auth token for comment reply');
      }
    }
    
    // Get content and guest name from request body
    let content = '';
    let providedGuestName = '';
    
    try {
      const body = await request.json();
      content = body.content || '';
      providedGuestName = body.guestName || '';
    } catch (err) {
      // If there's no body or it's invalid, we'll handle it in the validation below
      console.warn('No valid body provided for comment reply');
    }
    
    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Reply content is required' },
        { status: 400 }
      );
    }
    
    // If no authenticated user, use provided guest name or default to 'Anonymous'
    if (!userId) {
      guestName = providedGuestName || 'Anonymous';
    }
    
    // Create the reply
    const replyData: any = {
      commentId,
      content: content.trim()
    };
    
    // Set userId if authenticated, otherwise set guestName
    if (userId) {
      replyData.userId = userId;
    } else {
      replyData.guestName = guestName;
    }
    
    const reply = await prisma.commentReply.create({
      data: replyData,
      include: {
        user: true
      }
    });
    
    // Format the reply for the response
    const formattedReply = {
      id: reply.id,
      content: reply.content,
      createdAt: reply.createdAt,
      author: reply.guestName || (reply.user ? reply.user.name : 'Anonymous'),
      authorTitle: 'Commenter',
      likes: 0
    };
    
    return NextResponse.json({
      success: true,
      data: formattedReply,
      message: 'Reply added successfully'
    });
  } catch (error) {
    console.error('Error replying to comment:', error);
    return NextResponse.json({ success: false, error: 'Failed to add reply' }, { status: 500 });
  }
}
