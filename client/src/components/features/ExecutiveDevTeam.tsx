'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/api';

type Application = {
  id: string; name: string; email: string; dept: string; level: string; role: string;
  skills: string; portfolio: string; motivation: string; createdAt: string;
  status: 'pending' | 'accepted' | 'rejected';
};

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

const STATUS_STYLE = {
  pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  accepted: 'bg-green-50 text-green-700 border-green-200',
  rejected: 'bg-red-50 text-red-600 border-red-200',
};

export default function ExecutiveDevTeam() {
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('all');
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    api.get('/dev-applications')
      .then(res => { if (!cancelled) setApps(res.data); })
      .catch(err => { if (!cancelled) setError(err?.response?.data?.message ?? 'Could not load applications. Please try again.'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  async function updateStatus(id: string, status: Application['status']) {
    if (busyId) return;
    setBusyId(id);
    setError('');
    try {
      const res = await api.patch(`/dev-applications/${id}/status`, { status });
      setApps(prev => prev.map(a => a.id === id ? { ...a, status: res.data.status } : a));
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Could not update the application. Please try again.');
    } finally {
      setBusyId(null);
    }
  }

  async function deleteApplication(id: string, name: string) {
    if (busyId) return;
    if (!window.confirm(`Delete ${name}'s application? This cannot be undone.`)) return;
    setBusyId(id);
    setError('');
    try {
      await api.delete(`/dev-applications/${id}`);
      setApps(prev => prev.filter(a => a.id !== id));
      if (expanded === id) setExpanded(null);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Could not delete the application. Please try again.');
    } finally {
      setBusyId(null);
    }
  }

  const filtered = filter === 'all' ? apps : apps.filter(a => a.status === filter);
  const counts = {
    all: apps.length,
    pending: apps.filter(a => a.status === 'pending').length,
    accepted: apps.filter(a => a.status === 'accepted').length,
    rejected: apps.filter(a => a.status === 'rejected').length,
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-black text-gray-900" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Dev Team Applications</h2>
        <p className="text-sm text-gray-400 mt-0.5">Review student applications to join the NACOS Dev Team</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl px-4 py-3">{error}</div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {(['all', 'pending', 'accepted', 'rejected'] as const).map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`rounded-2xl border px-3 py-3 text-center transition-all
              ${filter === s ? 'bg-gray-900 border-gray-900' : 'bg-white border-gray-100 hover:border-gray-300'}
              shadow-[0_2px_4px_rgba(0,0,0,0.04)]`}>
            <p className={`text-2xl font-black ${filter === s ? 'text-white' : 'text-gray-900'}`}
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{counts[s]}</p>
            <p className={`text-xs font-semibold capitalize mt-0.5 ${filter === s ? 'text-gray-300' : 'text-gray-500'}`}
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{s}</p>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-14 text-center">
          <p className="text-sm text-gray-400" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Loading applications...</p>
        </div>
      ) : apps.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-14 text-center shadow-[0_2px_4px_rgba(0,0,0,0.04)]">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}
            className="w-12 h-12 text-gray-200 mx-auto mb-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
          </svg>
          <p className="text-sm font-semibold text-gray-400" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>No applications yet</p>
          <p className="text-xs text-gray-300 mt-1">Student applications will appear here when submitted</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
          <p className="text-sm text-gray-400">No {filter} applications</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(app => {
            const busy = busyId === app.id;
            const safeLink = /^https?:\/\//i.test(app.portfolio);
            return (
              <div key={app.id} className="bg-white rounded-2xl border border-gray-100 p-5
                shadow-[0_2px_4px_rgba(0,0,0,0.04)]">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-black text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                      {app.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div>
                        <p className="text-sm font-black text-gray-900" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{app.name}</p>
                        <p className="text-xs text-gray-400">{app.dept} · {app.level} · {timeAgo(app.createdAt)}</p>
                      </div>
                      <span className={`text-[10px] font-bold border px-2.5 py-0.5 rounded-full capitalize ${STATUS_STYLE[app.status]}`}
                        style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{app.status}</span>
                    </div>
                    <p className="text-xs font-semibold text-gray-600 mt-2">Applying for: <span className="font-bold text-gray-800">{app.role}</span></p>
                    <p className="text-xs text-gray-400 mt-0.5">Skills: {app.skills}</p>
                    <p className="text-xs text-gray-400 mt-0.5 break-all">
                      Email:{' '}
                      <a href={`mailto:${app.email}`} className="text-gray-600 hover:underline">{app.email}</a>
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5 break-all">
                      Portfolio:{' '}
                      {safeLink ? (
                        <a href={app.portfolio} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:underline">{app.portfolio}</a>
                      ) : (
                        <span className="text-gray-600">{app.portfolio}</span>
                      )}
                    </p>

                    <button onClick={() => setExpanded(expanded === app.id ? null : app.id)}
                      className="text-xs text-gray-400 hover:text-gray-600 mt-1.5 transition"
                      style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                      {expanded === app.id ? 'Hide motivation ↑' : 'Read motivation ↓'}
                    </button>
                    {expanded === app.id && (
                      <p className="text-xs text-gray-500 mt-2 leading-relaxed bg-gray-50 rounded-lg p-3 whitespace-pre-wrap">{app.motivation}</p>
                    )}

                    <div className="flex items-center gap-2 mt-3 flex-wrap">
                      {app.status === 'pending' ? (
                        <>
                          <button onClick={() => updateStatus(app.id, 'accepted')} disabled={busy}
                            className="px-4 py-1.5 rounded-lg bg-green-600 text-white text-xs font-bold hover:bg-green-700 transition disabled:opacity-50"
                            style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Accept</button>
                          <button onClick={() => updateStatus(app.id, 'rejected')} disabled={busy}
                            className="px-4 py-1.5 rounded-lg bg-gray-100 text-gray-600 text-xs font-bold hover:bg-red-50 hover:text-red-600 transition disabled:opacity-50"
                            style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Reject</button>
                        </>
                      ) : (
                        <button onClick={() => updateStatus(app.id, 'pending')} disabled={busy}
                          className="text-xs text-gray-400 hover:text-gray-600 transition disabled:opacity-50"
                          style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Reset to pending</button>
                      )}
                      <button onClick={() => deleteApplication(app.id, app.name)} disabled={busy}
                        className="ml-auto text-xs text-gray-400 hover:text-red-500 transition disabled:opacity-50"
                        style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Delete</button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}