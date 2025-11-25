import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuth } from '@/utils/middleware';
import pool, { query } from '@/lib/db';
import { Question, QuestionOption, ApiResponse } from '@/types';

// Helper: fetch a single question with options
async function getQuestionById(id: string) {
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
    WHERE q.id = $1
    GROUP BY q.id
  `;

  const rows = await query<Question & { options: QuestionOption[] }>(sql, [id]);
  return rows.length > 0 ? rows[0] : null;
}

// GET - fetch a question by id
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function GET(request: NextRequest, context: any) {
  try {
    const { id } = context.params as { id: string };
    const question = await getQuestionById(id);
    if (!question) {
      return NextResponse.json({ success: false, error: 'Question not found' } as ApiResponse, { status: 404 });
    }
    return NextResponse.json({ success: true, data: question } as ApiResponse);
  } catch (error) {
    console.error('Get question by id error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' } as ApiResponse, { status: 500 });
  }
}

// PUT - update a question and its options (admin only)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function PUT(request: NextRequest, context: any) {
  return withAdminAuth(async (req: NextRequest) => {
    const client = await pool.connect();
    try {
      const { id } = context.params as { id: string };
      const body = await req.json();
      const { title, description, category, difficulty, options, correctAnswerValue, explanation } = body;

      if (!title || !category || !difficulty || !options || !Array.isArray(options)) {
        return NextResponse.json({ success: false, error: 'Missing required fields' } as ApiResponse, { status: 400 });
      }

      await client.query('BEGIN');

      const updateSql = `
        UPDATE questions SET title = $1, description = $2, category = $3, difficulty = $4, explanation = $5, updated_at = NOW()
        WHERE id = $6
        RETURNING id, title, description, category, difficulty, explanation, created_by as "createdBy", created_at as "createdAt", updated_at as "updatedAt"
      `;

      const updateRes = await client.query(updateSql, [title, description || '', category, difficulty, explanation || '', id]);
      const updatedQuestion = updateRes.rows[0] as Question & { options: QuestionOption[]; correctAnswerId?: string };

      // Delete existing options for this question
      await client.query('DELETE FROM question_options WHERE question_id = $1', [id]);

      // Insert updated options
      const optionInserts: QuestionOption[] = [];
      let correctOptionId: string | undefined;
      for (const opt of options) {
        const optInsert = await client.query(
          `INSERT INTO question_options (question_id, text, value, created_at, is_correct) VALUES ($1, $2, $3, NOW(), $4) RETURNING id, text, value, created_at as "createdAt", is_correct`,
          [id, opt.text, opt.value, opt.value === correctAnswerValue]
        );
        const inserted = optInsert.rows[0] as QuestionOption;
        optionInserts.push(inserted);
        if (opt.value === correctAnswerValue) correctOptionId = String(inserted.id as unknown as string);
      }

      await client.query('COMMIT');

      updatedQuestion.options = optionInserts;
      updatedQuestion.correctAnswerId = correctOptionId || '';

      return NextResponse.json({ success: true, data: updatedQuestion } as ApiResponse);
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Update question error:', error);
      return NextResponse.json({ success: false, error: 'Internal server error' } as ApiResponse, { status: 500 });
    } finally {
      client.release();
    }
  })(request);
}

// DELETE - remove a question (admin only)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function DELETE(request: NextRequest, context: any) {
  return withAdminAuth(async () => {
    try {
      const { id } = context.params as { id: string };
      const deleteRes = await query(`DELETE FROM questions WHERE id = $1 RETURNING id`, [id]);
      if (!deleteRes || deleteRes.length === 0) {
        return NextResponse.json({ success: false, error: 'Question not found' } as ApiResponse, { status: 404 });
      }
      return NextResponse.json({ success: true, data: { id } } as ApiResponse);
    } catch (error) {
      console.error('Delete question error:', error);
      return NextResponse.json({ success: false, error: 'Internal server error' } as ApiResponse, { status: 500 });
    }
  })(request);
}
