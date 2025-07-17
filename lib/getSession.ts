import { jwtVerify } from 'jose';
import { NextRequest } from 'next/server';

export interface SessionUser {
    id: string;
    email: string;
    role: string;
    status?: string;
    name?: string; // Add name to SessionUser interface
}

export interface Session {
    user: SessionUser;
}

function getToken(request: NextRequest): string | null {
    const authHeader = request.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
        return authHeader.substring(7);
    }
    const token = request.cookies.get('auth_token')?.value;
    return token || null;
}

export async function getSession(request: NextRequest): Promise<Session | null> {
    const token = getToken(request);
    if (!token) {
        console.error('getSession: No token found');
        return null;
    }
    
    // Use the same JWT secret as login API for consistency
    const secretValue = process.env.JWT_SECRET;
    if (!secretValue) {
        console.error('getSession: JWT_SECRET not found in environment');
        return null;
    }
    
    const secret = new TextEncoder().encode(secretValue);
    try {
        const { payload } = await jwtVerify(token, secret);
        
        // Validate required fields
        if (!payload.userId || !payload.email || !payload.role) {
            console.error('getSession: Missing required fields in token payload');
            return null;
        }
        
        return {
            user: {
                id: payload.userId as string,
                email: payload.email as string,
                role: payload.role as string,
                status: payload.status as string | undefined,
                name: payload.name as string | undefined, // Include name from payload
            },
        };
    } catch (error) {
        console.error('getSession: JWT verification failed:', error instanceof Error ? error.message : String(error));
        return null;
    }
}
