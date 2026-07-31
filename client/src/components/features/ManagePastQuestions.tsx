'use client';
import { useState, useEffect, useRef } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

const LEVELS = [100, 200, 300, 400, 500];
const EMPTY = { title: '', courseCode: '', year: new Date().getFullYear().toString(), level: '300' };

type PQ = {
  id: string;
  title: string;
  courseCode: string;
  level: number;
  year: number;
  fileUrl: string;
  createdAt: string;
};

export default function ManagePastQuestions() {
  const { user } = useAuth();
  const [questions, setQuestions] = useState<PQ[]>([]);
  const [form, setForm] = useState({ ...EMPTY });
  const [file, setFile] = useState<File | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [toast, setToast] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5001';

  useEffect(() => {
    if (!user) return;
    const params = new URLSearchParams();
    if (user.level) params.set('level', String(user.level));
    api.get(`/past-questions?${params}`).then(r => setQuestions(r.data)).catch(() => {});
  }, [user]);

  function flash(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  }

  async function handleUpload() {
    if (!form.title.trim() || !form.courseCode.trim() || !file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('title', form.title.trim());
      fd.append('courseCode', form.courseCode.toUpperCase().trim());
      fd.append('level', form.level);
      fd.append('year', form.year);

      const { data } = await api.post('/past-questions', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setQuestions(prev => [data, ...prev]);
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
      setQuestions(prev => prev.filter(q => q.id !== id));
      setDeleteId(null);
      flash('Deleted');
    } catch {
      flash('Failed to delete');
    }
  }

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
          <h2 className="text-xl font-black text-gray-900" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Past Questions</h2>
          <p className="text-sm text-gray-400 mt-0.5">Upload past exam questions · {questions.length} uploaded</p>
        </div>
        <button onClick={() => setShowForm(s => !s)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-gray-900 hover:bg-gray-800 transition"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
          Upload
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4 shadow-[0_4px_16px_rgba(0,0,0,0.08)]">
          <p className="text-sm font-black text-gray-900" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Upload Past Question</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Course Code *</label>
              <input value={form.courseCode} onChange={e => setForm(f => ({ ...f, courseCode: e.target.value }))}
                placeholder="e.g. CSC 301"
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Title *</label>
              <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="e.g. Algorithm Design"
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Year</label>
              <input value={form.year} onChange={e => setForm(f => ({ ...f, year: e.target.value }))}
                placeholder="e.g. 2024"
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Level</label>
              <select value={form.level} onChange={e => setForm(f => ({ ...f, level: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900">
                {LEVELS.map(l => <option key={l} value={l}>{l}L</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">PDF File *</label>
            <input
              ref={fileRef}
              type="file"
              accept=".pdf"
              onChange={e => setFile(e.target.files?.[0] ?? null)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm
                focus:outline-none focus:ring-2 focus:ring-gray-900 file:mr-3 file:py-1 file:px-3
                file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-gray-200 file:text-gray-700
                hover:file:bg-gray-300"
            />
            {file && (
              <p className="text-xs text-gray-400 mt-1">{file.name} · {(file.size / 1024 / 1024).toFixed(1)} MB</p>
            )}
          </div>
          <div className="flex gap-2 pt-1">
            <button onClick={handleUpload}
              disabled={!form.courseCode.trim() || !form.title.trim() || !file || uploading}
              className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-gray-900 hover:bg-gray-800
                disabled:opacity-40 disabled:cursor-not-allowed transition"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              {uploading ? 'Uploading...' : 'Upload'}
            </button>
            <button onClick={() => { setShowForm(false); setForm({ ...EMPTY }); setFile(null); }}
              className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-100 transition"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Cancel</button>
          </div>
        </div>
      )}

      {questions.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-14 text-center shadow-[0_2px_4px_rgba(0,0,0,0.04)]">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}
            className="w-12 h-12 text-gray-200 mx-auto mb-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
          <p className="text-sm font-semibold text-gray-400" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>No past questions uploaded yet</p>
          <p className="text-xs text-gray-300 mt-1">Upload past questions to help students prepare for exams</p>
        </div>
      ) : (
        <div className="space-y-3">
          {questions.map(q => (
            <div key={q.id} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-4
              shadow-[0_2px_4px_rgba(0,0,0,0.04)]">
              <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-gray-400">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-0.5">
                  <span className="text-xs font-black text-gray-900" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    {q.courseCode}
                  </span>
                  <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{q.level}L</span>
                  <span className="text-[10px] text-gray-400">{q.year}</span>
                </div>
                <p className="text-sm text-gray-700">{q.title}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <a href={`${baseUrl}${q.fileUrl}`} target="_blank" rel="noopener noreferrer" download
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition">
                  <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </a>
                {deleteId === q.id ? (
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => handleDelete(q.id)}
                      className="px-2.5 py-1 rounded-lg bg-red-600 text-white text-xs font-bold">Yes</button>
                    <button onClick={() => setDeleteId(null)}
                      className="px-2.5 py-1 rounded-lg bg-gray-100 text-gray-600 text-xs font-bold">No</button>
                  </div>
                ) : (
                  <button onClick={() => setDeleteId(q.id)}
                    className="p-1.5 rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-50 transition">
                    <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
