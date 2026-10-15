'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api'
import WeeklyOverview from '@/components/features/WeeklyOverview';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

type ClassEntry = { id: string; name: string; code: string; day: string; start: string; end: string; venue: string };

export default function StudentTimetable() {
  const { user, isLoading: authLoading } = useAuth();
  const level = user?.level ?? 200;
  const departmentId = user?.department?.id;

  const [classes, setClasses] = useState<ClassEntry[]>([]);
  const [ttLoading, setTtLoading] = useState(true);
  const [activeDay, setActiveDay] = useState(() => {
    const d = new Date().getDay();
    return d >= 1 && d <= 5 ? DAYS[d - 1] : 'Monday';
  });


  useEffect(() => {
    if (authLoading || !departmentId) return;

    const fetchTimetable = async () => {
      setTtLoading(true);
      try {
        const { data } = await api.get('/timetable', { params: { departmentId, level } });
        const mapped: ClassEntry[] = data.map((e: any) => ({
          id: e.id,
          name: e.courseTitle,
          code: e.courseCode,
          day: e.day.charAt(0) + e.day.slice(1).toLowerCase(),
          start: e.startTime,
          end: e.endTime,
          venue: e.venue || '',
        }));
        setClasses(mapped);
      } catch {
        setClasses([]);
      } finally {
        setTtLoading(false);
      }
    };

    fetchTimetable();
    const interval = setInterval(fetchTimetable, 30000);
    return () => clearInterval(interval);
  }, [departmentId, level, authLoading]);

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
    {/* Weekly overview */}
{classes.length > 0 && <WeeklyOverview classes={classes} />}
    </div>
  );
}
