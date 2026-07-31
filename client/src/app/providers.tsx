'use client';
import { useState, useCallback } from 'react';
import { AuthProvider } from '@/context/AuthContext';
import SplashScreen from '@/components/SplashScreen';

export function Providers({ children }: { children: React.ReactNode }) {
  const [showSplash, setShowSplash] = useState(true);
  const handleSplashComplete = useCallback(() => setShowSplash(false), []);
  return (
    <AuthProvider>
      {showSplash && <SplashScreen onComplete={handleSplashComplete} />}
      {children}
    </AuthProvider>
  );
}
