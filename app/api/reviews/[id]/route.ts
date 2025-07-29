import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import prisma from '@/lib/prisma';

// GET /api/reviews/[id] - Get specific review
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const review = await prisma.review.findUnique({
      where: { id }
    });

    if (!review) {
      return NextResponse.json(
        { success: false, error: 'Review not found' },
        { status: 404 }
      );
    }

    // Transform the data to match the expected format
    const formattedReview = {
      ...review,
      createdAt: review.createdAt,
      updatedAt: review.updatedAt
    };

    return NextResponse.json({
      success: true,
      data: formattedReview
    });
  } catch (error) {
    console.error('Error fetching review:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch review' },
      { status: 500 }
    );
  }
}

// PUT /api/reviews/[id] - Update review (Admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify admin authentication
    const authResult = await verifyAdminAuth(request);
    if (!authResult.success) {
      return NextResponse.json(
        { success: false, error: authResult.error || 'Unauthorized. Admin access required.' },
        { status: 403 }
      );
    }

    const { id } = await params;
    
    const existingReview = await prisma.review.findUnique({
      where: { id }
    });

    if (!existingReview) {
      return NextResponse.json(
        { success: false, error: 'Review not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { name, position, avatar, rating, review, project, featured, timeToHire, keyResult } = body;

    // Update review in database
    const updatedReview = await prisma.review.update({
      where: { id },
      data: {
        name: name || existingReview.name,
        position: position || existingReview.position,
        avatar: avatar !== undefined ? avatar : existingReview.avatar,
        rating: rating !== undefined ? parseInt(rating.toString()) : existingReview.rating,
        review: review || existingReview.review,
        project: project || existingReview.project,
        featured: featured !== undefined ? featured : existingReview.featured,
        timeToHire: timeToHire || existingReview.timeToHire,
        keyResult: keyResult || existingReview.keyResult
      }
    });

    // Transform the data to match the expected format
    const formattedReview = {
      ...updatedReview,
      createdAt: updatedReview.createdAt,
      updatedAt: updatedReview.updatedAt
    };

    return NextResponse.json({
      success: true,
      data: formattedReview,
      message: 'Review updated successfully'
    });

  } catch (error) {
    console.error('Error updating review:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update review' },
      { status: 500 }
    );
  }
}

// DELETE /api/reviews/[id] - Delete review (Admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify admin authentication
    const authResult = await verifyAdminAuth(request);
    if (!authResult.success) {
      return NextResponse.json(
        { success: false, error: authResult.error || 'Unauthorized. Admin access required.' },
        { status: 403 }
      );
    }

    const { id } = await params;
    
    const existingReview = await prisma.review.findUnique({
      where: { id }
    });

    if (!existingReview) {
      return NextResponse.json(
        { success: false, error: 'Review not found' },
        { status: 404 }
      );
    }

    // Delete from database
    await prisma.review.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'Review deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting review:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete review' },
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
