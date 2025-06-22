import { NextResponse } from 'next/server';

export async function POST() {
  // Clear the auth_token cookie by setting it expired
  const response = NextResponse.json({ success: true });
  response.cookies.set('auth_token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });
  return response;
}
