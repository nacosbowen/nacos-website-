'use client';
import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { AxiosError } from 'axios';

const DEPARTMENTS = [
  { id: 1, name: 'Computer Science', code: 'CS' },
  { id: 2, name: 'Software Engineering', code: 'SE' },
  { id: 3, name: 'Cyber Security', code: 'CYB' },
  { id: 4, name: 'Information Technology', code: 'IFT' },
];

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', matricNumber: '', password: '', confirmPassword: '', departmentId: '', level: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const set = (f: string, v: string) => setForm(p => ({ ...p, [f]: v }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault(); setError('');
    if (form.password !== form.confirmPassword) { setError('Passwords do not match'); return; }
    if (form.password.length < 8) { setError('Password must be at least 8 characters'); return; }
    setIsLoading(true);
    try {
      await api.post('/auth/register', { firstName: form.firstName, lastName: form.lastName, email: form.email, matricNumber: form.matricNumber, password: form.password, departmentId: Number(form.departmentId), level: Number(form.level) });
      router.push('/login?registered=true');
    } catch (err) {
      const e = err as AxiosError<{ message: string }>;
      setError(e.response?.data?.message ?? 'Registration failed.');
    } finally { setIsLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
          <p className="text-gray-500 mt-1 text-sm">Join NACOS Bowen University</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">First name</label>
              <input type="text" required value={form.firstName} onChange={e => set('firstName', e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="John" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Last name</label>
              <input type="text" required value={form.lastName} onChange={e => set('lastName', e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Doe" /></div>
          </div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" required value={form.email} onChange={e => set('email', e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="you@example.com" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Matric number</label>
            <input type="text" required value={form.matricNumber} onChange={e => set('matricNumber', e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="BU/21/0001" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
              <select required value={form.departmentId} onChange={e => set('departmentId', e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                <option value="">Select</option>
                {DEPARTMENTS.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
              <select required value={form.level} onChange={e => set('level', e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                <option value="">Select</option>
                {[100,200,300,400,500].map(l => <option key={l} value={l}>{l}L</option>)}
              </select></div>
          </div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input type="password" required value={form.password} onChange={e => set('password', e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="At least 8 characters" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Confirm password</label>
            <input type="password" required value={form.confirmPassword} onChange={e => set('confirmPassword', e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="••••••••" /></div>
          {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">{error}</p>}
          <button type="submit" disabled={isLoading} className="w-full py-2.5 bg-blue-700 text-white rounded-lg font-medium text-sm hover:bg-blue-800 transition disabled:opacity-60">
            {isLoading ? 'Creating account...' : 'Create account'}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-500">Already have an account?{' '}
          <Link href="/login" className="text-blue-700 font-medium hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
