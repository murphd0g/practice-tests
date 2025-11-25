'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Question } from '@/types';

export default function QuestionsPage() {
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');

      if (!token || !userData) {
        router.push('/auth/login');
        return;
      }

      const user = JSON.parse(userData);
      if (user.role !== 'admin') {
        router.push('/');
        return;
      }

      setIsAuthorized(true);
      await fetchQuestions();
      setIsLoading(false);
    };

    checkAuth();
  }, [router]);

  const fetchQuestions = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/questions');
      const json = await res.json();
      if (json?.success) {
        setQuestions(json.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch questions', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (questionId: string) => {
    if (!confirm('Are you sure you want to delete this question?')) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/questions/${questionId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
      });

      const json = await res.json();
      if (json?.success) {
        setQuestions(prev => prev.filter(q => q.id !== questionId));
      } else {
        alert(json?.error || 'Failed to delete question');
      }
    } catch (err) {
      console.error('Delete error', err);
      alert('Failed to delete question');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading questions...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  const filtered = questions.filter(q => (filter === 'all' ? true : q.difficulty === filter));

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Manage Questions</h1>
            <p className="text-gray-600">Create and manage practice test questions</p>
          </div>
          <Link
            href="/admin/questions/new"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition"
          >
            + Create Question
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex gap-4 flex-wrap">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              All Questions ({questions.length})
            </button>
            <button
              onClick={() => setFilter('easy')}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                filter === 'easy'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              Easy
            </button>
            <button
              onClick={() => setFilter('medium')}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                filter === 'medium'
                  ? 'bg-yellow-600 text-white'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              Medium
            </button>
            <button
              onClick={() => setFilter('hard')}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                filter === 'hard'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              Hard
            </button>
          </div>
        </div>

        {/* Questions List */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">No questions yet</h3>
            <p className="text-gray-600 mb-6">Create your first question to get started</p>
            <Link
              href="/admin/questions/new"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition inline-block"
            >
              Create First Question
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(question => (
              <div key={question.id} className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">{question.title}</h3>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          question.difficulty === 'easy'
                            ? 'bg-green-100 text-green-800'
                            : question.difficulty === 'medium'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {question.difficulty}
                      </span>
                      {question.category && (
                        <span className="px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                          {question.category}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600">{question.description}</p>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      href={`/admin/questions/${question.id}/edit`}
                      className="bg-blue-100 hover:bg-blue-200 text-blue-800 px-4 py-2 rounded-lg font-semibold transition"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(question.id)}
                      className="bg-red-100 hover:bg-red-200 text-red-800 px-4 py-2 rounded-lg font-semibold transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-500">{question.options?.length || 0} options • {question.explanation ? 'Has explanation' : 'No explanation'}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Back Link */}
        <div className="mt-8">
          <Link href="/admin" className="text-blue-600 hover:text-blue-700 font-semibold">
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
