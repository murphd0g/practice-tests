import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuth } from '@/utils/middleware';
import { query, queryOne } from '@/lib/db';
import { Question, ApiResponse } from '@/types';

// GET all questions
export async function GET(request: NextRequest) {
  try {
    const questions = await query<Question>(
      `SELECT id, title, description, category, difficulty, created_at, updated_at
       FROM questions
       ORDER BY created_at DESC`
    );

    return NextResponse.json({
      success: true,
      data: questions,
    } as ApiResponse);
  } catch (error) {
    console.error('Get questions error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' } as ApiResponse,
      { status: 500 }
    );
  }
}

// POST - Create new question (admin only)
export async function POST(request: NextRequest) {
  return withAdminAuth(async (req: NextRequest) => {
    try {
      const body = await req.json();
      const { title, description, category, difficulty, options, correctAnswerId, explanation } =
        body;
      const user = (req as any).user;

      // Validation
      if (!title || !category || !difficulty || !options || !correctAnswerId) {
        return NextResponse.json(
          { success: false, error: 'Missing required fields' } as ApiResponse,
          { status: 400 }
        );
      }

      // Create question
      const questions = await query<Question>(
        `INSERT INTO questions (title, description, category, difficulty, created_by, explanation, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
         RETURNING id, title, description, category, difficulty, created_at, updated_at`,
        [title, description || '', category, difficulty, user.userId, explanation || '']
      );

      const newQuestion = questions[0];

      return NextResponse.json(
        {
          success: true,
          data: newQuestion,
        } as ApiResponse,
        { status: 201 }
      );
    } catch (error) {
      console.error('Create question error:', error);
      return NextResponse.json(
        { success: false, error: 'Internal server error' } as ApiResponse,
        { status: 500 }
      );
    }
  })(request);
}
