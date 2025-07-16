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
        return null;
    }
    
    // Use the same JWT secret as login API for consistency
    const secretValue = process.env.JWT_SECRET || 'your-secret-key-for-development';
    if (!secretValue) {
        return null;
    }
    
    const secret = new TextEncoder().encode(secretValue);
    try {
        const { payload } = await jwtVerify(token, secret);
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
        return null;
    }
}
