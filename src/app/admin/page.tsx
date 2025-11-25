'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface AdminStats {
  totalQuestions: number;
  totalQuizzes: number;
  totalUsers: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<AdminStats>({ totalQuestions: 0, totalQuizzes: 0, totalUsers: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

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
      setIsLoading(false);

      // TODO: Fetch stats from API
      // For now, set dummy values
      setStats({
        totalQuestions: 24,
        totalQuizzes: 5,
        totalUsers: 42,
      });
    };

    checkAuth();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage questions, quizzes, and users</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-5xl font-bold text-blue-600 mb-2">{stats.totalQuestions}</div>
            <p className="text-gray-600">Total Questions</p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-5xl font-bold text-green-600 mb-2">{stats.totalQuizzes}</div>
            <p className="text-gray-600">Total Quizzes</p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-5xl font-bold text-purple-600 mb-2">{stats.totalUsers}</div>
            <p className="text-gray-600">Total Users</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link
            href="/admin/questions"
            className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition cursor-pointer"
          >
            <div className="text-4xl mb-4">📝</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Manage Questions</h3>
            <p className="text-gray-600">Create, edit, and delete questions</p>
          </Link>

          <Link
            href="/admin/quizzes"
            className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition cursor-pointer"
          >
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Manage Quizzes</h3>
            <p className="text-gray-600">Create and organize quizzes</p>
          </Link>

          <Link
            href="/admin/users"
            className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition cursor-pointer"
          >
            <div className="text-4xl mb-4">👥</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Manage Users</h3>
            <p className="text-gray-600">View and manage user accounts</p>
          </Link>

          <Link
            href="/admin/reports"
            className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition cursor-pointer"
          >
            <div className="text-4xl mb-4">📈</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">View Reports</h3>
            <p className="text-gray-600">Analyze user performance</p>
          </Link>
        </div>
      </div>
    </main>
  );
}
