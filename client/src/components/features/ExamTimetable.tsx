'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';

type Exam = {
  id: string; courseCode: string; courseTitle: string;
  date: string; time: string; duration: string; venue: string | null;
};

export default function ExamTimetable() {
  const { user, isLoading: authLoading } = useAuth();
  const departmentId = user?.department?.id;
  const level = user?.level;

  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading || !departmentId || !level) return;

    const fetchExams = async () => {
      setLoading(true);
      try {
        const { data } = await api.get('/exams', { params: { departmentId, level } });
        setExams(data);
      } catch {
        setExams([]);
      } finally {
        setLoading(false);
      }
    };

    fetchExams();
    const id = setInterval(fetchExams, 30000);
    return () => clearInterval(id);
  }, [departmentId, level, authLoading]);

  const today = new Date(); today.setHours(0, 0, 0, 0);

  function badge(dateStr: string) {
    const d = new Date(dateStr); d.setHours(0, 0, 0, 0);
    const diff = Math.floor((d.getTime() - today.getTime()) / 86400000);
    if (diff === 0) return { label: 'TODAY', cls: 'bg-red-600 text-white' };
    if (diff === 1) return { label: 'TOMORROW', cls: 'bg-orange-500 text-white' };
    if (diff <= 3) return { label: 'SOON', cls: 'bg-yellow-500 text-white' };
    return null;
  }

  const sorted = [...exams].sort((a, b) => a.date.localeCompare(b.date));
  const upcoming = sorted.filter(e => new Date(e.date) >= today);
  const past = sorted.filter(e => new Date(e.date) < today);

  if (loading) return (
    <div className="max-w-3xl mx-auto space-y-3 animate-pulse">
      {[1, 2, 3].map(i => <div key={i} className="bg-white rounded-2xl border border-gray-100 h-20" />)}
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-black text-gray-900" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Exam Timetable</h2>
        <p className="text-sm text-gray-400 mt-0.5">
          {level}L · {user?.department?.name} · auto-refreshes
        </p>
      </div>

      {exams.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-14 text-center shadow-[0_2px_4px_rgba(0,0,0,0.04)]">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}
            className="w-12 h-12 text-gray-200 mx-auto mb-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 9v7.5" />
          </svg>
          <p className="text-sm font-semibold text-gray-400" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>No exam timetable published yet</p>
          <p className="text-xs text-gray-300 mt-1">The exam schedule will appear here once published by the executives</p>
        </div>
      ) : (
        <div className="space-y-6">
          {upcoming.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs font-bold text-gray-400 tracking-widest uppercase"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Upcoming · {upcoming.length}</p>
              {upcoming.map(exam => {
                const b = badge(exam.date);
                const d = new Date(exam.date);
                return (
                  <div key={exam.id} className="bg-white rounded-2xl border border-gray-100 p-5
                    shadow-[0_2px_4px_rgba(0,0,0,0.04)]">
                    <div className="flex items-center gap-2 flex-wrap mb-1.5">
                      <span className="text-sm font-black text-gray-900"
                        style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{exam.courseCode}</span>
                      {b && <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${b.cls}`}>{b.label}</span>}
                    </div>
                    <p className="text-sm font-semibold text-gray-800">{exam.courseTitle}</p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-gray-400 flex-wrap">
                      <span>{d.toLocaleDateString('en-NG', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                      <span>·</span><span>{exam.time}</span>
                      <span>·</span><span>{exam.venue || 'TBA'}</span>
                      <span>·</span><span>{exam.duration}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {past.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs font-bold text-gray-400 tracking-widest uppercase"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Past · {past.length}</p>
              {past.map(exam => (
                <div key={exam.id} className="bg-white rounded-2xl border border-gray-100 p-4 opacity-50
                  shadow-[0_2px_4px_rgba(0,0,0,0.04)]">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-black text-gray-700"
                      style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{exam.courseCode}</span>
                  </div>
                  <p className="text-sm text-gray-600">{exam.courseTitle}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(exam.date).toLocaleDateString('en-NG', { weekday: 'short', day: 'numeric', month: 'short' })} · {exam.time}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}