'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const MSG_TYPES: Record<string, { label: string; color: string; icon: string }> = {
  class_cancelled: { label: 'Class Cancelled', color: 'bg-red-50 border-red-200 text-red-700', icon: '🚫' },
  assignment:      { label: 'Assignment',       color: 'bg-blue-50 border-blue-200 text-blue-700', icon: '📝' },
  test:            { label: 'Test / CAT',        color: 'bg-orange-50 border-orange-200 text-orange-700', icon: '📋' },
  presentation:    { label: 'Presentation',     color: 'bg-purple-50 border-purple-200 text-purple-700', icon: '🎤' },
  custom:          { label: 'Notice',           color: 'bg-gray-50 border-gray-200 text-gray-700', icon: '📢' },
};

type ClassEntry = { id: string; name: string; code: string; day: string; start: string; end: string; venue: string };
type Message = { id: string; type: string; text: string; course: string; timestamp: number };

export default function StudentTimetable() {
  const { user } = useAuth();
  const level = user?.level ?? 200;

  const [classes, setClasses] = useState<ClassEntry[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeDay, setActiveDay] = useState(() => {
    const d = new Date().getDay();
    return d >= 1 && d <= 5 ? DAYS[d - 1] : 'Monday';
  });

  useEffect(() => {
    const loadData = () => {
      const storedClasses = localStorage.getItem(`nacos_timetable_${level}L`);
      const storedMsgs = localStorage.getItem(`nacos_messages_${level}L`);
      if (storedClasses) setClasses(JSON.parse(storedClasses));
      if (storedMsgs) setMessages(JSON.parse(storedMsgs));
    };
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, [level]);

  const todayClasses = classes
    .filter(c => c.day === activeDay)
    .sort((a, b) => a.start.localeCompare(b.start));

  const now = new Date();
  const todayName = now.getDay() >= 1 && now.getDay() <= 5 ? DAYS[now.getDay() - 1] : '';

  function isOngoing(c: ClassEntry) {
    if (activeDay !== todayName) return false;
    const [sh, sm] = c.start.split(':').map(Number);
    const [eh, em] = c.end.split(':').map(Number);
    const startMins = sh * 60 + (sm || 0);
    const endMins = eh * 60 + (em || 0);
    const nowMins = now.getHours() * 60 + now.getMinutes();
    return nowMins >= startMins && nowMins < endMins;
  }

  const recentMessages = messages.slice(0, 5);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-black text-gray-900" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          Class Timetable
        </h2>
        <p className="text-sm text-gray-400 mt-0.5">
          {level}L · {user?.department?.name ?? 'Computer Science'}
        </p>
      </div>

      {/* Course Rep Announcements */}
      {recentMessages.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-bold text-gray-400 tracking-widest uppercase"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            From Your Course Rep
          </p>
          {recentMessages.map(m => {
            const t = MSG_TYPES[m.type] ?? MSG_TYPES.custom;
            return (
              <div key={m.id} className={`rounded-2xl border px-4 py-3.5 flex items-start gap-3 ${t.color}`}>
                <span className="text-lg flex-shrink-0 mt-0.5">{t.icon}</span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <span className="text-xs font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{t.label}</span>
                    {m.course && (
                      <span className="text-xs font-semibold opacity-60" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{m.course}</span>
                    )}
                  </div>
                  <p className="text-sm">{m.text}</p>
                  <p className="text-xs opacity-50 mt-1">
                    {new Date(m.timestamp).toLocaleString('en-NG', { dateStyle: 'medium', timeStyle: 'short' })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Day selector */}
      <div className="flex gap-1.5 flex-wrap">
        {DAYS.map((d, i) => {
          const isToday = d === todayName;
          const hasClasses = classes.some(c => c.day === d);
          return (
            <button key={d} onClick={() => setActiveDay(d)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all relative
                ${activeDay === d
                  ? 'bg-gray-900 text-white shadow-sm'
                  : isToday
                    ? 'bg-gray-100 text-gray-900 border border-gray-200'
                    : 'bg-white text-gray-500 border border-gray-200 hover:border-gray-300'
                }`}
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              {d.slice(0, 3)}
              {isToday && activeDay !== d && (
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-gray-900" />
              )}
              {hasClasses && activeDay !== d && !isToday && (
                <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-gray-400" />
              )}
            </button>
          );
        })}
      </div>

      {/* Classes for selected day */}
      {classes.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center
          shadow-[0_2px_4px_rgba(0,0,0,0.04)]">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}
            className="w-10 h-10 text-gray-200 mx-auto mb-3">
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
          </svg>
          <p className="text-sm font-semibold text-gray-400" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            No timetable yet
          </p>
          <p className="text-xs text-gray-300 mt-1">Your course rep hasn't published the schedule yet</p>
        </div>
      ) : todayClasses.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center
          shadow-[0_2px_4px_rgba(0,0,0,0.04)]">
          <p className="text-sm text-gray-400">No classes on {activeDay}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {todayClasses.map(c => {
            const ongoing = isOngoing(c);
            return (
              <div key={c.id}
                className={`bg-white rounded-2xl border p-5 flex items-center gap-4
                  shadow-[0_2px_4px_rgba(0,0,0,0.04)]
                  ${ongoing ? 'border-gray-900 shadow-[0_4px_12px_rgba(0,0,0,0.12)]' : 'border-gray-100'}`}>
                <div className={`w-1 h-12 rounded-full flex-shrink-0 ${ongoing ? 'bg-gray-900' : 'bg-gray-200'}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-black text-gray-900"
                      style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{c.name}</p>
                    {ongoing && (
                      <span className="text-[10px] font-bold text-white bg-gray-900 px-2 py-0.5 rounded-full animate-pulse"
                        style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                        ONGOING
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">{c.code}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs font-bold text-gray-700" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    {c.start} – {c.end}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">{c.venue}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Full week summary */}
      {classes.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden
          shadow-[0_2px_4px_rgba(0,0,0,0.04)]">
          <div className="px-5 py-3 border-b border-gray-100">
            <p className="text-xs font-bold text-gray-400 tracking-widest uppercase"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Weekly Summary</p>
          </div>
          <div className="divide-y divide-gray-50">
            {DAYS.map(d => {
              const dc = classes.filter(c => c.day === d).sort((a, b) => a.start.localeCompare(b.start));
              return (
                <div key={d} className="px-5 py-3 flex items-start gap-4">
                  <p className="text-xs font-bold text-gray-400 w-14 pt-0.5 flex-shrink-0"
                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{d.slice(0, 3).toUpperCase()}</p>
                  {dc.length === 0 ? (
                    <p className="text-xs text-gray-300">Free day</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {dc.map(c => (
                        <span key={c.id} className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full"
                          style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                          {c.start} {c.code}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
