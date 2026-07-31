'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/api';

type Suggestion = {
  id: string;
  body: string;
  anonymous: boolean;
  status: 'pending' | 'reviewed' | 'resolved';
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

export default function ExecutiveSuggestions() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'reviewed' | 'resolved'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/suggestions').then(r => {
      setSuggestions(r.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  async function updateStatus(id: string, status: 'pending' | 'reviewed' | 'resolved') {
    try {
      await api.patch(`/suggestions/${id}/status`, { status });
      setSuggestions(prev => prev.map(s => s.id === id ? { ...s, status } : s));
    } catch { /* ignore */ }
  }

  const filtered = suggestions.filter(s => filter === 'all' || s.status === filter);
  const pending = suggestions.filter(s => s.status === 'pending').length;

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto space-y-3 animate-pulse">
        {[1, 2, 3].map(i => <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 h-24" />)}
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-black text-gray-900" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Suggestions Inbox
          </h2>
          <p className="text-sm text-gray-400 mt-0.5">Anonymous student feedback</p>
        </div>
        {pending > 0 && (
          <div className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-full">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            <span className="text-xs font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              {pending} pending
            </span>
          </div>
        )}
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
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Total', value: suggestions.length },
              { label: 'Pending', value: pending },
              { label: 'Resolved', value: suggestions.filter(s => s.status === 'resolved').length },
            ].map(stat => (
              <div key={stat.label} className="bg-white rounded-2xl border border-gray-100 px-4 py-3 text-center
                shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
                <p className="text-2xl font-black text-gray-900" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  {stat.value}
                </p>
                <p className="text-xs font-semibold text-gray-500 mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>

          <div className="flex gap-2 flex-wrap">
            {(['all', 'pending', 'reviewed', 'resolved'] as const).map(s => (
              <button key={s} onClick={() => setFilter(s)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all capitalize
                  ${filter === s ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'}`}
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                {s}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {filtered.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
                <p className="text-sm text-gray-400">No {filter} suggestions</p>
              </div>
            ) : filtered.map(s => (
              <div key={s.id} className={`bg-white rounded-2xl border p-5 shadow-[0_2px_4px_rgba(0,0,0,0.04)]
                ${s.status !== 'pending' ? 'border-gray-100 opacity-75' : 'border-gray-200'}`}>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[10px] font-bold border px-2.5 py-0.5 rounded-full
                      ${s.status === 'pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                        : s.status === 'reviewed' ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : 'bg-green-50 text-green-700 border-green-200'}`}
                      style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                      {s.status}
                    </span>
                    <span className="text-xs text-gray-400">{timeAgo(s.createdAt)}</span>
                    {!s.anonymous && s.user && (
                      <span className="text-xs text-gray-400">
                        {s.user.fullName} · {s.user.level}L
                      </span>
                    )}
                  </div>
                  <div className="flex gap-1.5 flex-shrink-0">
                    {s.status !== 'reviewed' && (
                      <button onClick={() => updateStatus(s.id, 'reviewed')}
                        className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold hover:bg-blue-100 transition"
                        style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                        Review
                      </button>
                    )}
                    {s.status !== 'resolved' && (
                      <button onClick={() => updateStatus(s.id, 'resolved')}
                        className="px-2.5 py-1 rounded-lg bg-green-50 text-green-700 border border-green-200 text-xs font-bold hover:bg-green-100 transition"
                        style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                        Resolve
                      </button>
                    )}
                    {s.status !== 'pending' && (
                      <button onClick={() => updateStatus(s.id, 'pending')}
                        className="px-2.5 py-1 rounded-lg bg-gray-50 text-gray-500 border border-gray-200 text-xs font-bold hover:bg-gray-100 transition"
                        style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                        Reopen
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
