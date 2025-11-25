# PracticeTests - Practice Test Platform

A full-stack web application for users to take practice tests with an admin portal for managing questions and answers.

## Features

- **User Portal**
  - User registration and authentication
  - Browse and take practice tests
  - View test results and performance metrics
  - Track learning progress

- **Admin Portal**
  - Create and manage questions
  - Organize questions by categories
  - Set difficulty levels
  - Add explanations and answer options
  - View user statistics

## Tech Stack

- **Frontend**: Next.js 14+ with App Router
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL
- **Authentication**: JWT with bcryptjs
- **Styling**: Tailwind CSS
- **Language**: TypeScript

## Prerequisites

- Node.js 18+ 
- PostgreSQL 12+
- npm or yarn

## Installation

1. **Clone the repository**
```bash
cd /Users/jason/code/practice-tests
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up PostgreSQL Database**

Create a new PostgreSQL database:
```bash
createdb practice_tests_db
```

Then run this SQL to create the tables:
```sql
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
```

4. **Configure Environment Variables**

Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Update `.env.local` with your configuration:
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/practice_tests_db
JWT_SECRET=your_jwt_secret_key_here
NODE_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:3000/api
ADMIN_SECRET=your_admin_secret
```

## Running the Project

### Development

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### Build for Production

```bash
npm run build
npm run start
```

## Project Structure

```
src/
├── app/
│   ├── api/                    # API routes
│   │   ├── auth/               # Authentication endpoints
│   │   ├── questions/          # Question management
│   │   └── health/             # Health check endpoint
│   ├── user/                   # User portal pages
│   ├── admin/                  # Admin portal pages
│   ├── auth/                   # Authentication pages
│   ├── page.tsx                # Home page
│   ├── layout.tsx              # Root layout
│   └── globals.css             # Global styles
├── components/
│   └── Navbar.tsx              # Navigation bar
├── lib/
│   ├── db.ts                   # Database connection and helpers
│   └── auth.ts                 # Authentication utilities
├── types/
│   └── index.ts                # TypeScript type definitions
├── utils/
│   └── middleware.ts           # Auth middleware
├── .env.example                # Environment variables template
├── .env.local                  # Local environment variables
├── next.config.ts              # Next.js configuration
├── tsconfig.json               # TypeScript configuration
└── tailwind.config.ts          # Tailwind CSS configuration
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/health` - Health check

### Questions (Admin only)
- `GET /api/questions` - Get all questions
- `POST /api/questions` - Create new question
- `PUT /api/questions/[id]` - Update question
- `DELETE /api/questions/[id]` - Delete question

### Quizzes
- `GET /api/quizzes` - Get all quizzes
- `GET /api/quizzes/[id]` - Get quiz details
- `POST /api/quizzes/[id]/submit` - Submit quiz attempt

## Authentication

The app uses JWT tokens for authentication:

1. User registers or logs in
2. Server returns JWT token
3. Token is stored in browser's localStorage
4. Token is sent with requests in Authorization header: `Bearer <token>`
5. Server verifies token and grants access
