import { jwtVerify } from 'jose';
import { UserRole } from '@/types/auth';
import clientPromise from '@/lib/mongodb';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 401 }
      );
    }

    // Verify JWT token
    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET || 'your-secret-key-for-development'
    );

    const { payload } = await jwtVerify(token, secret);
    
    // Get user data from payload
    const userEmail = payload.email as string;

    const client = await clientPromise;
    const db = client.db();
    let user: any = await db.collection('users').findOne({ email: userEmail });

    if (!user || !user.isActive) {
      return NextResponse.json(
        { error: 'Invalid or inactive user' },
        { status: 401 }
      );
    }

    // Return user data
    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      isActive: user.isActive,
      permissions: user.permissions
    });

  } catch (error) {
    console.error('Token verification error:', error);
    return NextResponse.json(
      { error: 'Invalid token' },
      { status: 401 }
    );
  }
}