'use client';
import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';

type Role = 'student' | 'course_rep' | 'executive';

const ROLES: { value: Role; label: string }[] = [
  { value: 'student', label: 'Student' },
  { value: 'course_rep', label: 'Course Rep' },
  { value: 'executive', label: 'Executive' },
];

const ROLE_PATH: Record<Role, string> = {
  student: '/dashboard/student',
  course_rep: '/dashboard/course-rep',
  executive: '/dashboard/executive',
};

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<Role>('student');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password, selectedRole);
      router.push(ROLE_PATH[selectedRole]);
      // Intentionally do NOT reset loading here — keep the button showing
      // "Signing in..." until the navigation actually takes over, so it
      // doesn't flash back to "Sign In" for a moment beforehand.
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Login failed. Check your details.';
      setError(message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[#f7f7f7] overflow-x-hidden">
      <div className="w-full max-w-md">
        <div className="relative">
          <div className="absolute top-5 left-5 right-[-10px] bottom-[-10px] bg-gray-300 rounded-3xl" />
          <div className="absolute top-2.5 left-2.5 right-[-5px] bottom-[-5px] bg-gray-200 rounded-3xl" />

          <div className="relative bg-white rounded-3xl border border-gray-100 px-8 py-10
            shadow-[0_8px_16px_rgba(0,0,0,0.06),0_24px_48px_rgba(0,0,0,0.10),0_40px_80px_rgba(0,0,0,0.07)]">

            <div className="flex items-center justify-center gap-3 mb-8">
              <Image src="/1690802623935.jpeg" alt="NACOS" width={44} height={44}
                className="rounded-full object-cover border border-gray-100 shadow-sm" />
                <Image src="/bowen-logo.png" alt="Bowen" width={44} height={44}
                className="rounded-full object-cover border border-gray-100 shadow-sm" />
              <span className="text-xl font-black text-gray-900 tracking-tight"
                style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                NACOS BOWEN
              </span>
            </div>

            <div className="mb-8">
              <h1 className="text-2xl font-black text-gray-900"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                Welcome back
              </h1>
              <p className="text-gray-400 text-sm mt-1">Sign in to your NACOS account</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 tracking-wide uppercase"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  Email Address
                </label>
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="yourname@bowen.edu.ng"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-base text-gray-900
                    placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent
                    transition-all duration-200" />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-gray-500 tracking-wide uppercase"
                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    Password
                  </label>
                  <Link href="/forgot-password" className="text-xs text-gray-400 hover:text-gray-700 transition">
                    Forgot password?
                  </Link>
                </div>
                <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-base text-gray-900
                    placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent
                    transition-all duration-200" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-2 tracking-wide uppercase"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  I am a
                </label>
                <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                  {ROLES.map((role) => (
                    <button key={role.value} type="button" onClick={() => setSelectedRole(role.value)}
                      className={`py-2 px-1.5 sm:py-2.5 sm:px-3 rounded-xl text-xs sm:text-sm font-semibold border transition-all duration-200
                        ${selectedRole === role.value
                          ? 'bg-gray-900 text-white border-gray-900 shadow-[0_4px_12px_rgba(0,0,0,0.2)]'
                          : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400 hover:text-gray-700'
                        }`}
                      style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                      {role.label}
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm">
                  {error}
                </div>
              )}

              <button type="submit" disabled={loading}
                className="w-full py-3 rounded-xl font-bold text-sm text-white
                  bg-gray-900 hover:bg-gray-800 active:bg-black disabled:opacity-60 disabled:cursor-not-allowed
                  shadow-[0_4px_12px_rgba(0,0,0,0.2)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.25)]
                  transition-all duration-200 mt-1"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                {loading ? 'Signing in...' : 'Sign In'}
              </button>

              <p className="text-center text-sm text-gray-400 pt-1">
                Don't have an account?{' '}
                <Link href="/signup" className="text-gray-900 font-semibold hover:underline">Sign up</Link>
              </p>

            </form>
          </div>
        </div>
      </div>
    </div>
  );
}