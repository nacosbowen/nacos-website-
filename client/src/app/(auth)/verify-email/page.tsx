'use client';
import { useState, FormEvent, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import api from '@/lib/api';

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#f7f7f7]">Loading...</div>}>
      <VerifyEmailForm />
    </Suspense>
  );
}

function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailFromQuery = searchParams.get('email') || '';

  const [email, setEmail] = useState(emailFromQuery);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    setEmail(emailFromQuery);
  }, [emailFromQuery]);

  useEffect(() => {
    if (!verified) return;
    router.prefetch('/login');
    const t = setTimeout(() => router.push('/login'), 1200);
    return () => clearTimeout(t);
  }, [verified, router]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/verify-email', { email, code });
      setVerified(true);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError('');
    setSuccess('');
    setResending(true);
    try {
      const { data } = await api.post('/auth/resend-code', { email });
      setSuccess(data.message);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to resend code.');
    } finally {
      setResending(false);
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
                Verify your email
              </h1>
              <p className="text-gray-400 text-sm mt-1">
                We sent a 6-digit code to {email || 'your email'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">

              {!emailFromQuery && (
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
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 tracking-wide uppercase"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  Verification Code
                </label>
                <input type="text" required value={code} onChange={e => setCode(e.target.value)}
                  placeholder="123456" maxLength={6}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-lg text-gray-900
                    placeholder-gray-300 text-center tracking-[0.5em] font-bold
                    focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent
                    transition-all duration-200" />
              </div>

              {error && (
                <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm">
                  {error}
                </div>
              )}
              {success && (
                <div className="px-4 py-3 rounded-xl bg-green-50 border border-green-100 text-green-700 text-sm">
                  {success}
                </div>
              )}

              <button type="submit" disabled={loading || verified}
                className="w-full py-3 rounded-xl font-bold text-sm text-white
                  bg-gray-900 hover:bg-gray-800 active:bg-black disabled:opacity-60 disabled:cursor-not-allowed
                  shadow-[0_4px_12px_rgba(0,0,0,0.2)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.25)]
                  transition-all duration-200 mt-1"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                {loading ? 'Verifying...' : 'Verify Email'}
              </button>

              <button type="button" onClick={handleResend} disabled={resending}
                className="w-full text-center text-sm text-gray-400 hover:text-gray-700 transition disabled:opacity-50">
                {resending ? 'Resending...' : "Didn't get a code? Resend"}
              </button>

              <p className="text-center text-sm text-gray-400 pt-1">
                <Link href="/login" className="text-gray-900 font-semibold hover:underline">Back to login</Link>
              </p>

            </form>
          </div>
        </div>
      </div>

      {verified && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white px-8 py-8 text-center shadow-2xl">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
              <svg className="h-7 w-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-lg font-black text-gray-900" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Email verified successfully
            </h2>
            <p className="mt-1 text-sm text-gray-400">Redirecting to login...</p>
          </div>
        </div>
      )}
    </div>
  );
}