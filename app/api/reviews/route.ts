import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import prisma from '@/lib/prisma';
import { ReviewType } from '@/types';

// GET /api/reviews - Get all reviews
export async function GET() {
  try {
    const reviews = await prisma.review.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    // Transform the data to match the expected format
    const formattedReviews = reviews.map(review => ({
      ...review,
      createdAt: review.createdAt,
      updatedAt: review.updatedAt
    }));
    
    return NextResponse.json({
      success: true,
      data: formattedReviews
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}

// POST /api/reviews - Create new review (Admin only)
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
    const { name, position, avatar, rating, review, project, featured, timeToHire, keyResult } = body;

    // Validate required fields
    if (!name || !position || !rating || !review || !project) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create new review in database
    const newReview = await prisma.review.create({
      data: {
        name,
        position,
        avatar: avatar || null,
        rating: parseInt(rating.toString()),
        review,
        project,
        featured: featured || false,
        timeToHire: timeToHire || null,
        keyResult: keyResult || null
      }
    });

    // Transform the data to match the expected format
    const formattedReview = {
      ...newReview,
      createdAt: newReview.createdAt,
      updatedAt: newReview.updatedAt
    };

    return NextResponse.json({
      success: true,
      data: formattedReview,
      message: 'Review created successfully'
    });

  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create review' },
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
