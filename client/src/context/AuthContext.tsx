'use client';
import { createContext, useContext, useState, useEffect, useCallback, ReactNode, useRef } from 'react';
import { useRouter } from 'next/navigation';
import api, { refreshAccessToken } from '@/lib/api';
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
  oneTime?: boolean;
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
const [popupQueue, setPopupQueue] = useState<PopupNotification[]>([]);
const popup = popupQueue[0] ?? null;
  const router = useRouter();

  const activeRole = overrideRole ?? (user ? getTopRole(user.roles) : 'student');
  const setActiveRole = (role: string) => setOverrideRole(role);

  const hasRestoredSession = useRef(false);
  const ACTIVE_ROLE_KEY = 'nacos_active_role';

const restoreSession = useCallback(async () => {
  const attempt = async () => {
   await refreshAccessToken();
    const { data: me } = await api.get('/auth/me');
    setUser(me);

    const savedRole = localStorage.getItem(ACTIVE_ROLE_KEY);
    if (savedRole && me.roles.includes(savedRole)) {
      setOverrideRole(savedRole);
    }
  };

  try {
    try {
      await attempt();
    } catch (err: any) {
      const status = err?.response?.status;
      // 401/403 means the session is genuinely invalid: don't retry.
      if (status === 401 || status === 403) throw err;
      // Anything else (network error, 500, 503, database hiccup): wait and retry once.
      await new Promise((resolve) => setTimeout(resolve, 1500));
      await attempt();
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

// Popups are fetched only right after a student logs in, never on refresh.
const loadPopups = () => {
  api.get('/notifications/popups')
    .then((r) => {
      const list = Array.isArray(r.data) ? r.data : r.data?.popups ?? [];
      setPopupQueue(list);
    })
    .catch(() => {});
};

const dismissPopup = () => {
  const current = popupQueue[0];
  // One-time notices are marked as seen on the server, so they never return.
  if (current?.oneTime) {
    api.patch(`/notifications/${current.id}/read`).catch(() => {});
  }
  setPopupQueue((q) => q.slice(1));
};

const login = async (email: string, password: string, selectedRole: string): Promise<AuthUser> => {
  const { data } = await api.post('/auth/login', { email, password, selectedRole });
  setToken(data.accessToken);
  setUser(data.user);
  setOverrideRole(selectedRole);
  localStorage.setItem(ACTIVE_ROLE_KEY, selectedRole);
    if (selectedRole === 'student') loadPopups();
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
    setPopupQueue([]);
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