'use client';
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import DashboardSkeleton from '@/components/dashboard/DashboardSkeleton';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      const isAdminArea = pathname?.startsWith('/dashboard/admin');
      router.replace(isAdminArea ? '/admin-login' : '/login');
    }
  }, [isLoading, isAuthenticated, router, pathname]);

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f5f5]">
        <p className="text-sm text-gray-400">Redirecting to sign in...</p>
      </div>
    );
  }

  return <>{children}</>;
}