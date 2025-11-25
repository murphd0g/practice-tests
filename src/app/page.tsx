import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-20">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Welcome to PracticeTests
          </h1>
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            Master your skills with our comprehensive practice test platform. Take tests, track your
            progress, and improve your knowledge.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="text-4xl mb-4">📝</div>
              <h3 className="text-xl font-semibold mb-2">Take Tests</h3>
              <p className="text-gray-600">Access a wide range of practice tests across multiple categories</p>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-semibold mb-2">Track Progress</h3>
              <p className="text-gray-600">Monitor your performance and identify areas for improvement</p>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-xl font-semibold mb-2">Improve Skills</h3>
              <p className="text-gray-600">Get detailed explanations and learn from your mistakes</p>
            </div>
          </div>

          <div className="flex gap-4 justify-center">
            <Link
              href="/auth/register"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition"
            >
              Get Started
            </Link>
            <Link
              href="/auth/login"
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-8 py-3 rounded-lg font-semibold transition"
            >
              Login
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
