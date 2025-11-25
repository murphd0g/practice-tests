/* eslint-disable */
require('dotenv').config();
const { Pool } = require('pg');

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://localhost:5432/practice_tests_db';
const pool = new Pool({ connectionString: DATABASE_URL, ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false });

const adminUserId = 1; // default admin user created earlier

const questions = [
  {
    title: 'What is the term for a group of kittens?',
    description: '',
    category: 'Cats',
    difficulty: 'easy',
    options: [
      { text: 'Clowder', value: 'A' },
      { text: 'Litter', value: 'B' },
      { text: 'Kindle', value: 'C' },
      { text: 'Pack', value: 'D' }
    ],
    correctValue: 'B',
    explanation: 'A group of kittens is called a litter. A clowder is a group of adult cats.'
  },
  {
    title: 'How many lives are cats traditionally said to have?',
    description: '',
    category: 'Cats',
    difficulty: 'easy',
    options: [
      { text: 'Seven', value: 'A' },
      { text: 'Eight', value: 'B' },
      { text: 'Nine', value: 'C' },
      { text: 'Ten', value: 'D' }
    ],
    correctValue: 'C',
    explanation: "Mythically, a cat has nine lives.",
  },
  {
    title: 'Which body part helps cats balance and communicate?',
    description: '',
    category: 'Cats',
    difficulty: 'easy',
    options: [
      { text: 'Tail', value: 'A' },
      { text: 'Front paws', value: 'B' },
      { text: 'Ears', value: 'C' },
      { text: 'Whiskers', value: 'D' }
    ],
    correctValue: 'A',
    explanation: 'Cats use tails to balance and communicate mood/intent.'
  },
  {
    title: 'What is the average lifespan of an indoor cat?',
    description: '',
    category: 'Cats',
    difficulty: 'medium',
    options: [
      { text: '5-7 years', value: 'A' },
      { text: '10-12 years', value: 'B' },
      { text: '13-17 years', value: 'C' },
      { text: '20+ years', value: 'D' }
    ],
    correctValue: 'C',
    explanation: 'Indoor cats often live into their teens, commonly 13-17 years.'
  },
  {
    title: 'What do cats use their whiskers for?',
    description: '',
    category: 'Cats',
    difficulty: 'easy',
    options: [
      { text: 'Smelling', value: 'A' },
      { text: 'Hunting', value: 'B' },
      { text: 'Sensing space and objects', value: 'C' },
      { text: 'Tasting', value: 'D' }
    ],
    correctValue: 'C',
    explanation: "Whiskers help cats sense space and nearby objects, especially in the dark." 
  },
  {
    title: 'Which breed is known for being hairless?',
    description: '',
    category: 'Cats',
    difficulty: 'easy',
    options: [
      { text: 'Persian', value: 'A' },
      { text: 'Siamese', value: 'B' },
      { text: 'Maine Coon', value: 'C' },
      { text: 'Sphynx', value: 'D' }
    ],
    correctValue: 'D',
    explanation: 'The Sphynx is a breed known for lacking fur.'
  },
  {
    title: 'What does a cat often mean by kneading with its paws?',
    description: '',
    category: 'Cats',
    difficulty: 'medium',
    options: [
      { text: 'Preparing food', value: 'A' },
      { text: 'Marking territory', value: 'B' },
      { text: 'Showing contentment', value: 'C' },
      { text: 'Cleaning', value: 'D' }
    ],
    correctValue: 'C',
    explanation: 'Kneading is a sign of comfort and contentment, often carried over from kitten behavior.'
  },
  {
    title: 'How many toes does a typical cat have on a front paw?',
    description: '',
    category: 'Cats',
    difficulty: 'easy',
    options: [
      { text: '4', value: 'A' },
      { text: '5', value: 'B' },
      { text: '6', value: 'C' },
      { text: '8', value: 'D' }
    ],
    correctValue: 'B',
    explanation: 'Most cats have five toes on their front paws and four on the back paws.'
  },
  {
    title: 'What sound indicates a cat is most likely content or greeting you?',
    description: '',
    category: 'Cats',
    difficulty: 'easy',
    options: [
      { text: 'Hissing', value: 'A' },
      { text: 'Purring', value: 'B' },
      { text: 'Growling', value: 'C' },
      { text: 'Clicking', value: 'D' }
    ],
    correctValue: 'B',
    explanation: 'Purring is commonly a contentment sound.'
  },
  {
    title: 'Which coat pattern is most common in domestic cats?',
    description: '',
    category: 'Cats',
    difficulty: 'medium',
    options: [
      { text: 'Calico', value: 'A' },
      { text: 'Tabby', value: 'B' },
      { text: 'Solid color', value: 'C' },
      { text: 'Tortoiseshell', value: 'D' }
    ],
    correctValue: 'B',
    explanation: 'Tabby is one of the most common coat patterns across cat breeds.'
  }
];

(async () => {
  try {
    console.log('Seeding questions...');

    // Ensure is_correct column exists
    try {
      await pool.query('ALTER TABLE question_options ADD COLUMN IF NOT EXISTS is_correct BOOLEAN DEFAULT FALSE');
    } catch (e) {
      console.warn('Failed to alter question_options (may already exist)', e.message);
    }

    for (const q of questions) {
      // Skip if a question with same title exists
      const existing = await pool.query('SELECT id FROM questions WHERE title = $1', [q.title]);
      if (existing.rows.length > 0) {
        console.log('Question already seeded, skipping:', q.title);
        continue;
      }

      const res = await pool.query(
        `INSERT INTO questions (title, description, category, difficulty, created_by, explanation, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW()) RETURNING id`,
        [q.title, q.description || '', q.category, q.difficulty, adminUserId, q.explanation || '']
      );

      const qId = res.rows[0].id;

      for (const opt of q.options) {
        const isCorrect = opt.value === q.correctValue;
        await pool.query('INSERT INTO question_options (question_id, text, value, created_at, is_correct) VALUES ($1, $2, $3, NOW(), $4)', [qId, opt.text, opt.value, isCorrect]);
      }

      console.log('Inserted question:', q.title);
    }

    console.log('Seeding complete');
  } catch (err) {
    console.error('Seeding error', err);
  } finally {
    await pool.end();
  }
})();
