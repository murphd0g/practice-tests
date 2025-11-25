'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
    setIsLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    router.push('/');
  };

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold">
            PracticeTests
          </Link>

          <div className="flex gap-6 items-center">
            {!isLoading && user ? (
              <>
                <span className="text-sm">Welcome, {user.name}</span>
                {user.role === 'admin' && (
                  <Link href="/admin" className="hover:text-blue-200">
                    Admin Portal
                  </Link>
                )}
                <Link href="/user/dashboard" className="hover:text-blue-200">
                  Dashboard
                </Link>
                <button onClick={handleLogout} className="hover:text-blue-200">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="hover:text-blue-200">
                  Login
                </Link>
                <Link href="/auth/register" className="hover:text-blue-200">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
