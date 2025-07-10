
import { jwtVerify } from 'jose';
import clientPromise from '@/lib/mongodb';
import { NextRequest, NextResponse } from 'next/server';

const allowedOrigins = [
  'https://andishi-mvp.vercel.app',
  'https://andishi.dev',
  'http://localhost:3000',
  'http://localhost:3001',
];

const corsHeaders = {
  'Access-Control-Allow-Origin': allowedOrigins.join(','),
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, { headers: corsHeaders });
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
        { status: 401, headers: corsHeaders }
      );
    }

    // Get JWT secret from environment
    const secretValue = process.env.JWT_SECRET || process.env.NEXT_PUBLIC_JWT_SECRET;
    if (!secretValue) {
      console.error('JWT_SECRET not configured');
      return new NextResponse(
        JSON.stringify({ success: false, error: 'Server configuration error' }),
        { status: 500, headers: corsHeaders }
      );
    }

    // Verify JWT token
    const secret = new TextEncoder().encode(secretValue);
    const { payload } = await jwtVerify(token, secret);
    
    // Get user data from payload
    const userEmail = payload.email as string;

    const client = await clientPromise;
    const db = client.db();
    const user = await db.collection('users').findOne({ email: userEmail });

    if (!user || !user.isActive) {
      return new NextResponse(
        JSON.stringify({ success: false, error: 'Invalid or inactive user' }),
        { status: 401, headers: corsHeaders }
      );
    }

    // Create response with user data
    const response = new NextResponse(
      JSON.stringify({
        success: true,
        data: {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
          isActive: user.isActive,
          permissions: user.permissions
        }
      }),
      { status: 200, headers: corsHeaders }
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
      { status: 401, headers: corsHeaders }
    );
  }
}
