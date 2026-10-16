'use client';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import DashboardShell from '@/components/dashboard/DashboardShell';

const YEARS = Array.from({ length: 2026 - 2016 + 1 }, (_, i) => 2026 - i);
const grotesk = { fontFamily: "'Space Grotesk', sans-serif" };
const label = 'text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block';
const field =
  'w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900';

type RepClass = {
  departmentId: number;
  level: number;
  department: { id: number; name: string; code: string };
};

type PQ = {
  id: string;
  title: string;
  courseCode: string;
  level: number;
  year: number;
  fileUrl: string;
  departmentIds: number[];
  createdAt: string;
};

const EMPTY = { title: '', courseCode: '', year: String(YEARS[0]) };

export default function CourseRepPastQuestions() {
  const { isLoading: authLoading } = useAuth();
  const [classes, setClasses] = useState<RepClass[]>([]);
  const [classesLoading, setClassesLoading] = useState(true);
  const [classIndex, setClassIndex] = useState(0);
  const [questions, setQuestions] = useState<PQ[]>([]);
  const [questionsLoading, setQuestionsLoading] = useState(true);
  const [form, setForm] = useState({ ...EMPTY });
  const [file, setFile] = useState<File | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [toast, setToast] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5001';
  const selected = classes[classIndex];
  const classLabel = (c: RepClass) => `${c.level} Level · ${c.department.name}`;

  useEffect(() => {
    if (authLoading) return;
    api.get('/notifications/course-rep/classes')
      .then((r) => setClasses(r.data))
      .catch(() => setClasses([]))
      .finally(() => setClassesLoading(false));
    api.get('/past-questions/mine')
      .then((r) => setQuestions(r.data))
      .catch(() => {})
      .finally(() => setQuestionsLoading(false));
  }, [authLoading]);

  function flash(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  }

  async function handleUpload() {
    if (!selected || !form.title.trim() || !form.courseCode.trim() || !file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('title', form.title.trim());
      fd.append('courseCode', form.courseCode.toUpperCase().trim());
      fd.append('year', form.year);
      fd.append('level', String(selected.level));
      fd.append('departmentId', String(selected.departmentId));

      const { data } = await api.post('/past-questions', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setQuestions((prev) => [data, ...prev]);
      setForm({ ...EMPTY });
      setFile(null);
      if (fileRef.current) fileRef.current.value = '';
      setShowForm(false);
      flash('Past question uploaded ✓');
    } catch (err: any) {
      flash(err?.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await api.delete(`/past-questions/${id}`);
      setQuestions((prev) => prev.filter((q) => q.id !== id));
      setDeleteId(null);
      flash('Deleted');
    } catch (err: any) {
      setDeleteId(null);
      flash(err?.response?.data?.message || 'Failed to delete');
    }
  }

  return (
    <DashboardShell title="Past Questions">
      <div className="max-w-3xl mx-auto space-y-6">
        {toast && (
          <div
            className="fixed top-5 right-5 z-50 bg-gray-900 text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-lg"
            style={grotesk}>
            {toast}
          </div>
        )}

        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-xl font-black text-gray-900" style={grotesk}>Past Questions</h2>
            <p className="text-sm text-gray-400 mt-0.5">
              Upload past exam questions for your class · {questions.length} uploaded
            </p>
          </div>
          {/* Shown immediately; hidden only once we know the rep has no class */}
          {(classesLoading || classes.length > 0) && (
            <button
              onClick={() => setShowForm((s) => !s)}
              className="px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-gray-900 hover:bg-gray-800 transition"
              style={grotesk}>
              Upload
            </button>
          )}
        </div>

        {!classesLoading && classes.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
            <p className="text-sm text-gray-400">You are not assigned to a class yet</p>
          </div>
        )}

        {showForm && (classesLoading || classes.length > 0) && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4 shadow-[0_4px_16px_rgba(0,0,0,0.08)]">
            <p className="text-sm font-black text-gray-900" style={grotesk}>Upload Past Question</p>

            <div>
              <label className={label}>Uploading for</label>
              {classesLoading ? (
                <div className="h-[42px] rounded-xl border border-gray-200 bg-gray-50 animate-pulse" />
              ) : classes.length === 1 ? (
                <div className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-700">
                  {classLabel(classes[0])}
                </div>
              ) : (
                <select
                  value={classIndex}
                  onChange={(e) => setClassIndex(Number(e.target.value))}
                  className={field}>
                  {classes.map((c, i) => (
                    <option key={i} value={i}>{classLabel(c)}</option>
                  ))}
                </select>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={label}>Course Code *</label>
                <input
                  value={form.courseCode}
                  onChange={(e) => setForm((f) => ({ ...f, courseCode: e.target.value }))}
                  placeholder="e.g. CYB 301"
                  className={field}
                />
              </div>
              <div>
                <label className={label}>Title *</label>
                <input
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="e.g. Network Security"
                  className={field}
                />
              </div>
              <div>
                <label className={label}>Year</label>
                <select
                  value={form.year}
                  onChange={(e) => setForm((f) => ({ ...f, year: e.target.value }))}
                  className={field}>
                  {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className={label}>PDF File *</label>
              <input
                ref={fileRef}
                type="file"
                accept=".pdf"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className={`${field} file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-gray-200 file:text-gray-700 hover:file:bg-gray-300`}
              />
              {file && (
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-xs text-gray-400">
                    {file.name} · {(file.size / 1024 / 1024).toFixed(1)} MB
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setFile(null);
                      if (fileRef.current) fileRef.current.value = '';
                    }}
                    className="text-xs text-red-500 hover:text-red-600 font-semibold">
                    Remove
                  </button>
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-1">
              <button
                onClick={handleUpload}
                disabled={classesLoading || !selected || !form.courseCode.trim() || !form.title.trim() || !file || uploading}
                className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-gray-900 hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition"
                style={grotesk}>
                {uploading ? 'Uploading...' : 'Upload'}
              </button>
              <button
                onClick={() => { setShowForm(false); setForm({ ...EMPTY }); setFile(null); }}
                className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-100 transition"
                style={grotesk}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {questionsLoading ? (
          <div className="space-y-3 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 h-20" />
            ))}
          </div>
        ) : questions.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-14 text-center shadow-[0_2px_4px_rgba(0,0,0,0.04)]">
            <p className="text-sm font-semibold text-gray-400" style={grotesk}>No past questions uploaded yet</p>
            <p className="text-xs text-gray-300 mt-1">Upload past questions to help your class prepare for exams</p>
          </div>
        ) : (
          <div className="space-y-3">
            {questions.map((q) => {
              const cls = classes.find(
                (c) => c.level === q.level && q.departmentIds.includes(c.departmentId)
              );
              return (
                <div
                  key={q.id}
                  className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-4 shadow-[0_2px_4px_rgba(0,0,0,0.04)]">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <span className="text-xs font-black text-gray-900" style={grotesk}>{q.courseCode}</span>
                      <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                        {cls ? classLabel(cls) : `${q.level}L`}
                      </span>
                      <span className="text-[10px] text-gray-400">{q.year}</span>
                    </div>
                    <p className="text-sm text-gray-700">{q.title}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <a
                      href={q.fileUrl.startsWith('http') ? q.fileUrl : `${baseUrl}${q.fileUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold text-gray-400 hover:text-gray-900 transition">
                      Open
                    </a>
                    {deleteId === q.id ? (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleDelete(q.id)}
                          className="px-2.5 py-1 rounded-lg bg-red-600 text-white text-xs font-bold">
                          Yes
                        </button>
                        <button
                          onClick={() => setDeleteId(null)}
                          className="px-2.5 py-1 rounded-lg bg-gray-100 text-gray-600 text-xs font-bold">
                          No
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteId(q.id)}
                        className="text-xs font-semibold text-gray-400 hover:text-red-500 transition">
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}