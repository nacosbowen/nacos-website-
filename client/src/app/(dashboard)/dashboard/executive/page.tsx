'use client';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import DashboardShell from '@/components/dashboard/DashboardShell';
import { useState, useEffect } from 'react';
import api from '@/lib/api';

const ACTIONS = [
  {
    href: '/dashboard/executive/broadcast',
    label: 'Broadcast',
    description: 'Send notifications to all students or target a specific level',
    badge: 'Announce',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-7 h-7">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 01-1.44-4.282m3.102.069a18.03 18.03 0 01-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 018.835 2.535M10.34 6.66a23.847 23.847 0 008.835-2.535m0 0A23.74 23.74 0 0018.795 3m.38 1.125a23.91 23.91 0 011.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 001.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 010 3.46" />
      </svg>
    ),
  },
  {
    href: '/dashboard/executive/suggestions',
    label: 'Suggestions Inbox',
    description: 'View and respond to anonymous feedback from students',
    badge: 'Inbox',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-7 h-7">
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
      </svg>
    ),
  },
  {
    href: '/dashboard/executive/events',
    label: 'Manage Events',
    description: 'Create and manage NACOS events, workshops, and competitions',
    badge: 'Events',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-7 h-7">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z" />
      </svg>
    ),
  },
  {
    href: '/dashboard/executive/past-questions',
    label: 'Past Questions',
    description: 'Oversee all past question uploads across all departments',
    badge: 'Library',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-7 h-7">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
      </svg>
    ),
  },
];

const DEPARTMENTS = [
  { code: 'CS', key: 'CSC', name: 'Computer Science' },
  { code: 'SE', key: 'SEN', name: 'Software Engineering' },
  { code: 'CYB', key: 'CYB', name: 'Cyber Security' },
  { code: 'IFT', key: 'IFT', name: 'Information Technology' },
];

const FEATURES = [
  {
    href: '/dashboard/executive/timetable',
    label: 'Class Timetable',
    description: 'View your department class schedule for the semester',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-7 h-7"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z" /></svg>,
  },
  {
    href: '/dashboard/executive/voting',
    label: 'NACOS Voting',
    description: 'Cast your vote in NACOS elections and polls securely',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-7 h-7"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  },
  {
    href: '/dashboard/executive/dinner',
    label: 'NACOS Dinner Theme',
    description: 'Check the theme, dress code and details for the NACOS annual dinner',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-7 h-7"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513m6-4.871c1.355 0 2.697.056 4.024.166C17.155 8.51 18 9.473 18 10.608v2.513M15 8.25v-1.5m-6 1.5v-1.5m12 9.75l-1.5.75a3.354 3.354 0 01-3 0 3.354 3.354 0 00-3 0 3.354 3.354 0 01-3 0 3.354 3.354 0 00-3 0 3.354 3.354 0 01-1.5-.75M3 12.75V10.5a9 9 0 0118 0v2.25" /></svg>,
  },
  {
    href: '/dashboard/executive/exam-timetable',
    label: 'Exam Timetable',
    description: 'View your examination schedule, dates, times and venues',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-7 h-7"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  },
  {
    href: '/dashboard/executive/rsvp',
    label: 'RSVP Tickets',
    description: 'Reserve your spot and get tickets for NACOS events and programs',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-7 h-7"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 010 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 010-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375z" /></svg>,
  },
  {
    href: '/dashboard/executive/archive',
    label: 'NACOS Archive',
    description: 'Access historical NACOS documents, photos, and past records',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-7 h-7"><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" /></svg>,
  },
  {
    href: '/dashboard/executive/dev-team',
    label: 'NACOS Dev Team',
    description: 'Join the NACOS developer community and contribute to tech projects',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-7 h-7"><path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" /></svg>,
  },
];

export default function ExecutiveDashboard() {
  const { user, isLoading: authLoading } = useAuth();
const [stats, setStats] = useState<{
  students: number; notifications: number; upcomingEvents: number; suggestions: number;
  departments: Record<string, number>;
} | null>(null);

useEffect(() => {
  if (authLoading) return;
  api.get('/stats').then(r => setStats(r.data)).catch(() => {});
}, [authLoading]);

const show = (n?: number) => (n === undefined ? '—' : n.toLocaleString());

const statCards = [
  { label: 'Total Students', value: show(stats?.students), sub: 'in the NACOS registry' },
  { label: 'Notifications Sent', value: show(stats?.notifications), sub: 'broadcasts so far' },
  { label: 'Upcoming Events', value: show(stats?.upcomingEvents), sub: 'scheduled' },
  { label: 'Suggestions', value: show(stats?.suggestions), sub: 'received from students' },
];

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <DashboardShell title="Executive Dashboard">
      <div className="max-w-5xl mx-auto space-y-7">

        {/* Welcome banner */}
        <div className="relative overflow-hidden rounded-2xl px-7 py-6
          shadow-[0_4px_6px_rgba(0,0,0,0.07),0_10px_20px_rgba(0,0,0,0.10)]"
          style={{ background: 'linear-gradient(135deg, #111 0%, #1e1e1e 50%, #111 100%)' }}>
          <div className="absolute inset-0 opacity-[0.04]"
            style={{ backgroundImage: 'radial-gradient(circle at 70% 50%, white 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
          {/* Gold accent line */}
          <div className="absolute top-0 left-0 w-1 h-full rounded-l-2xl"
            style={{ background: 'linear-gradient(to bottom, rgba(255,215,0,0.6), transparent)' }} />
          <div className="relative">
            <p className="text-white/50 text-xs font-medium tracking-widest uppercase mb-1"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              {greeting}, Executive
            </p>
            <h2 className="text-2xl font-black text-white leading-tight"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              {user?.fullName ?? 'Executive'}
            </h2>
            <div className="flex items-center gap-2 mt-2.5">
              <span className="text-xs font-semibold text-white/60 bg-white/10 px-2.5 py-1 rounded-full"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                {user?.department?.code}
              </span>
              <span className="text-xs font-bold text-white bg-white/15 px-2.5 py-1 rounded-full border border-white/20"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                NACOS Executive
              </span>
            </div>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat) => (
            <div key={stat.label} className="bg-white rounded-2xl border border-gray-100 px-4 py-4
              shadow-[0_2px_4px_rgba(0,0,0,0.04),0_6px_12px_rgba(0,0,0,0.06)]">
              <p className="text-2xl font-black text-gray-900" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                {stat.value}
              </p>
              <p className="text-xs font-semibold text-gray-700 mt-0.5 leading-snug">{stat.label}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">{stat.sub}</p>
            </div>
          ))}
        </div>

  {/* Departments overview */}
        <div>
          <h3 className="text-xs font-bold text-gray-400 tracking-widest uppercase mb-4"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Departments Under NACOS
          </h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {DEPARTMENTS.map((dept) => (
              <div key={dept.code} className="bg-white rounded-2xl border border-gray-100 px-4 py-4
                shadow-[0_2px_4px_rgba(0,0,0,0.04),0_6px_12px_rgba(0,0,0,0.06)]">
                <p className="text-xs font-bold tracking-widest uppercase text-gray-300 mb-1"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  {dept.code}
                </p>
                <p className="text-sm font-black text-gray-800 leading-snug"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  {dept.name}
                </p>
               <p className="text-2xl font-black text-gray-900 mt-3"
  style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
  {show(stats?.departments?.[dept.key])}
</p>
<p className="text-[10px] text-gray-400">students</p>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div>
          <h3 className="text-xs font-bold text-gray-400 tracking-widest uppercase mb-4"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Executive Actions
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 items-stretch">
            {ACTIONS.map((item) => (
              <Link key={item.href} href={item.href} className="group relative cursor-pointer h-full block">
                <div className="absolute top-3 left-3 right-[-6px] bottom-[-6px] bg-gray-300 rounded-2xl
                  transition-all duration-300 group-hover:top-4 group-hover:left-4" />
                <div className="absolute top-1.5 left-1.5 right-[-3px] bottom-[-3px] bg-gray-200 rounded-2xl
                  transition-all duration-300 group-hover:top-2.5 group-hover:left-2.5" />
                <div className="relative bg-white rounded-2xl border border-gray-100 p-5 h-full
                  shadow-[0_4px_6px_rgba(0,0,0,0.04),0_10px_20px_rgba(0,0,0,0.07)]
                  transition-all duration-300
                  group-hover:-translate-y-1.5 group-hover:shadow-[0_8px_20px_rgba(0,0,0,0.10),0_24px_48px_rgba(0,0,0,0.10)]
                  flex flex-col gap-3">
                  <div className="flex items-start justify-between">
                    <div className="text-gray-400 group-hover:text-gray-700 transition-colors duration-200">
                      {item.icon}
                    </div>
                    <span className="text-[10px] font-bold tracking-wider uppercase text-gray-400 border border-gray-200 px-2 py-0.5 rounded-full"
                      style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                      {item.badge}
                    </span>
                  </div>
                  <div>
                    <p className="font-black text-gray-900 text-base" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                      {item.label}
                    </p>
                    <p className="text-xs text-gray-400 mt-1 leading-relaxed">{item.description}</p>
                  </div>
                  <div className="mt-auto flex items-center gap-1 text-xs font-semibold text-gray-400 group-hover:text-gray-700 transition-colors duration-200"
                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    Open
                    <svg viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3 transition-transform duration-200 group-hover:translate-x-0.5">
                      <path fillRule="evenodd" d="M4.22 4.22a.75.75 0 011.06 0L10 8.94l-4.72 4.72a.75.75 0 01-1.06-1.06L7.94 8.94 4.22 5.28a.75.75 0 010-1.06z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

      
        {/* Quick Access */}
        <div>
          <h3 className="text-xs font-bold text-gray-400 tracking-widest uppercase mb-5"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                        Programs & Records
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 items-stretch">
            {FEATURES.map((item) => (
              <Link key={item.href} href={item.href} className="group relative cursor-pointer h-full block">
                <div className="absolute top-2.5 left-2.5 right-[-5px] bottom-[-5px] bg-gray-300 rounded-2xl
                  transition-all duration-300 group-hover:top-3.5 group-hover:left-3.5" />
                <div className="absolute top-1 left-1 right-[-2.5px] bottom-[-2.5px] bg-gray-200 rounded-2xl
                  transition-all duration-300 group-hover:top-2 group-hover:left-2" />
                <div className="relative bg-white rounded-2xl border border-gray-100 p-4 h-full
                  shadow-[0_4px_6px_rgba(0,0,0,0.04),0_10px_20px_rgba(0,0,0,0.07)]
                  transition-all duration-300
                  group-hover:-translate-y-1 group-hover:shadow-[0_8px_20px_rgba(0,0,0,0.10),0_24px_48px_rgba(0,0,0,0.10)]
                  flex flex-col gap-3">
                  <div className="text-gray-400 group-hover:text-gray-800 transition-colors duration-200">
                    {item.icon}
                  </div>
                  <div className="flex-1">
                    <p className="font-black text-gray-900 text-sm leading-snug"
                      style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                      {item.label}
                    </p>
                    <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">{item.description}</p>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] font-semibold text-gray-300
                    group-hover:text-gray-600 transition-colors duration-200"
                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    Open
                    <svg viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3 transition-transform duration-200 group-hover:translate-x-0.5">
                      <path fillRule="evenodd" d="M4.22 4.22a.75.75 0 011.06 0L10 8.94l-4.72 4.72a.75.75 0 01-1.06-1.06L7.94 8.94 4.22 5.28a.75.75 0 010-1.06z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </DashboardShell>
  );
}
