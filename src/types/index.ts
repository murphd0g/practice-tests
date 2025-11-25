// User Types
export interface User {
  id: string;
  email: string;
  password?: string;
  name: string;
  role: 'user' | 'admin';
  createdAt: Date;
  updatedAt: Date;
}

// Question Types
export interface Question {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  options: QuestionOption[];
  correctAnswerId?: string;
  explanation?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface QuestionOption {
  id: string;
  text: string;
  value: string;
  isCorrect?: boolean;
  createdAt?: Date;
}

// Test/Quiz Types
export interface Quiz {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface QuizAttempt {
  id: string;
  userId: string;
  quizId: string;
  answers: UserAnswer[];
  score: number;
  totalQuestions: number;
  completedAt: Date;
  createdAt: Date;
}

export interface UserAnswer {
  questionId: string;
  selectedOptionId: string;
  isCorrect: boolean;
}

// API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface AuthResponse {
  token: string;
  user: Omit<User, 'password'>;
}
