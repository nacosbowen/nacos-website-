'use client';
import { useAuth } from '@/context/AuthContext';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-bold text-blue-700">NACOS</h1>
          <span className="text-xs bg-red-100 text-red-700 font-medium px-2 py-0.5 rounded-full">Admin</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">{user?.fullName}</span>
          <button onClick={logout} className="text-sm text-gray-500 hover:text-red-600 transition">Logout</button>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        <section><h2 className="text-lg font-semibold text-gray-900 mb-4">User Management</h2>
          <div className="bg-white rounded-xl border border-gray-200 p-6 text-center text-gray-400 text-sm">User list and role assignment will appear here</div></section>
        <section><h2 className="text-lg font-semibold text-gray-900 mb-4">Timetable Management</h2>
          <div className="bg-white rounded-xl border border-gray-200 p-6 text-center text-gray-400 text-sm">Timetable editor will appear here</div></section>
      </main>
    </div>
  );
}
