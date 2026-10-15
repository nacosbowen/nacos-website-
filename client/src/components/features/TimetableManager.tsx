'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import WeeklyOverview from '@/components/features/WeeklyOverview';
import api from '@/lib/api';

const grotesk = { fontFamily: "'Space Grotesk', sans-serif" };
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const TIMES = ['07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'];
const DEPARTMENTS = [
  { id: 1, name: 'Computer Science' },
  { id: 2, name: 'Software Engineering' },
  { id: 3, name: 'Cyber Security' },
  { id: 4, name: 'Information Technology' },
];
const LEVELS = [100, 200, 300, 400];

const labelCls = 'text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block';
const fieldCls =
  'w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent';

type ClassEntry = { id: string; name: string; code: string; day: string; start: string; end: string; venue: string };
type RepClass = { departmentId: number; level: number; department: { id: number; name: string; code: string } };

const EMPTY_FORM = { name: '', code: '', day: 'Monday', start: '08:00', end: '10:00', venue: '' };

export default function TimetableManager() {
  const { user, isLoading: authLoading, activeRole } = useAuth();
  const isRep = activeRole === 'course_rep';

  // Course reps: the classes they are assigned to
  const [repClasses, setRepClasses] = useState<RepClass[]>([]);
  const [repLoading, setRepLoading] = useState(true);
  const [repIndex, setRepIndex] = useState(0);

  // Executives / admins: free choice
  const [execDept, setExecDept] = useState<number | null>(null);
  const [execLevel, setExecLevel] = useState(100);

  const [classes, setClasses] = useState<ClassEntry[]>([]);
  const [activeDay, setActiveDay] = useState('Monday');
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [editId, setEditId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!isRep) {
      setRepLoading(false);
      return;
    }
    api.get('/notifications/course-rep/classes')
      .then((r) => setRepClasses(r.data))
      .catch(() => setRepClasses([]))
      .finally(() => setRepLoading(false));
  }, [authLoading, isRep]);

  const repSelected = repClasses[repIndex];
  const departmentId = isRep ? repSelected?.departmentId : execDept ?? user?.department?.id ?? 1;
  const level = isRep ? repSelected?.level : execLevel;
  const deptName = DEPARTMENTS.find((d) => d.id === departmentId)?.name ?? 'Department';

  async function loadClasses() {
    if (!departmentId || !level) return;
    try {
      const { data } = await api.get('/timetable', { params: { departmentId, level } });
      setClasses(
        data.map((e: any) => ({
          id: e.id,
          name: e.courseTitle,
          code: e.courseCode,
          day: e.day.charAt(0) + e.day.slice(1).toLowerCase(),
          start: e.startTime,
          end: e.endTime,
          venue: e.venue || '',
        }))
      );
    } catch {
      setError('Could not load the timetable. Please refresh.');
    }
  }

  useEffect(() => {
    if (authLoading) return;
    setClasses([]);
    loadClasses();
  }, [authLoading, departmentId, level]);

  function openAdd() {
    setEditId(null);
    setForm({ ...EMPTY_FORM, day: activeDay });
    setError('');
    setShowForm(true);
  }

  function openEdit(c: ClassEntry) {
    setEditId(c.id);
    setForm({ name: c.name, code: c.code, day: c.day, start: c.start, end: c.end, venue: c.venue });
    setError('');
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditId(null);
    setForm({ ...EMPTY_FORM });
  }

  async function handleSave() {
    if (!form.name.trim() || !form.code.trim() || !form.venue.trim()) {
      setError('Course name, course code and venue are required');
      return;
    }
    if (form.end <= form.start) {
      setError('End time must be after start time');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const payload = {
        courseCode: form.code,
        courseTitle: form.name,
        day: form.day.toUpperCase(),
        startTime: form.start,
        endTime: form.end,
        venue: form.venue,
      };
      if (editId) {
        await api.patch(`/timetable/${editId}`, payload);
      } else {
        await api.post('/timetable', { ...payload, departmentId, level });
      }
      closeForm();
      await loadClasses();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Could not save the class. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    setDeleting(true);
    try {
      await api.delete(`/timetable/${id}`);
      setClasses((prev) => prev.filter((c) => c.id !== id));
      setDeleteId(null);
    } catch (err: any) {
      setDeleteId(null);
      setError(err?.response?.data?.message || 'Could not delete the class. Please try again.');
    } finally {
      setDeleting(false);
    }
  }

  const dayClasses = classes
    .filter((c) => c.day === activeDay)
    .sort((a, b) => a.start.localeCompare(b.start));

  if (isRep && repLoading) {
    return <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-gray-100 h-24 animate-pulse" />;
  }

  if (isRep && repClasses.length === 0) {
    return (
      <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-gray-100 p-8 text-center">
        <p className="text-sm text-gray-400">You are not assigned to a class yet</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {deleteId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          onClick={() => { if (!deleting) setDeleteId(null); }}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-xs shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-base font-black text-gray-900 mb-2" style={grotesk}>Delete class?</h3>
            <p className="text-sm text-gray-500 mb-5">
              <span className="font-semibold text-gray-700">
                {classes.find((c) => c.id === deleteId)?.code}
              </span>{' '}
              will be removed from the timetable for students. This can't be undone.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteId(null)}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition disabled:opacity-50"
                style={grotesk}>
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-red-500 hover:bg-red-600 transition disabled:opacity-50"
                style={grotesk}>
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-black text-gray-900" style={grotesk}>Timetable Manager</h2>
          <p className="text-sm text-gray-400 mt-0.5">
            {level}L · {deptName}
          </p>
        </div>
        <button
          onClick={openAdd}
          className="px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-gray-900 hover:bg-gray-800 transition"
          style={grotesk}>
          Add Class
        </button>
      </div>

      {/* Which class are we managing? */}
      {isRep ? (
        repClasses.length > 1 && (
          <div>
            <label className={labelCls}>Managing</label>
            <select value={repIndex} onChange={(e) => setRepIndex(Number(e.target.value))} className={fieldCls}>
              {repClasses.map((c, i) => (
                <option key={i} value={i}>{c.level} Level · {c.department.name}</option>
              ))}
            </select>
          </div>
        )
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Department</label>
            <select
              value={departmentId}
              onChange={(e) => setExecDept(Number(e.target.value))}
              className={fieldCls}>
              {DEPARTMENTS.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Level</label>
            <select value={execLevel} onChange={(e) => setExecLevel(Number(e.target.value))} className={fieldCls}>
              {LEVELS.map((l) => <option key={l} value={l}>{l} Level</option>)}
            </select>
          </div>
        </div>
      )}

      {error && !showForm && <p className="text-xs font-semibold text-red-600">{error}</p>}
      <p className="text-xs text-gray-400">Changes go live to students straight away.</p>

      {/* Add / edit form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
          <p className="text-sm font-black text-gray-900" style={grotesk}>
            {editId ? 'Edit Class' : 'New Class'}
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Course Name</label>
              <input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Data Structures"
                className={fieldCls}
              />
            </div>
            <div>
              <label className={labelCls}>Course Code</label>
              <input
                value={form.code}
                onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
                placeholder="e.g. CSC 201"
                className={fieldCls}
              />
            </div>
            <div>
              <label className={labelCls}>Day</label>
              <select
                value={form.day}
                onChange={(e) => setForm((f) => ({ ...f, day: e.target.value }))}
                className={fieldCls}>
                {DAYS.map((d) => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Venue</label>
              <input
                value={form.venue}
                onChange={(e) => setForm((f) => ({ ...f, venue: e.target.value }))}
                placeholder="e.g. LT 1, Lab A"
                className={fieldCls}
              />
            </div>
            <div>
              <label className={labelCls}>Start Time</label>
              <select
                value={form.start}
                onChange={(e) => setForm((f) => ({ ...f, start: e.target.value }))}
                className={fieldCls}>
                {TIMES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>End Time</label>
              <select
                value={form.end}
                onChange={(e) => setForm((f) => ({ ...f, end: e.target.value }))}
                className={fieldCls}>
                {TIMES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>
          {error && <p className="text-xs font-semibold text-red-600">{error}</p>}
          <div className="flex gap-2 pt-1">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-gray-900 hover:bg-gray-800 transition disabled:opacity-50"
              style={grotesk}>
              {saving ? 'Saving...' : editId ? 'Save changes' : 'Add Class'}
            </button>
            <button
              onClick={closeForm}
              className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition"
              style={grotesk}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Day selector */}
      <div className="flex gap-1.5 flex-wrap">
        {DAYS.map((d) => {
          const hasClasses = classes.some((c) => c.day === d);
          return (
            <button
              key={d}
              onClick={() => setActiveDay(d)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all relative
                ${activeDay === d
                  ? 'bg-gray-900 text-white shadow-sm'
                  : 'bg-white text-gray-500 border border-gray-200 hover:border-gray-300'}`}
              style={grotesk}>
              {d.slice(0, 3)}
              {hasClasses && activeDay !== d && (
                <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-gray-400" />
              )}
            </button>
          );
        })}
      </div>

      {/* Classes for the selected day */}
      {classes.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center shadow-[0_2px_4px_rgba(0,0,0,0.04)]">
          <p className="text-sm font-semibold text-gray-400" style={grotesk}>No classes added yet</p>
          <p className="text-xs text-gray-300 mt-1">Click "Add Class" to start building the timetable</p>
        </div>
      ) : dayClasses.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center shadow-[0_2px_4px_rgba(0,0,0,0.04)]">
          <p className="text-sm text-gray-400">No classes on {activeDay}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {dayClasses.map((c) => (
            <div
              key={c.id}
              className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4 shadow-[0_2px_4px_rgba(0,0,0,0.04)]">
              <div className="w-1 h-12 rounded-full flex-shrink-0 bg-gray-200" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black text-gray-900 truncate" style={grotesk}>{c.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">{c.code} · {c.venue}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-xs font-bold text-gray-700" style={grotesk}>{c.start} – {c.end}</p>
                <div className="flex items-center justify-end gap-3 mt-1">
                  <button
                    onClick={() => openEdit(c)}
                    className="text-xs font-semibold text-gray-400 hover:text-gray-900 transition">
                    Edit
                  </button>
                  <button
                    onClick={() => { setError(''); setDeleteId(c.id); }}
                    className="text-xs font-semibold text-gray-400 hover:text-red-500 transition">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

     {classes.length > 0 && <WeeklyOverview classes={classes} />}
    </div>
  );
}