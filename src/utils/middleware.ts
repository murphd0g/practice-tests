import { NextRequest, NextResponse } from 'next/server';
import { extractToken, verifyToken, JwtPayload } from '@/lib/auth';

export function withAuth(handler: any) {
  return async (request: NextRequest) => {
    const token = extractToken(request.headers.get('Authorization') || '');

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - No token provided' },
        { status: 401 }
      );
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Invalid token' },
        { status: 401 }
      );
    }

    // Add user to request context
    (request as any).user = payload;

    return handler(request);
  };
}

export function withAdminAuth(handler: any) {
  return async (request: NextRequest) => {
    const token = extractToken(request.headers.get('Authorization') || '');

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - No token provided' },
        { status: 401 }
      );
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Invalid token' },
        { status: 401 }
      );
    }

    if (payload.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    // Add user to request context
    (request as any).user = payload;

    return handler(request);
  };
}
