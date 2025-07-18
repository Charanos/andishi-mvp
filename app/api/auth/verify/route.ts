
import { jwtVerify } from 'jose';
import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

const allowedOrigins = [
  'https://andishi-mvp.vercel.app',
  'https://andishi.dev',
  'http://localhost:3000',
  'http://localhost:3001',
];

const getCorsHeaders = (request: NextRequest) => {
  const origin = request.headers.get('origin');
  const isAllowed = origin && allowedOrigins.includes(origin);
  return {
    'Access-Control-Allow-Origin': isAllowed ? origin : '',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true',
  };
};

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, { headers: getCorsHeaders(request) });
}

export async function GET(request: NextRequest) {
  try {
    // Try to get token from Authorization header first
    const authHeader = request.headers.get('authorization');
    let token = authHeader?.replace('Bearer ', '');

    // If no token in header, try cookie
    if (!token) {
      token = request.cookies.get('auth_token')?.value; 
    }


    if (!token) {
      return new NextResponse(
        JSON.stringify({ success: false, error: 'No authentication token found' }),
        { status: 401, headers: getCorsHeaders(request) }
      );
    }

    // Get JWT secret from environment
    const secretValue = process.env.JWT_SECRET || process.env.NEXT_PUBLIC_JWT_SECRET;
    if (!secretValue) {
      console.error('JWT_SECRET not configured');
      return new NextResponse(
        JSON.stringify({ success: false, error: 'Server configuration error' }),
        { status: 500, headers: getCorsHeaders(request) }
      );
    }

    // Verify JWT token
    const secret = new TextEncoder().encode(secretValue);
    const { payload } = await jwtVerify(token, secret);
    
    // Get user data from payload
    const userEmail = payload.email as string;

    const user = await prisma.user.findUnique({ 
      where: { email: userEmail } 
    });

    if (!user || !user.isActive) {
      return new NextResponse(
        JSON.stringify({ success: false, error: 'Invalid or inactive user' }),
        { status: 401, headers: getCorsHeaders(request) }
      );
    }

    // Create response with user data
    const response = new NextResponse(
      JSON.stringify({
        success: true,
        data: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          isActive: user.isActive,
          status: user.status,
          developerProfileStatus: user.developerProfileStatus
        }
      }),
      { status: 200, headers: getCorsHeaders(request) }
    );

    // Set cookie in response to ensure it persists
    response.cookies.set({
      name: 'auth_token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      // Set max age to 7 days
      maxAge: 7 * 24 * 60 * 60
    });

    return response;

  } catch (error) {
    console.error('Token verification error:', error);
    return new NextResponse(
      JSON.stringify({ success: false, error: 'Invalid or expired token' }),
      { status: 401, headers: getCorsHeaders(request) }
    );
  }
}
