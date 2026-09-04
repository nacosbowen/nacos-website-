'use client';
import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';

export default function AdminLoginPage() {
  const router = useRouter();
  const { adminLogin } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await adminLogin(email, password);
      router.push('/dashboard/admin');
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Login failed. Check your details.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[#f7f7f7]">
      <div className="w-full max-w-md">
        <div className="relative">
          <div className="absolute top-5 left-5 right-[-10px] bottom-[-10px] bg-gray-300 rounded-3xl" />
          <div className="absolute top-2.5 left-2.5 right-[-5px] bottom-[-5px] bg-gray-200 rounded-3xl" />

          <div className="relative bg-white rounded-3xl border border-gray-100 px-8 py-10
            shadow-[0_8px_16px_rgba(0,0,0,0.06),0_24px_48px_rgba(0,0,0,0.10),0_40px_80px_rgba(0,0,0,0.07)]">

            <div className="flex items-center justify-center gap-3 mb-8">
              <Image src="/1690802623935.jpeg" alt="NACOS" width={44} height={44}
                className="rounded-full object-cover border border-gray-100 shadow-sm" />
              <Image src="/images (32).jpeg" alt="Bowen" width={44} height={44}
                className="rounded-full object-cover border border-gray-100 shadow-sm" />
              <span className="text-xl font-black text-gray-900 tracking-tight"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                NACOS BOWEN
              </span>
            </div>

            <div className="mb-8">
              <h1 className="text-2xl font-black text-gray-900"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                Admin Access
              </h1>
              <p className="text-gray-400 text-sm mt-1">Sign in to the admin dashboard</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 tracking-wide uppercase"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  Email Address
                </label>
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="admin@nacos.bowen.edu.ng"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-900
                    placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent
                    transition-all duration-200" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 tracking-wide uppercase"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  Password
                </label>
                <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-900
                    placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent
                    transition-all duration-200" />
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
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}