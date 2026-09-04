'use client';
import { createContext, useContext, useState, useEffect, useCallback, ReactNode, useRef } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { setToken } from '@/lib/token';
import { socket } from '@/lib/socket';

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
  adminLogin: (email: string, password: string) => Promise<AuthUser>;
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

  const hasRestoredSession = useRef(false);
  const ACTIVE_ROLE_KEY = 'nacos_active_role';

  const restoreSession = useCallback(async () => {
  try {
    const { data: r } = await api.post('/auth/refresh');
    setToken(r.accessToken);
    const { data: me } = await api.get('/auth/me');
    setUser(me);

    const savedRole = localStorage.getItem(ACTIVE_ROLE_KEY);
    if (savedRole && me.roles.includes(savedRole)) {
      setOverrideRole(savedRole);
    }
  } catch {
    setUser(null);
    setToken(null);
  } finally {
    setIsLoading(false);
  }
}, []);
useEffect(() => {
  restoreSession();
}, [restoreSession]);

useEffect(() => {
  if (!user) {
    socket.disconnect();
    return;
  }

  function handleConnect() {
    socket.emit('join', { level: user!.level });
  }

  socket.on('connect', handleConnect);
  socket.connect();

  return () => {
    socket.off('connect', handleConnect);
  };
}, [user]);

const login = async (email: string, matricNumber: string, selectedRole: string): Promise<AuthUser> => {
  const { data } = await api.post('/auth/login', { email, matricNumber, selectedRole });
  setToken(data.accessToken);
  setUser(data.user);
  setOverrideRole(selectedRole);
  localStorage.setItem(ACTIVE_ROLE_KEY, selectedRole);
  return data.user;
};

const adminLogin = async (email: string, password: string): Promise<AuthUser> => {
  const { data } = await api.post('/auth/admin-login', { email, password });
  setToken(data.accessToken);
  setUser(data.user);
  setOverrideRole('admin');
  localStorage.setItem(ACTIVE_ROLE_KEY, 'admin');
  return data.user;
};

const logout = async () => {
  try { await api.post('/auth/logout'); } finally {
    setToken(null);
    setUser(null);
    localStorage.removeItem(ACTIVE_ROLE_KEY);
    router.push('/login');
  }
};

return (
  <AuthContext.Provider value={{ user, isLoading, isAuthenticated: !!user, activeRole, setActiveRole, login, adminLogin, logout }}>
    {children}
  </AuthContext.Provider>
);
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
