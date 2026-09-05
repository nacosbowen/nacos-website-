'use client';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { useEffect } from 'react';

const ROLE_CONFIG: Record<string, {
  label: string;
  description: string;
  path: string;
  icon: React.ReactNode;
}> = {
  executive: {
    label: 'Executive',
    description: 'Broadcast announcements, manage events and view suggestions',
    path: '/dashboard/executive',
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
        <path fillRule="evenodd" d="M18 3a1 1 0 00-1.447-.894L8.763 6H5a3 3 0 000 6h.28l1.771 5.316A1 1 0 008 18h1a1 1 0 001-1v-4.382l6.553 3.276A1 1 0 0018 15V3z" clipRule="evenodd" />
      </svg>
    ),
  },
  course_rep: {
    label: 'Course Rep',
    description: 'Upload past questions and send notifications to your level',
    path: '/dashboard/course-rep',
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
        <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
      </svg>
    ),
  },
  student: {
    label: 'Student',
    description: 'View notifications, download past questions and more',
    path: '/dashboard/student',
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
        <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
      </svg>
    ),
  },
  admin: {
    label: 'Admin',
    description: 'Manage users, roles, departments and system settings',
    path: '/dashboard/admin',
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
        <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
      </svg>
    ),
  },
};

const ROLE_ORDER = ['admin', 'executive', 'course_rep', 'student'];

export default function RolePickerPage() {
  const { user, setActiveRole } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) return;
    if (user.roles.length === 1) {
      const role = user.roles[0];
      router.replace(ROLE_CONFIG[role]?.path ?? '/dashboard/student');
    }
  }, [user, router]);

  if (!user || user.roles.length <= 1) return null;

  const sortedRoles = ROLE_ORDER.filter((r) => user.roles.includes(r));

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[#f7f7f7]">
      <div className="w-full max-w-sm">

        {/* Branding */}
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <Image src="/1690802623935.jpeg" alt="NACOS" width={36} height={36}
            className="rounded-full object-cover border border-gray-200 shadow-sm" />
          <Image src="/bowen-logo.png" alt="Bowen" width={36} height={36}
            className="rounded-full object-cover border border-gray-200 shadow-sm" />
          <span className="text-base font-black text-gray-900" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            NACOS BOWEN
          </span>
        </div>

        <div className="mb-7 text-center">
          <h1 className="text-xl font-black text-gray-900" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Welcome back, {user.fullName.split(' ')[0]}
          </h1>
          <p className="text-gray-400 text-sm mt-1">Select a dashboard to continue</p>
        </div>

        <div className="space-y-3">
          {sortedRoles.map((role) => {
            const config = ROLE_CONFIG[role];
            if (!config) return null;
            return (
              <button
                key={role}
                onClick={() => { setActiveRole(role); router.push(config.path); }}
                className="group w-full flex items-center gap-4 px-5 py-4 rounded-2xl bg-white border border-gray-100 text-left
                  shadow-[0_2px_4px_rgba(0,0,0,0.04),0_6px_12px_rgba(0,0,0,0.06)]
                  hover:shadow-[0_4px_8px_rgba(0,0,0,0.06),0_12px_24px_rgba(0,0,0,0.08)]
                  hover:-translate-y-0.5 transition-all duration-200"
              >
                <div className="w-9 h-9 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center
                  text-gray-500 group-hover:bg-gray-900 group-hover:text-white group-hover:border-gray-900
                  transition-all duration-200 flex-shrink-0">
                  {config.icon}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-gray-900" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    {config.label}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5 truncate">{config.description}</p>
                </div>
                <svg viewBox="0 0 16 16" fill="currentColor"
                  className="w-4 h-4 text-gray-300 group-hover:text-gray-600 ml-auto flex-shrink-0 transition-colors duration-200">
                  <path fillRule="evenodd" d="M4.22 4.22a.75.75 0 011.06 0L10 8.94l-4.72 4.72a.75.75 0 01-1.06-1.06L7.94 8.94 4.22 5.28a.75.75 0 010-1.06z" clipRule="evenodd" />
                </svg>
              </button>
            );
          })}
        </div>

      </div>
    </div>
  );
}
