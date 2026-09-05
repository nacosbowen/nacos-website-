'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { socket } from '@/lib/socket'; // adjust path/export name if different
import { useAuth } from '@/context/AuthContext';
import DashboardShell from '@/components/dashboard/DashboardShell';

type Notification = {
  id: string;
  title: string;
  body: string;
  audience: string;
  category: string;
  createdAt: string;
  isRead: boolean;
};

export default function StudentNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);

  const fetchNotifications = () => {
    api.get('/notifications').then(r => {
      setNotifications(r.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    if (!user?.level) return;

    function handleNew(notification: any) {
      const relevant = notification.audience === 'all' || notification.audience === `level_${user!.level}`;
      if (!relevant) return;
      setNotifications(prev => [{ ...notification, isRead: false }, ...prev]);
    }

    socket.on('notification:new', handleNew);
    return () => {
      socket.off('notification:new', handleNew);
    };
  }, [user?.level]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  async function handleMarkRead(id: string) {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    try {
      await api.patch(`/notifications/${id}/read`);
    } catch {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: false } : n));
    }
  }

  async function handleMarkAllRead() {
    if (unreadCount === 0 || markingAll) return;
    setMarkingAll(true);
    const prevState = notifications;
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    try {
      await api.patch('/notifications/read-all');
    } catch {
      setNotifications(prevState);
    } finally {
      setMarkingAll(false);
    }
  }

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  };

  return (
    <DashboardShell title="Notifications">
      {loading ? (
        <div className="max-w-2xl mx-auto space-y-3 animate-pulse">
          {[1, 2, 3].map(i => <div key={i} className="bg-white rounded-2xl border border-gray-100 h-20" />)}
        </div>
      ) : (
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h2 className="text-xl font-black text-gray-900" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Notifications</h2>
              <p className="text-sm text-gray-400 mt-0.5">
                {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
              </p>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                disabled={markingAll}
                className="text-xs font-bold text-gray-500 hover:text-gray-900 transition disabled:opacity-40"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                Mark all as read
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-14 text-center shadow-[0_2px_4px_rgba(0,0,0,0.04)]">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}
                className="w-12 h-12 text-gray-200 mx-auto mb-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
              </svg>
              <p className="text-sm font-semibold text-gray-400" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>No notifications yet</p>
              <p className="text-xs text-gray-300 mt-1">Updates from your course rep and NACOS executives will appear here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map(n => (
                <div key={n.id}
                  onClick={() => !n.isRead && handleMarkRead(n.id)}
                  className={`bg-white rounded-2xl border p-4 flex gap-3 shadow-[0_2px_4px_rgba(0,0,0,0.04)] transition
                    ${n.isRead ? 'border-gray-100' : 'border-gray-300 cursor-pointer hover:border-gray-400'}`}>
                  {!n.isRead && (
                    <span className="w-2 h-2 rounded-full bg-gray-900 flex-shrink-0 mt-1.5" />
                  )}
                  <div className={`flex-1 min-w-0 ${n.isRead ? 'pl-5' : ''}`}>
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <span className={`text-sm ${n.isRead ? 'font-semibold text-gray-500' : 'font-black text-gray-900'}`}
                        style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                        {n.title}
                      </span>
                      <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full capitalize">
                        {n.category}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 leading-relaxed">{n.body}</p>
                    <p className="text-[10px] text-gray-300 mt-1.5">{timeAgo(n.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </DashboardShell>
  );
}