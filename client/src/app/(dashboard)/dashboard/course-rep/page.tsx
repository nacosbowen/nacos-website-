'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import DashboardShell from '@/components/dashboard/DashboardShell';

const ACTIONS = [
  {
    href: '/dashboard/course-rep/notifications',
    label: 'Post Notification',
    description: 'Send an announcement directly to students in your level',
    badge: 'Notify Level',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-7 h-7">
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
      </svg>
    ),
  },
  {
    href: '/dashboard/course-rep/past-questions',
    label: 'Upload Past Questions',
    description: 'Upload exam past questions to help students in your department',
    badge: 'Upload',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-7 h-7">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
      </svg>
    ),
  },
  {
    href: '/dashboard/course-rep/timetable',
    label: 'Manage Timetable',
    description: 'Update and manage the class timetable for your level',
    badge: 'Timetable',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-7 h-7">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
      </svg>
    ),
  },
];


export default function CourseRepDashboard() {
  const { user } = useAuth();
    const [stats, setStats] = useState<{
    students: number;
    notificationsSent: number;
    questionsUploaded: number;
  } | null>(null);

  useEffect(() => {
    api.get('/stats/course-rep')
      .then(({ data }) => setStats(data))
      .catch(() => setStats(null));
  }, []);

  const STATS = [
    { label: 'Your Level', value: stats ? String(stats.students) : '—', sub: 'students enrolled' },
    { label: 'Notifications Sent', value: stats ? String(stats.notificationsSent) : '—', sub: 'in total' },
    { label: 'Questions Uploaded', value: stats ? String(stats.questionsUploaded) : '—', sub: 'past questions' },
  ];

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <DashboardShell title="Course Rep Dashboard">
      <div className="max-w-5xl mx-auto space-y-7">

        {/* Welcome banner */}
        <div className="relative overflow-hidden rounded-2xl px-7 py-6
          shadow-[0_4px_6px_rgba(0,0,0,0.07),0_10px_20px_rgba(0,0,0,0.10)]"
          style={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)' }}>
          <div className="absolute inset-0 opacity-[0.04]"
            style={{ backgroundImage: 'radial-gradient(circle at 70% 50%, white 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
          {/* Subtle accent line */}
          <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-white/30 to-transparent rounded-l-2xl" />
          <div className="relative">
            <p className="text-white/50 text-xs font-medium tracking-widest uppercase mb-1"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              {greeting}
            </p>
            <h2 className="text-2xl font-black text-white leading-tight"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              {user?.fullName ?? 'Course Rep'}
            </h2>
            <div className="flex items-center gap-2 mt-2.5">
              <span className="text-xs font-semibold text-white/60 bg-white/10 px-2.5 py-1 rounded-full"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                {user?.courseRepLevel ?? user?.level}L Rep
              </span>
              <span className="text-xs font-semibold text-white/60 bg-white/10 px-2.5 py-1 rounded-full"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                {user?.department?.name ?? user?.department?.code}
              </span>
              <span className="text-xs font-bold text-white bg-white/20 px-2.5 py-1 rounded-full border border-white/20"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                Course Rep
              </span>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {STATS.map((stat) => (
            <div key={stat.label} className="bg-white rounded-2xl border border-gray-100 px-5 py-4
              shadow-[0_2px_4px_rgba(0,0,0,0.04),0_6px_12px_rgba(0,0,0,0.06)]">
              <p className="text-2xl font-black text-gray-900" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                {stat.value}
              </p>
              <p className="text-sm font-semibold text-gray-700 mt-0.5">{stat.label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{stat.sub}</p>
            </div>
          ))}
        </div>

        {/* Responsibilities */}
        <div>
          <h3 className="text-xs font-bold text-gray-400 tracking-widest uppercase mb-4"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Your Responsibilities
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

      </div>
    </DashboardShell>
  );
}
