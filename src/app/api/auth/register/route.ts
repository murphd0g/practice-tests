import { NextRequest, NextResponse } from 'next/server';
import { hashPassword, generateToken } from '@/lib/auth';
import { query, queryOne } from '@/lib/db';
import { User, ApiResponse, AuthResponse } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name } = body;

    // Validation
    if (!email || !password || !name) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' } as ApiResponse,
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await queryOne(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'User already exists' } as ApiResponse,
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const users = await query<User>(
      `INSERT INTO users (email, password, name, role, created_at, updated_at)
       VALUES ($1, $2, $3, $4, NOW(), NOW())
       RETURNING id, email, name, role, created_at, updated_at`,
      [email, hashedPassword, name, 'user']
    );

    const user = users[0];

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

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' } as ApiResponse,
      { status: 500 }
    );
  }
}
