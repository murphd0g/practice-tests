<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization\#_use-a-githubcopilotinstructionsmd-file -->

# PracticeTests Platform - Copilot Instructions

## Project Overview
This is a full-stack practice test platform built with Next.js, Express.js, PostgreSQL, and TypeScript. It includes a user portal for taking tests and an admin portal for managing questions.

## Technology Stack
- **Frontend**: Next.js 14+ with App Router, TypeScript, Tailwind CSS
- **Backend**: Node.js with Next.js API Routes (no separate Express server needed)
- **Database**: PostgreSQL
- **Authentication**: JWT with bcryptjs
- **Type Safety**: TypeScript across the entire application

## Project Structure
\`\`\`
src/
├── app/
│   ├── api/           # API routes (backend)
│   ├── user/          # User portal pages
│   ├── admin/         # Admin portal pages
│   ├── auth/          # Authentication pages
│   └── page.tsx       # Home page
├── components/        # Reusable React components
├── lib/              # Utility libraries (db, auth, etc.)
├── types/            # TypeScript type definitions
└── utils/            # Helper functions and middleware
\`\`\`

## Key Guidelines

### API Routes
- All API routes are in \`src/app/api/\`
- Use middleware from \`src/utils/middleware.ts\` for authentication
- Always return \`ApiResponse\` type from \`src/types/index.ts\`
- Use database helper functions from \`src/lib/db.ts\`

### Components
- Use 'use client' directive for client-side components
- Implement proper TypeScript typing
- Use Tailwind CSS for styling
- Keep components small and reusable

### Database
- Use the query helper functions from \`src/lib/db.ts\`
- Always use parameterized queries to prevent SQL injection
- Include proper error handling and logging

### Authentication
- Use JWT tokens stored in localStorage (browser)
- Protect admin routes with \`withAdminAuth\` middleware
- Hash passwords with bcryptjs before storing

### Development
- Run \`npm run dev\` to start the development server
- The app runs on \`http://localhost:3000\`
- API routes are accessible at \`http://localhost:3000/api/*\`

### Database Setup
Before running the app, set up PostgreSQL:
\`\`\`sql
CREATE DATABASE practice_tests_db;
\c practice_tests_db;

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE questions (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  difficulty VARCHAR(20),
  created_by INTEGER REFERENCES users(id),
  explanation TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE question_options (
  id SERIAL PRIMARY KEY,
  question_id INTEGER REFERENCES questions(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  value VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE quizzes (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE quiz_questions (
  id SERIAL PRIMARY KEY,
  quiz_id INTEGER REFERENCES quizzes(id) ON DELETE CASCADE,
  question_id INTEGER REFERENCES questions(id),
  order_index INTEGER
);

CREATE TABLE quiz_attempts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  quiz_id INTEGER REFERENCES quizzes(id),
  score INTEGER,
  total_questions INTEGER,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_answers (
  id SERIAL PRIMARY KEY,
  attempt_id INTEGER REFERENCES quiz_attempts(id) ON DELETE CASCADE,
  question_id INTEGER REFERENCES questions(id),
  selected_option_id INTEGER REFERENCES question_options(id),
  is_correct BOOLEAN
);
\`\`\`

## Best Practices
1. Always use TypeScript - no \`any\` types unless absolutely necessary
2. Write error handling for all async operations
3. Log important operations for debugging
4. Use environment variables for configuration
5. Keep API responses consistent with \`ApiResponse\` type
6. Implement proper validation on both client and server
7. Use semantic HTML and accessible components
8. Follow React/Next.js best practices and conventions
