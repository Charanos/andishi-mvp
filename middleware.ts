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
  "/",
  "/about-us",
  "/contact-us",
  "/our-portfolio",
  "/start-project",
   "/featured-blog",
  "/tech-talent-pool",
  "/join-talent-pool",
  "/thank-you-start-project",
  "/thank-you-join-talent-pool",
  "/privacy-policy",
  "/terms-of-service",
  "/blogs",
];

// Auth routes (login, register, etc.)
const authRoutes = ['/login', '/register', '/forgot-password', '/reset-password'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('auth_token')?.value || 
                request.headers.get('authorization')?.replace('Bearer ', '');
  
  // Allow auth routes without token
  if (authRoutes.includes(pathname)) {
    if (token) {
      try {
        const { payload } = await verifyToken(token);
        const userRole = payload.role as UserRole;

        // Map role to dashboard route
        const dashboardMap: Record<UserRole, string> = {
          [UserRole.ADMIN]: '/admin-dashboard',
          [UserRole.CLIENT]: '/client-dashboard',
          [UserRole.DEVELOPER]: '/developer-dashboard',
        } as const;

        const target = dashboardMap[userRole] ?? '/';
        return NextResponse.redirect(new URL(target, request.url));
      } catch (error) {
        // Invalid token – allow access to auth routes
        return NextResponse.next();
      }
    }
    return NextResponse.next();
  }
  
  // Allow public routes
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }
  
  // Check if route requires authentication
  const protectedRoute = protectedRoutes.find(route => 
    pathname.startsWith(route.path)
  );
  
  if (protectedRoute) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    
    try {
      const { payload } = await verifyToken(token);
      const userRole = payload.role as UserRole;
      
      // Admin has access to all protected routes
      if (userRole === UserRole.ADMIN) {
        return NextResponse.next();
      }
      
      // For non-admin users, check specific role requirements
      if (!protectedRoute.roles.includes(userRole)) {
        return NextResponse.redirect(new URL('/unauthorized', request.url));
      }
      
    } catch (error) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }
  
  // If trying to access start-project page and user is logged in as client
  if (pathname === '/start-project') {
    if (token) {
      try {
        // Verify JWT token
        const secret = new TextEncoder().encode(
          process.env.JWT_SECRET || 'your-secret-key-for-development'
        );
        const { payload } = await jwtVerify(token, secret);
        
        // If user is a client, redirect to client dashboard
        if (payload.role === 'CLIENT') {
          return NextResponse.redirect(new URL('/client-dashboard', request.url));
        }
      } catch (error) {
        console.error('Token verification error:', error);
      }
    }
  }
  
  return NextResponse.next();
}

async function verifyToken(token: string) {
  const secretValue = process.env.JWT_SECRET || process.env.NEXT_PUBLIC_JWT_SECRET || 'your-secret-key-for-development';
  const secret = new TextEncoder().encode(secretValue);
  return await jwtVerify(token, secret);
}

export const config = {
  matcher: [
    // Match all routes except static files and API routes
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    '/start-project',
    '/client-dashboard/:path*',
    '/developer-dashboard/:path*',
    '/admin-dashboard/:path*'
  ]
};