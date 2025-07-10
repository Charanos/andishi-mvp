
import { SignJWT } from 'jose';
import { User } from '@/types/auth';
import clientPromise from '@/lib/mongodb';
import bcrypt from 'bcryptjs';
import { NextRequest, NextResponse } from 'next/server';

const allowedOrigins = [
  'https://andishi-mvp.vercel.app',
  'https://andishi.dev',
  'http://localhost:3000',
  'http://localhost:3001',
];

const corsHeaders = {
  'Access-Control-Allow-Origin': allowedOrigins.join(','),
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, { headers: corsHeaders });
}

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Validate input
    if (!email || !password) {
      return new NextResponse(
        JSON.stringify({ error: 'Email and password are required' }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Try to fetch user from database
    const client = await clientPromise;
    const db = client.db();
    let user: any = await db.collection('users').findOne({ email: email.toLowerCase() });

    if (!user) {
      return new NextResponse(
        JSON.stringify({ error: 'Invalid credentials' }),
        { status: 401, headers: corsHeaders }
      );
    }

    // Validate password
    let passwordValid = false;
    if (user?.password) {
      // DB user – compare hashed password
      passwordValid = await bcrypt.compare(password, user.password);
    }

    if (!passwordValid) {
      return new NextResponse(
        JSON.stringify({ error: 'Invalid credentials' }),
        { status: 401, headers: corsHeaders }
      );
    }

    // Check if user is active
    if (!user.isActive) {
      return new NextResponse(
        JSON.stringify({ error: 'Account is deactivated' }),
        { status: 403, headers: corsHeaders }
      );
    }

    // Create JWT token
    const token = await createJWTToken(user);

    // Create response
    const response = new NextResponse(JSON.stringify({
      user: {
        id: user._id?.toString() ?? user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isActive: user.isActive
      },
      token
    }), { status: 200, headers: corsHeaders });

    // Set cookie (optional - for middleware)
    // Store the token in an httpOnly cookie that is valid for the entire site
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;

  } catch (error) {
    console.error('Login error:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Login failed' }),
      { status: 500, headers: corsHeaders }
    );
  }
}

async function createJWTToken(user: User): Promise<string> {
  const secret = new TextEncoder().encode(
    process.env.JWT_SECRET || 'your-secret-key-for-development'
  );

  const token = await new SignJWT({
    userId: (user as any)._id ? (user as any)._id.toString() : (user as any).id,
    email: user.email,
    role: user.role,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret);

  return token;
}
