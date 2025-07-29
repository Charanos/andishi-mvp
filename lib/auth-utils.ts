import { NextRequest } from 'next/server';
import { User } from '@/types/auth';

export interface AuthResult {
  success: boolean;
  user?: User;
  error?: string;
}

/**
 * Verify authentication token from request headers or cookies
 * Returns user data if valid, null if invalid
 */
export async function verifyAuthToken(request: NextRequest): Promise<AuthResult> {
  try {
    // Try to get token from Authorization header first
    const authHeader = request.headers.get('authorization');
    let token = authHeader?.replace('Bearer ', '');

    // If no token in header, try cookie
    if (!token) {
      token = request.cookies.get('auth_token')?.value;
    }

    if (!token) {
      return {
        success: false,
        error: 'No authentication token found'
      };
    }

    // Decode JWT payload (basic validation - in production use proper JWT verification)
    try {
      const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
      
      // Check token expiration
      if (payload.exp && payload.exp < Date.now() / 1000) {
        return {
          success: false,
          error: 'Token expired'
        };
      }

      // Extract user data from payload
      const user: User = {
        id: payload.id || payload.sub,
        email: payload.email,
        name: payload.name,
        role: payload.role,
        permissions: payload.permissions || [],
        isActive: true,
        createdAt: new Date()
      };

      return {
        success: true,
        user
      };

    } catch (decodeError) {
      console.error('Error decoding JWT:', decodeError);
      return {
        success: false,
        error: 'Invalid token format'
      };
    }

  } catch (error) {
    console.error('Token verification error:', error);
    return {
      success: false,
      error: 'Authentication failed'
    };
  }
}
