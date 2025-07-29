import { NextRequest } from 'next/server';
import { verifyAuthToken } from '@/lib/auth-utils';

export async function verifyAdminAuth(request: NextRequest) {
  try {
    // Verify authentication token using existing utility
    const authResult = await verifyAuthToken(request);
    
    if (!authResult.success) {
      return { success: false, error: authResult.error || 'Authentication failed' };
    }
    
    const user = authResult.user;
    
    // Check if user has admin role
    if (!user || user.role !== 'admin') {
      return { success: false, error: 'Admin access required' };
    }

    return { success: true, user };
  } catch (error) {
    console.error('Admin auth verification error:', error);
    return { success: false, error: 'Authentication failed' };
  }
}
