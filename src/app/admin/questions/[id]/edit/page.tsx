'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Question, QuestionOption } from '@/types';

interface QuestionOptionInput {
  id: string;
  text: string;
  value: string;
}

export default function EditQuestionPage() {
  const router = useRouter();
  const params = useParams();
  const questionId = params?.id as string | undefined;

  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    category: string;
    difficulty: 'easy' | 'medium' | 'hard';
    options: QuestionOptionInput[];
    correctAnswerId: string;
    explanation: string;
  }>({
    title: '',
    description: '',
    category: '',
    difficulty: 'medium',
    options: [
      { id: '1', text: '', value: 'A' },
      { id: '2', text: '', value: 'B' },
      { id: '3', text: '', value: 'C' },
      { id: '4', text: '', value: 'D' },
    ],
    correctAnswerId: '1',
    explanation: '',
  });

  const fetchQuestion = useCallback(async () => {
    try {
      const res = await fetch(`/api/questions/${questionId}`);
      const json = await res.json();
      if (json?.success) {
        const q: Question & { options?: QuestionOption[] } = json.data;
        setFormData({
          title: q.title || '',
          description: q.description || '',
          category: q.category || '',
          difficulty: q.difficulty || 'medium',
          options: (q.options || []).map((opt) => ({ id: String(opt.id), text: opt.text, value: opt.value })) || [],
          correctAnswerId: q.options && q.options[0] ? String(q.options[0].id) : '1',
          explanation: q.explanation || '',
        });
      } else {
        setError(json?.error || 'Question not found');
      }
    } catch (err) {
      console.error('Fetch question error', err);
      setError('Failed to load question');
    } finally {
      setIsLoading(false);
    }
  }, [questionId]);

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

      if (questionId) {
        await fetchQuestion();
      } else {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router, questionId, fetchQuestion]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleOptionChange = (index: number, field: string, value: string) => {
    const newOptions = [...formData.options];
    newOptions[index] = { ...newOptions[index], [field]: value } as QuestionOptionInput;
    setFormData(prev => ({ ...prev, options: newOptions }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.title.trim()) {
      setError('Question title is required');
      return;
    }

    if (formData.options.some(opt => !opt.text.trim())) {
      setError('All options must have text');
      return;
    }

    setIsSaving(true);

    try {
      const token = localStorage.getItem('token');

      const payload = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        difficulty: formData.difficulty,
        options: formData.options.map(opt => ({ text: opt.text, value: opt.value })),
        correctAnswerValue: formData.options.find(opt => opt.id === formData.correctAnswerId)?.value,
        explanation: formData.explanation,
      };

      const res = await fetch(`/api/questions/${questionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json?.success) {
        router.push('/admin/questions');
      } else {
        setError(json?.error || 'Failed to update question');
      }
    } catch (err) {
      console.error('Update error', err);
      setError('Failed to update question');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) return null;

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Edit Question</h1>
          <p className="text-gray-600">Edit the practice test question</p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-8 space-y-6">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-2">
              Question Title *
            </label>
            <input id="title" name="title" type="text" value={formData.title} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500" />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
            <textarea id="description" name="description" value={formData.description} onChange={handleInputChange} rows={4} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500" />
          </div>

          {/* Category & Difficulty */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="category" className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
              <input id="category" name="category" type="text" value={formData.category} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label htmlFor="difficulty" className="block text-sm font-semibold text-gray-700 mb-2">Difficulty *</label>
              <select id="difficulty" name="difficulty" value={formData.difficulty} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500">
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>

          {/* Options */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-4">Answer Options * (select the correct answer)</label>
            <div className="space-y-3">
              {formData.options.map((opt, index) => (
                <div key={opt.id} className="flex gap-3">
                  <input type="radio" name="correctAnswerId" value={opt.id} checked={formData.correctAnswerId === opt.id} onChange={e => setFormData(prev => ({ ...prev, correctAnswerId: e.target.value }))} className="mt-3" />
                  <div className="flex-1">
                    <input type="text" value={opt.text} onChange={e => handleOptionChange(index, 'text', e.target.value)} placeholder={`Option ${opt.value}`} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Explanation */}
          <div>
            <label htmlFor="explanation" className="block text-sm font-semibold text-gray-700 mb-2">Explanation</label>
            <textarea id="explanation" name="explanation" value={formData.explanation} onChange={handleInputChange} rows={4} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500" />
          </div>

          <div className="flex gap-4 pt-6">
            <button type="submit" disabled={isSaving} className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-semibold transition">{isSaving ? 'Saving...' : 'Save Changes'}</button>
            <Link href="/admin/questions" className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-lg font-semibold transition">Cancel</Link>
          </div>
        </form>
      </div>
    </main>
  );
}
