import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/getSession";

export async function GET(req: NextRequest) {
  try {
    // Check environment variables (without exposing sensitive values)
    const envCheck = {
      hasJWTSecret: !!process.env.JWT_SECRET,
      hasDatabaseUrl: !!process.env.DATABASE_URL,
      nodeEnv: process.env.NODE_ENV,
      nextAuthUrl: process.env.NEXTAUTH_URL,
      publicApiUrl: process.env.NEXT_PUBLIC_API_URL,
    };

    // Check for tokens
    const authHeader = req.headers.get('authorization');
    const cookieToken = req.cookies.get('auth_token')?.value;
    
    const tokenCheck = {
      hasAuthHeader: !!authHeader,
      authHeaderPrefix: authHeader?.substring(0, 10) + '...',
      hasCookieToken: !!cookieToken,
      cookieTokenPrefix: cookieToken?.substring(0, 10) + '...',
    };

    // Try to get session
    const session = await getSession(req);
    
    const sessionCheck = {
      hasSession: !!session,
      hasUser: !!session?.user,
      userId: session?.user?.id,
      userRole: session?.user?.role,
      userEmail: session?.user?.email,
    };

    return NextResponse.json({
      environment: envCheck,
      tokens: tokenCheck,
      session: sessionCheck,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}
