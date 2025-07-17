import { NextRequest, NextResponse } from "next/server";
import prisma from '@/lib/prisma';

const allowedOrigins = [
  'https://andishi-mvp.vercel.app',
  'https://andishi.dev',
  'http://localhost:3000',
  'http://localhost:3001',
];

const corsHeaders = {
  'Access-Control-Allow-Origin': allowedOrigins.join(','),
  'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Read-only mode configuration
export const dynamic = 'force-dynamic';
const isReadOnly = process.env.READ_ONLY_MODE === 'true' || false;

// Helper function to validate the JWT token and extract user email
async function getAuthenticatedUserEmail(authHeader: string | null): Promise<string> {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Missing or invalid authorization header');
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    if (!payload.email) {
      throw new Error('Invalid token: missing email');
    }
    return payload.email;
  } catch (error) {
    console.error('Error parsing JWT:', error);
    throw new Error('Invalid token format');
  }
}

export async function GET(req: NextRequest) {
  try {
    // Get the user's email from the auth token
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new NextResponse('Unauthorized', { status: 401, headers: corsHeaders });
    }
    
    const token = authHeader.split(' ')[1];
    const userEmail = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString()).email;
    
    // Find the user first
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      include: { developerProfile: true }
    });
    
    if (!user || !user.developerProfile) {
      return new NextResponse(
        JSON.stringify({ error: 'Profile not found' }), 
        { status: 404, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }
    
    const record = user.developerProfile;

    return new NextResponse(JSON.stringify(record.data), { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
  } catch (err) {
    console.error("GET /api/developer-profile error", err);
    return new NextResponse("Internal Server Error", { status: 500, headers: corsHeaders });
  }
}

export async function PUT(req: NextRequest) {
  if (isReadOnly) {
    return new NextResponse("Forbidden", { status: 403, headers: corsHeaders });
  }

  try {
    const payload = await req.json();
    
    // Get the user's email from the auth token
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new NextResponse('Unauthorized', { status: 401, headers: corsHeaders });
    }
    
    const token = authHeader.split(' ')[1];
    const userEmail = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString()).email;
    
    // Ensure the email in the payload matches the authenticated user
    if (payload.personalInfo.email !== userEmail) {
      return new NextResponse('Forbidden: Cannot update another user\'s profile', { status: 403, headers: corsHeaders });
    }

    // Find the user and their developer profile
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      include: { developerProfile: true }
    });

    if (!user || !user.developerProfile) {
      return new NextResponse(
        JSON.stringify({ error: 'Profile not found' }), 
        { status: 404, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Update the existing profile
    const updatedProfile = await prisma.developerProfile.update({
      where: { id: user.developerProfile.id },
      data: { 
        data: payload,
        updatedAt: new Date()
      }
    });
    
    const record = updatedProfile;

    return new NextResponse(JSON.stringify(record.data), { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
  } catch (err) {
    console.error("PUT /api/developer-profile error", err);
    return new NextResponse("Internal Server Error", { status: 500, headers: corsHeaders });
  }
}

// Fallback for unsupported methods
export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}
