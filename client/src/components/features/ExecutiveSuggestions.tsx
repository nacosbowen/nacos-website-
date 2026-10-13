'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/api';

type Suggestion = {
  id: string;
  body: string;
  anonymous: boolean;
  createdAt: string;
  user: { fullName: string; matricNumber: string; level: number } | null;
};

function timeAgo(ts: string) {
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

function splitCategory(body: string) {
  const m = body.match(/^\[([^\]]+)\]\s*([\s\S]*)$/);
  return m ? { category: m[1], text: m[2] } : { category: 'General', text: body };
}

export default function ExecutiveSuggestions() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/suggestions').then(r => {
      setSuggestions(r.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  async function handleDelete(id: string) {
    setDeleting(true);
    setError('');
    try {
      await api.delete(`/suggestions/${id}`);
      setSuggestions(prev => prev.filter(s => s.id !== id));
      setDeleteId(null);
    } catch {
      setError('Failed to delete suggestion. Please try again.');
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto space-y-3 animate-pulse">
        {[1, 2, 3].map(i => <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 h-24" />)}
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {deleteId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          onClick={() => { if (!deleting) setDeleteId(null); }}
        >
          <div
            className="bg-white rounded-2xl p-6 w-full max-w-xs shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-black text-gray-900 mb-2"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Delete suggestion?
            </h3>
            <p className="text-sm text-gray-500 mb-5">
              This suggestion will be removed permanently. This can't be undone.
            </p>
            {error && <p className="text-xs font-semibold text-red-600 mb-3">{error}</p>}
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteId(null)}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition disabled:opacity-50"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-red-500 hover:bg-red-600 transition disabled:opacity-50"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div>
        <h2 className="text-xl font-black text-gray-900" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          Suggestions Inbox
        </h2>
        <p className="text-sm text-gray-400 mt-0.5">Anonymous student feedback</p>
      </div>

      {suggestions.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-14 text-center shadow-[0_2px_4px_rgba(0,0,0,0.04)]">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}
            className="w-12 h-12 text-gray-200 mx-auto mb-4">
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
          </svg>
          <p className="text-sm font-semibold text-gray-400" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            No suggestions yet
          </p>
          <p className="text-xs text-gray-300 mt-1">Student suggestions will appear here when submitted</p>
        </div>
      ) : (
        <>
          <p className="text-xs font-bold text-gray-400 tracking-widest uppercase"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Suggestions · {suggestions.length}
          </p>

          <div className="space-y-3">
          {suggestions.map(s => {
  const { category, text } = splitCategory(s.body);
  return (
    <div key={s.id}
      className="bg-white rounded-2xl border border-gray-200 p-5 shadow-[0_2px_4px_rgba(0,0,0,0.04)]">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-sm font-black text-gray-900"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          {category}
        </h3>
        <button
          onClick={() => { setError(''); setDeleteId(s.id); }}
          className="flex-shrink-0 text-xs font-semibold text-gray-400 hover:text-red-500 transition"
        >
          Delete
        </button>
      </div>
      <div className="flex items-center gap-2 flex-wrap mt-0.5 mb-3">
        <span className="text-xs text-gray-400">{timeAgo(s.createdAt)}</span>
        {!s.anonymous && s.user && (
          <span className="text-xs text-gray-400">
            {s.user.fullName} · {s.user.level}L
          </span>
        )}
      </div>
      <p className="text-sm text-gray-700 leading-relaxed">{text}</p>
    </div>
  );
})}
          </div>
        </>
      )}
    </div>
  );
}