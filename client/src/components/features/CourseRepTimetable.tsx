'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const TIMES = ['7:00', '8:00', '9:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'];
const MSG_TYPES = [
  { value: 'class_cancelled', label: 'Class Cancelled', color: 'bg-red-100 text-red-700 border-red-200' },
  { value: 'assignment', label: 'Assignment', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { value: 'test', label: 'Test / CAT', color: 'bg-orange-100 text-orange-700 border-orange-200' },
  { value: 'presentation', label: 'Presentation', color: 'bg-purple-100 text-purple-700 border-purple-200' },
  { value: 'custom', label: 'General Notice', color: 'bg-gray-100 text-gray-700 border-gray-200' },
];

type ClassEntry = { id: string; name: string; code: string; day: string; start: string; end: string; venue: string };
type Message = { id: string; type: string; text: string; course: string; timestamp: number };

function storageKey(level: number, type: string) {
  return `nacos_${type}_${level}L`;
}

export default function CourseRepTimetable() {
  const { user } = useAuth();
  const level = user?.courseRepLevel ?? user?.level ?? 200;

  const [tab, setTab] = useState<'timetable' | 'announcements'>('timetable');
  const [classes, setClasses] = useState<ClassEntry[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [saved, setSaved] = useState(false);

  const [form, setForm] = useState({ name: '', code: '', day: 'Monday', start: '8:00', end: '10:00', venue: '' });
  const [showForm, setShowForm] = useState(false);

  const [msg, setMsg] = useState({ type: 'custom', text: '', course: '' });
  const [msgSent, setMsgSent] = useState(false);

  useEffect(() => {
    const storedClasses = localStorage.getItem(storageKey(level, 'timetable'));
    const storedMsgs = localStorage.getItem(storageKey(level, 'messages'));
    if (storedClasses) setClasses(JSON.parse(storedClasses));
    if (storedMsgs) setMessages(JSON.parse(storedMsgs));
  }, [level]);

  function addClass() {
    if (!form.name || !form.code || !form.venue) return;
    const entry: ClassEntry = { ...form, id: Date.now().toString() };
    setClasses(prev => [...prev, entry]);
    setForm({ name: '', code: '', day: 'Monday', start: '8:00', end: '10:00', venue: '' });
    setShowForm(false);
  }

  function deleteClass(id: string) {
    setClasses(prev => prev.filter(c => c.id !== id));
  }

  function saveTimetable() {
    localStorage.setItem(storageKey(level, 'timetable'), JSON.stringify(classes));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  function sendMessage() {
    if (!msg.text.trim()) return;
    const entry: Message = { id: Date.now().toString(), ...msg, timestamp: Date.now() };
    const updated = [entry, ...messages];
    setMessages(updated);
    localStorage.setItem(storageKey(level, 'messages'), JSON.stringify(updated));
    setMsg({ type: 'custom', text: '', course: '' });
    setMsgSent(true);
    setTimeout(() => setMsgSent(false), 2500);
  }

  function deleteMessage(id: string) {
    const updated = messages.filter(m => m.id !== id);
    setMessages(updated);
    localStorage.setItem(storageKey(level, 'messages'), JSON.stringify(updated));
  }

  const classesByDay = DAYS.reduce<Record<string, ClassEntry[]>>((acc, d) => {
    acc[d] = classes.filter(c => c.day === d).sort((a, b) => a.start.localeCompare(b.start));
    return acc;
  }, {});

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-black text-gray-900" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Timetable Manager
          </h2>
          <p className="text-sm text-gray-400 mt-0.5">
            Managing {level}L schedule · {user?.department?.name ?? 'Your Department'}
          </p>
        </div>
        <span className="text-xs font-bold text-white bg-gray-900 px-3 py-1.5 rounded-full"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          {level}L Course Rep
        </span>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
        {(['timetable', 'announcements'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200 capitalize
              ${tab === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            {t}
          </button>
        ))}
      </div>

      {/* ─── TIMETABLE TAB ─── */}
      {tab === 'timetable' && (
        <div className="space-y-5">
          {/* Add class button */}
          <div className="flex items-center gap-3">
            <button onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-gray-900
                hover:bg-gray-800 transition-all shadow-sm"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Add Class
            </button>
            {classes.length > 0 && (
              <button onClick={saveTimetable}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all
                  ${saved
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                  }`}
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                {saved ? (
                  <>
                    <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Published!
                  </>
                ) : 'Publish to Students'}
              </button>
            )}
          </div>

          {/* Add class form */}
          {showForm && (
            <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4
              shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
              <p className="text-sm font-black text-gray-900" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>New Class</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block"
                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Course Name</label>
                  <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="e.g. Data Structures"
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm
                      focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block"
                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Course Code</label>
                  <input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))}
                    placeholder="e.g. CSC 201"
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm
                      focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block"
                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Day</label>
                  <select value={form.day} onChange={e => setForm(f => ({ ...f, day: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm
                      focus:outline-none focus:ring-2 focus:ring-gray-900">
                    {DAYS.map(d => <option key={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block"
                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Venue</label>
                  <input value={form.venue} onChange={e => setForm(f => ({ ...f, venue: e.target.value }))}
                    placeholder="e.g. LT 1, Lab A"
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm
                      focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block"
                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Start Time</label>
                  <select value={form.start} onChange={e => setForm(f => ({ ...f, start: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm
                      focus:outline-none focus:ring-2 focus:ring-gray-900">
                    {TIMES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block"
                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}>End Time</label>
                  <select value={form.end} onChange={e => setForm(f => ({ ...f, end: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm
                      focus:outline-none focus:ring-2 focus:ring-gray-900">
                    {TIMES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <button onClick={addClass}
                  className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-gray-900 hover:bg-gray-800 transition"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  Add Class
                </button>
                <button onClick={() => setShowForm(false)}
                  className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Classes by day */}
          {classes.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center
              shadow-[0_2px_4px_rgba(0,0,0,0.04)]">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}
                className="w-10 h-10 text-gray-200 mx-auto mb-3">
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
              <p className="text-sm font-semibold text-gray-400">No classes added yet</p>
              <p className="text-xs text-gray-300 mt-1">Click "Add Class" to start building the timetable</p>
            </div>
          ) : (
            <div className="space-y-3">
              {DAYS.map(day => {
                const dayClasses = classesByDay[day];
                if (!dayClasses.length) return null;
                return (
                  <div key={day} className="bg-white rounded-2xl border border-gray-100 overflow-hidden
                    shadow-[0_2px_4px_rgba(0,0,0,0.04)]">
                    <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
                      <p className="text-xs font-bold text-gray-500 tracking-widest uppercase"
                        style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{day}</p>
                    </div>
                    <div className="divide-y divide-gray-50">
                      {dayClasses.map(c => (
                        <div key={c.id} className="px-5 py-3.5 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-1 h-8 rounded-full bg-gray-900 flex-shrink-0" />
                            <div className="min-w-0">
                              <p className="text-sm font-black text-gray-900 truncate"
                                style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                                {c.name}
                              </p>
                              <p className="text-xs text-gray-400">{c.code} · {c.venue}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 flex-shrink-0">
                            <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full"
                              style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                              {c.start} – {c.end}
                            </span>
                            <button onClick={() => deleteClass(c.id)}
                              className="text-gray-300 hover:text-red-400 transition">
                              <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ─── ANNOUNCEMENTS TAB ─── */}
      {tab === 'announcements' && (
        <div className="space-y-5">
          {/* Compose */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4
            shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
            <p className="text-sm font-black text-gray-900" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Send Announcement to {level}L Students
            </p>

            {/* Message type */}
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Type</label>
              <div className="flex flex-wrap gap-2">
                {MSG_TYPES.map(t => (
                  <button key={t.value} onClick={() => setMsg(m => ({ ...m, type: t.value }))}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all
                      ${msg.type === t.value ? t.color + ' shadow-sm scale-105' : 'bg-white text-gray-400 border-gray-200 hover:border-gray-300'}`}
                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Course (optional) */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Related Course (optional)</label>
                <select value={msg.course} onChange={e => setMsg(m => ({ ...m, course: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm
                    focus:outline-none focus:ring-2 focus:ring-gray-900">
                  <option value="">— All courses —</option>
                  {classes.map(c => (
                    <option key={c.id} value={c.code}>{c.code} · {c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Message */}
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Message</label>
              <textarea value={msg.text} onChange={e => setMsg(m => ({ ...m, text: e.target.value }))}
                rows={3}
                placeholder="e.g. CSC 201 class by 9am is cancelled today. Please use the time to work on the assignment."
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm resize-none
                  focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent" />
              <p className="text-right text-xs text-gray-300 mt-1">{msg.text.length}/300</p>
            </div>

            <button onClick={sendMessage}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all
                ${msgSent ? 'bg-green-600 text-white' : 'bg-gray-900 text-white hover:bg-gray-800'}`}
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              {msgSent ? (
                <>
                  <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Sent to {level}L Students!
                </>
              ) : (
                <>
                  <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                    <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                  </svg>
                  Send to {level}L
                </>
              )}
            </button>
          </div>

          {/* Message history */}
          {messages.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs font-bold text-gray-400 tracking-widest uppercase"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Sent Messages</p>
              {messages.map(m => {
                const typeInfo = MSG_TYPES.find(t => t.value === m.type) ?? MSG_TYPES[4];
                return (
                  <div key={m.id} className="bg-white rounded-2xl border border-gray-100 p-4
                    shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0">
                        <span className={`text-[10px] font-bold border px-2 py-0.5 rounded-full flex-shrink-0 mt-0.5 ${typeInfo.color}`}
                          style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                          {typeInfo.label}
                        </span>
                        <div className="min-w-0">
                          {m.course && (
                            <p className="text-xs font-semibold text-gray-400 mb-0.5">{m.course}</p>
                          )}
                          <p className="text-sm text-gray-700">{m.text}</p>
                          <p className="text-xs text-gray-300 mt-1.5">
                            {new Date(m.timestamp).toLocaleString('en-NG', { dateStyle: 'medium', timeStyle: 'short' })}
                          </p>
                        </div>
                      </div>
                      <button onClick={() => deleteMessage(m.id)}
                        className="text-gray-200 hover:text-red-400 transition flex-shrink-0">
                        <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {messages.length === 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center
              shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
              <p className="text-sm text-gray-400">No announcements sent yet</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
