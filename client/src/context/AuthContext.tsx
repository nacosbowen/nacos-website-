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

export interface PopupNotification {
  id: string;
  title: string;
  body: string;
  category: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  activeRole: string;
  setActiveRole: (role: string) => void;
  login: (email: string, password: string, selectedRole: string) => Promise<AuthUser>;
  signup: (email: string, matricNumber: string, password: string) => Promise<string>;
  forgotPassword: (email: string) => Promise<string>;
  resetPassword: (email: string, token: string, newPassword: string) => Promise<string>;

  adminLogin: (email: string, password: string) => Promise<AuthUser>;
  logout: () => Promise<void>;

  popup: PopupNotification | null;
  dismissPopup: () => void;
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
  const [popup, setPopup] = useState<PopupNotification | null>(null);
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

// Check for an active broadcast popup once per login/session — keyed on
// user id, so this fires once when a user first becomes authenticated
// (fresh login, or a page reload that restores the session), not on
// every internal dashboard navigation.
useEffect(() => {
  if (!user) {
    setPopup(null);
    return;
  }
  api.get('/notifications/popup')
    .then((r) => {
      if (r.data) setPopup(r.data);
    })
    .catch(() => {});
}, [user?.id]);

// Dismissing only hides the popup for this session/login — it is not
// marked as permanently read, so it will show again the next time the
// student logs in, for as long as the executive's day window is active.
const dismissPopup = () => setPopup(null);

const login = async (email: string, password: string, selectedRole: string): Promise<AuthUser> => {
  const { data } = await api.post('/auth/login', { email, password, selectedRole });
  setToken(data.accessToken);
  setUser(data.user);
  setOverrideRole(selectedRole);
  localStorage.setItem(ACTIVE_ROLE_KEY, selectedRole);
  return data.user;
};

const signup = async (email: string, matricNumber: string, password: string): Promise<string> => {
  const { data } = await api.post('/auth/signup', { email, matricNumber, password });
  return data.message;
};

const forgotPassword = async (email: string): Promise<string> => {
  const { data } = await api.post('/auth/forgot-password', { email });
  return data.message;
};

const resetPassword = async (email: string, token: string, newPassword: string): Promise<string> => {
  const { data } = await api.post('/auth/reset-password', { email, token, newPassword });
  return data.message;
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
  setToken(null);
  setUser(null);
  localStorage.removeItem(ACTIVE_ROLE_KEY);
  router.push('/login');
  try { await api.post('/auth/logout'); } catch {}
};

return (
  <AuthContext.Provider value={{ user, isLoading, isAuthenticated: !!user, activeRole, setActiveRole, login, signup, forgotPassword, resetPassword, adminLogin, logout, popup, dismissPopup }}>
    {children}
  </AuthContext.Provider>
);
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}