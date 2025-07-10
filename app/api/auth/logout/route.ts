import { NextResponse } from 'next/server';

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

export async function OPTIONS() {
  return new NextResponse(null, { headers: corsHeaders });
}

export async function POST() {
  // Clear the auth_token cookie by setting it expired
  const response = new NextResponse(JSON.stringify({ success: true }), { headers: corsHeaders });
  response.cookies.set('auth_token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });
  return response;
}
