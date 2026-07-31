'use client';
import Link from 'next/link';
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
  {
    href: '/dashboard/course-rep/events',
    label: 'Events',
    description: 'View and share upcoming NACOS events with your level',
    badge: 'Events',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-7 h-7">
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
      </svg>
    ),
  },
];

const STATS = [
  { label: 'Your Level', value: '—', sub: 'students enrolled' },
  { label: 'Notifications Sent', value: '—', sub: 'this semester' },
  { label: 'Questions Uploaded', value: '—', sub: 'past questions' },
];

const FEATURES = [
  {
    href: '/dashboard/course-rep/timetable',
    label: 'Class Timetable',
    description: 'View your department class schedule for the semester',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-7 h-7"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z" /></svg>,
  },
  {
    href: '/dashboard/course-rep/events',
    label: 'NACOS Calendar Events',
    description: 'All upcoming NACOS events, workshops, and competitions in one place',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-7 h-7"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>,
  },
  {
    href: '/dashboard/course-rep/suggestions',
    label: 'Suggestion Box',
    description: 'Send anonymous feedback or suggestions to the NACOS executives',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-7 h-7"><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" /></svg>,
  },
  {
    href: '/dashboard/course-rep/voting',
    label: 'NACOS Voting',
    description: 'Cast your vote in NACOS elections and polls securely',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-7 h-7"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  },
  {
    href: '/dashboard/course-rep/past-questions',
    label: 'Past Questions',
    description: 'Download exam past questions for your level and department',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-7 h-7"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>,
  },
  {
    href: '/dashboard/course-rep/cgpa',
    label: 'CGPA Calculator',
    description: 'Calculate and track your CGPA across all semesters',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-7 h-7"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 15.75V18m-7.5-6.75h.008v.008H8.25v-.008zm0 2.25h.008v.008H8.25V13.5zm0 2.25h.008v.008H8.25v-.008zm0 2.25h.008v.008H8.25V18zm2.498-6.75h.007v.008h-.007v-.008zm0 2.25h.007v.008h-.007V13.5zm0 2.25h.007v.008h-.007v-.008zm0 2.25h.007v.008h-.007V18zm2.504-6.75h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V13.5zm0 2.25h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V18zm2.498-6.75h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V13.5zM8.25 6h7.5v2.25h-7.5V6zM12 2.25c-1.892 0-3.758.11-5.593.322C5.307 2.7 4.5 3.65 4.5 4.757V19.5a2.25 2.25 0 002.25 2.25h10.5a2.25 2.25 0 002.25-2.25V4.757c0-1.108-.806-2.057-1.907-2.185A48.507 48.507 0 0012 2.25z" /></svg>,
  },
  {
    href: '/dashboard/course-rep/id-card',
    label: 'ID Card',
    description: 'View and download your NACOS digital student ID card',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-7 h-7"><path strokeLinecap="round" strokeLinejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z" /></svg>,
  },
  {
    href: '/dashboard/course-rep/nacos-ai',
    label: 'NACOS AI',
    description: 'Your AI study assistant — ask questions, get summaries, study smarter',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-7 h-7"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" /></svg>,
  },
  {
    href: '/dashboard/course-rep/dinner',
    label: 'NACOS Dinner Theme',
    description: 'Check the theme, dress code and details for the NACOS annual dinner',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-7 h-7"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513m6-4.871c1.355 0 2.697.056 4.024.166C17.155 8.51 18 9.473 18 10.608v2.513M15 8.25v-1.5m-6 1.5v-1.5m12 9.75l-1.5.75a3.354 3.354 0 01-3 0 3.354 3.354 0 00-3 0 3.354 3.354 0 01-3 0 3.354 3.354 0 00-3 0 3.354 3.354 0 01-1.5-.75M3 12.75V10.5a9 9 0 0118 0v2.25" /></svg>,
  },
  {
    href: '/dashboard/course-rep/exam-timetable',
    label: 'Exam Timetable',
    description: 'View your examination schedule, dates, times and venues',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-7 h-7"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  },
  {
    href: '/dashboard/course-rep/rsvp',
    label: 'RSVP Tickets',
    description: 'Reserve your spot and get tickets for NACOS events and programs',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-7 h-7"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 010 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 010-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375z" /></svg>,
  },
  {
    href: '/dashboard/course-rep/archive',
    label: 'NACOS Archive',
    description: 'Access historical NACOS documents, photos, and past records',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-7 h-7"><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" /></svg>,
  },
  {
    href: '/dashboard/course-rep/dev-team',
    label: 'NACOS Dev Team',
    description: 'Join the NACOS developer community and contribute to tech projects',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-7 h-7"><path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" /></svg>,
  },
];

export default function CourseRepDashboard() {
  const { user } = useAuth();

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

        {/* Recent activity placeholder */}
        <div>
          <h3 className="text-xs font-bold text-gray-400 tracking-widest uppercase mb-4"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Recent Activity
          </h3>
          <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center
            shadow-[0_2px_4px_rgba(0,0,0,0.04),0_6px_12px_rgba(0,0,0,0.06)]">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}
              className="w-8 h-8 text-gray-200 mx-auto mb-3">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-gray-400">No activity yet</p>
            <p className="text-xs text-gray-300 mt-1">Your posts and uploads will appear here</p>
          </div>
        </div>

        {/* Quick Access */}
        <div>
          <h3 className="text-xs font-bold text-gray-400 tracking-widest uppercase mb-5"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Quick Access
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
