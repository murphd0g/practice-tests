import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuth } from '@/utils/middleware';
import pool, { query } from '@/lib/db';
import { Question, QuestionOption, ApiResponse } from '@/types';
import { JwtPayload } from '@/lib/auth';

interface NewOptionInput {
  text: string;
  value: string;
}

// GET all questions (with options)
export async function GET() {
  try {
    const sql = `
      SELECT q.id,
             q.title,
             q.description,
             q.category,
             q.difficulty,
             q.explanation,
             q.created_by as "createdBy",
             q.created_at as "createdAt",
             q.updated_at as "updatedAt",
             COALESCE(json_agg(json_build_object(
               'id', qo.id,
               'text', qo.text,
               'value', qo.value,
               'isCorrect', qo.is_correct,
               'createdAt', qo.created_at
             )) FILTER (WHERE qo.id IS NOT NULL), '[]') as options
      FROM questions q
      LEFT JOIN question_options qo ON qo.question_id = q.id
      GROUP BY q.id
      ORDER BY q.created_at DESC
    `;

    const questions = await query<Question & { options: QuestionOption[] }>(sql);

    return NextResponse.json({ success: true, data: questions } as ApiResponse);
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
    const client = await pool.connect();
    try {
      const body = await req.json();
      const { title, description, category, difficulty, options, correctAnswerValue, explanation } = body;
      const user = (req as NextRequest & { user: JwtPayload }).user;

      // Validation
      if (!title || !category || !difficulty || !options || !Array.isArray(options) || options.length === 0) {
        return NextResponse.json(
          { success: false, error: 'Missing required fields' } as ApiResponse,
          { status: 400 }
        );
      }

      // Transaction - create question and insert options
      await client.query('BEGIN');

      const insertQuestionSql = `
        INSERT INTO questions (title, description, category, difficulty, created_by, explanation, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
        RETURNING id, title, description, category, difficulty, explanation, created_by as "createdBy", created_at as "createdAt", updated_at as "updatedAt"
      `;

      const resQuestion = await client.query(insertQuestionSql, [
        title,
        description || '',
        category,
        difficulty,
        user.userId,
        explanation || '',
      ]);

      const newQuestion = resQuestion.rows[0] as Question & { options: QuestionOption[]; correctAnswerValue?: string | null; correctAnswerId?: string };

      // Insert options
      const optionInserts: QuestionOption[] = [];
      let correctOptionId: string | undefined;
      const optionInputs = options as NewOptionInput[];
      for (const optInput of optionInputs) {
        const optRes = await client.query(
          `INSERT INTO question_options (question_id, text, value, created_at, is_correct) VALUES ($1, $2, $3, NOW(), $4) RETURNING id, text, value, created_at as "createdAt", is_correct`,
          [newQuestion.id, optInput.text, optInput.value, optInput.value === correctAnswerValue]
        );
        const insertedOpt = optRes.rows[0] as QuestionOption;
        optionInserts.push(insertedOpt);

        if (optInput.value === correctAnswerValue) {
          correctOptionId = String(insertedOpt.id);
        }
      }

      // Commit transaction
      await client.query('COMMIT');

      newQuestion.options = optionInserts;
      newQuestion.correctAnswerId = correctOptionId || '';

      return NextResponse.json({ success: true, data: newQuestion } as ApiResponse, { status: 201 });
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Create question error:', error);
      return NextResponse.json(
        { success: false, error: 'Internal server error' } as ApiResponse,
        { status: 500 }
      );
    } finally {
      client.release();
    }
  })(request);
}
