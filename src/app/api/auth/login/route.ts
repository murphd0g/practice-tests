import { NextRequest, NextResponse } from 'next/server';
import { comparePasswords, generateToken } from '@/lib/auth';
import { queryOne } from '@/lib/db';
import { User, ApiResponse, AuthResponse } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Missing email or password' } as ApiResponse,
        { status: 400 }
      );
    }

    // Find user
    const user = await queryOne<User>(
      'SELECT id, email, password, name, role, created_at, updated_at FROM users WHERE email = $1',
      [email]
    );

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' } as ApiResponse,
        { status: 401 }
      );
    }

    // Verify password
    const passwordMatch = await comparePasswords(password, user.password || '');
    if (!passwordMatch) {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' } as ApiResponse,
        { status: 401 }
      );
    }

    // Generate token
    const token = generateToken(user);

    const response: ApiResponse<AuthResponse> = {
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' } as ApiResponse,
      { status: 500 }
    );
  }
}
