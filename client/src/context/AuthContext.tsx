'use client';
import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { setToken } from '@/lib/token';

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  matricNumber: string;
  level: number;
  department: { id: number; name: string; code: string };
  profilePictureUrl: string | null;
  roles: string[];
  courseRepLevel: number | null;
}

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  activeRole: string;
  setActiveRole: (role: string) => void;
  login: (email: string, matricNumber: string, selectedRole: string) => Promise<AuthUser>;
  logout: () => Promise<void>;
}

const ROLE_PRIORITY = ['admin', 'executive', 'course_rep', 'student'];

function getTopRole(roles: string[]): string {
  return ROLE_PRIORITY.find((r) => roles.includes(r)) ?? 'student';
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [overrideRole, setOverrideRole] = useState<string | null>(null);
  const router = useRouter();

  const activeRole = overrideRole ?? (user ? getTopRole(user.roles) : 'student');
  const setActiveRole = (role: string) => setOverrideRole(role);

  const restoreSession = useCallback(async () => {
    try {
      const { data: r } = await api.post('/auth/refresh');
      setToken(r.accessToken);
      const { data: me } = await api.get('/auth/me');
      setUser(me);
    } catch {
      setUser(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { restoreSession(); }, [restoreSession]);

  const login = async (email: string, matricNumber: string, selectedRole: string): Promise<AuthUser> => {
    const { data } = await api.post('/auth/login', { email, matricNumber, selectedRole });
    setToken(data.accessToken);
    setUser(data.user);
    return data.user;
  };

  const logout = async () => {
    try { await api.post('/auth/logout'); } finally {
      setToken(null);
      setUser(null);
      router.push('/login');
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, isAuthenticated: !!user, activeRole, setActiveRole, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
