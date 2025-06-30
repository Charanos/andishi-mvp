import { jwtVerify } from 'jose';
import { UserRole } from '@/types/auth';
import { NextRequest, NextResponse } from 'next/server';

// Routes that require authentication (support pattern matching)
const protectedRoutes = [
  { path: '/admin-dashboard', roles: [UserRole.ADMIN] },
  { path: '/client-dashboard', roles: [UserRole.CLIENT, UserRole.ADMIN] },
  { path: '/developer-dashboard', roles: [UserRole.DEVELOPER, UserRole.ADMIN] },
];

// Public routes that don't require authentication
const publicRoutes = [
  '/',
  '/login',
  '/about-us',
  '/contact-us',
  '/our-portfolio',
  '/tech-talent-pool',
  '/join-talent-pool',
  '/start-project',
  '/thank-you-join-talent-pool',
  '/thank-you-start-project',
  '/thanks',
  '/blogs',
  '/project-details',
  '/featured-blog',
  '/api/auth/login',
  '/api/auth/verify',
  '/api/join-talent-pool',
  '/api/start-project',
  '/api/developer-profiles',
];

// Auth routes (login, register, etc.)
const authRoutes = ['/login', '/register', '/forgot-password', '/reset-password'];

// Helper function to check if a route is public or a static asset
// Regex for static assets that should never hit auth logic
const staticFileRegex = /\.(?:png|jpe?g|gif|svg|webp|ico|txt|xml|json|css|js|map)$/i;


// Determine if a request path should skip authentication
const isPublicRoute = (path: string): boolean => {

  // 1) Any explicitly whitelisted route (exact or as prefix for nested paths)
  const matchesWhitelist = publicRoutes.some(r => path === r || path.startsWith(`${r}/`));

  // 2) Any static asset matched by extension
  const isStaticAsset = staticFileRegex.test(path);

  return matchesWhitelist || isStaticAsset;
};

// Helper function to get token from request
const getToken = (request: NextRequest): string | null => {
  // Try Authorization header first
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // Then try cookie
  const token = request.cookies.get('auth_token')?.value;
  return token || null;
};

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Allow public routes
  if (isPublicRoute(path)) {
    return NextResponse.next();
  }

  try {
    const token = getToken(request);

    if (!token) {
      throw new Error('No token found');
    }

    // Get JWT secret from environment
    const secretValue = process.env.JWT_SECRET || process.env.NEXT_PUBLIC_JWT_SECRET;
    if (!secretValue) {
      console.error('JWT_SECRET not configured');
      throw new Error('Server configuration error');
    }

    // Verify JWT token
    const secret = new TextEncoder().encode(secretValue);
    const { payload } = await jwtVerify(token, secret);

    // Add user info to headers for downstream use
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('user-email', payload.email as string);
    requestHeaders.set('user-role', payload.role as string);

    // Create response with token cookie
    const response = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });

    // Refresh token cookie
    response.cookies.set({
      name: 'auth_token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 // 7 days
    });

    return response;

  } catch (error) {
    console.error('Auth middleware error:', error);
    
    // Redirect to login for non-API routes
    if (!path.startsWith('/api/')) {
      const url = new URL('/login', request.url);
      url.searchParams.set('from', request.nextUrl.pathname);
      return NextResponse.redirect(url);
    }

    // Return 401 for API routes
    return new NextResponse(
      JSON.stringify({ success: false, error: 'Authentication required' }),
      {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

export const config = {
  matcher: [
    '/admin-dashboard/:path*',
    '/client-dashboard/:path*',
    '/developer-dashboard/:path*',
  ],
};