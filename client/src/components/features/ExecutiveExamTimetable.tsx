'use client';
import { useState, useEffect } from 'react';

const DEPTS = ['Computer Science', 'Software Engineering', 'Cyber Security', 'Information Technology'];
const LEVELS = ['100L', '200L', '300L', '400L'];
const EMPTY = { code: '', course: '', date: '', time: '', venue: '', level: '100L', dept: 'Computer Science', duration: '2 hrs' };

type Exam = { id: string; code: string; course: string; date: string; time: string; venue: string; level: string; dept: string; duration: string };

function load(): Exam[] {
  try { return JSON.parse(localStorage.getItem('nacos_exams') ?? '[]'); } catch { return []; }
}
function save(data: Exam[]) { localStorage.setItem('nacos_exams', JSON.stringify(data)); }

export default function ExecutiveExamTimetable() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [form, setForm] = useState({ ...EMPTY });
  const [showForm, setShowForm] = useState(false);
  const [toast, setToast] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => { setExams(load()); }, []);

  function persist(data: Exam[]) { setExams(data); save(data); }

  function addExam() {
    if (!form.code.trim() || !form.course.trim() || !form.date || !form.time) return;
    const sorted = [...exams, { ...form, id: Date.now().toString() }]
      .sort((a, b) => a.date.localeCompare(b.date));
    persist(sorted);
    setForm({ ...EMPTY });
    setShowForm(false);
    flash('Exam published to students ✓');
  }

  function flash(msg: string) { setToast(msg); setTimeout(() => setToast(''), 3000); }

  const grouped = exams.reduce<Record<string, Exam[]>>((acc, e) => {
    (acc[e.date] = acc[e.date] ?? []).push(e);
    return acc;
  }, {});

  const today = new Date(); today.setHours(0, 0, 0, 0);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {toast && (
        <div className="fixed top-5 right-5 z-50 bg-gray-900 text-white px-4 py-2.5 rounded-xl text-sm font-semibold
          shadow-lg flex items-center gap-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-green-400 flex-shrink-0">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          {toast}
        </div>
      )}

      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-black text-gray-900" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Exam Timetable</h2>
          <p className="text-sm text-gray-400 mt-0.5">Manage and publish exam schedules · {exams.length} exam{exams.length !== 1 ? 's' : ''} published</p>
        </div>
        <button onClick={() => setShowForm(s => !s)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-gray-900 hover:bg-gray-800 transition"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Add Exam
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4 shadow-[0_4px_16px_rgba(0,0,0,0.08)]">
          <p className="text-sm font-black text-gray-900" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>New Exam Slot</p>
          <div className="grid grid-cols-2 gap-3">
            {([
              ['Course Code', 'code', 'e.g. CSC 301', 'text'],
              ['Course Title', 'course', 'e.g. Algorithm Design', 'text'],
              ['Date', 'date', '', 'date'],
              ['Time', 'time', 'e.g. 9:00 AM', 'text'],
              ['Venue', 'venue', 'e.g. Exam Hall A', 'text'],
              ['Duration', 'duration', 'e.g. 2 hrs', 'text'],
            ] as [string, keyof typeof EMPTY, string, string][]).map(([label, key, ph, type]) => (
              <div key={key}>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{label}</label>
                <input type={type} value={form[key]} placeholder={ph}
                  onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
              </div>
            ))}
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Level</label>
              <select value={form.level} onChange={e => setForm(f => ({ ...f, level: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900">
                {LEVELS.map(l => <option key={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Department</label>
              <select value={form.dept} onChange={e => setForm(f => ({ ...f, dept: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900">
                {DEPTS.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <button onClick={addExam}
              disabled={!form.code.trim() || !form.course.trim() || !form.date || !form.time}
              className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-gray-900 hover:bg-gray-800
                disabled:opacity-40 disabled:cursor-not-allowed transition"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Publish Exam</button>
            <button onClick={() => { setShowForm(false); setForm({ ...EMPTY }); }}
              className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-100 transition"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Cancel</button>
          </div>
        </div>
      )}

      {exams.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-14 text-center shadow-[0_2px_4px_rgba(0,0,0,0.04)]">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}
            className="w-12 h-12 text-gray-200 mx-auto mb-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 9v7.5" />
          </svg>
          <p className="text-sm font-semibold text-gray-400" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>No exams added yet</p>
          <p className="text-xs text-gray-300 mt-1">Add exam slots to publish them to all students</p>
        </div>
      ) : (
        <div className="space-y-5">
          {Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b)).map(([date, dayExams]) => {
            const d = new Date(date + 'T12:00:00');
            const examDay = new Date(d); examDay.setHours(0, 0, 0, 0);
            const isToday = examDay.getTime() === today.getTime();
            return (
              <div key={date}>
                <div className="flex items-center gap-2 mb-2">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide"
                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    {d.toLocaleDateString('en-NG', { weekday: 'long', day: 'numeric', month: 'long' })}
                  </p>
                  {isToday && <span className="text-[10px] font-bold text-white bg-gray-900 px-2 py-0.5 rounded-full">TODAY</span>}
                </div>
                <div className="space-y-2">
                  {dayExams.map(exam => (
                    <div key={exam.id} className="bg-white rounded-2xl border border-gray-100 p-4
                      flex items-center gap-4 shadow-[0_2px_4px_rgba(0,0,0,0.04)]">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-black text-gray-900" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{exam.code}</span>
                          <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{exam.level}</span>
                          <span className="text-[10px] font-bold text-blue-600 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full">{exam.dept.split(' ')[0]}</span>
                        </div>
                        <p className="text-sm text-gray-700 mt-0.5">{exam.course}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{exam.time} · {exam.venue} · {exam.duration}</p>
                      </div>
                      {deleteId === exam.id ? (
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <p className="text-xs text-gray-500">Remove?</p>
                          <button onClick={() => { persist(exams.filter(e => e.id !== exam.id)); setDeleteId(null); }}
                            className="px-2.5 py-1 rounded-lg bg-red-600 text-white text-xs font-bold">Yes</button>
                          <button onClick={() => setDeleteId(null)}
                            className="px-2.5 py-1 rounded-lg bg-gray-100 text-gray-600 text-xs font-bold">No</button>
                        </div>
                      ) : (
                        <button onClick={() => setDeleteId(exam.id)}
                          className="p-1.5 rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-50 transition flex-shrink-0">
                          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
