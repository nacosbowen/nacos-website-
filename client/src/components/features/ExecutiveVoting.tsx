'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/api';

type PollOption = { id: string; text: string; _count: { votes: number } };
type Poll = {
  id: string;
  title: string;
  description: string | null;
  isActive: boolean;
  endsAt: string | null;
  createdAt: string;
  options: PollOption[];
  _count: { votes: number };
};

export default function ExecutiveVoting() {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [view, setView] = useState<'list' | 'create'>('list');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Create form
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [endsAt, setEndsAt] = useState('');

  useEffect(() => {
    api.get('/polls').then(r => {
      setPolls(r.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  function flash(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  }

  async function createPoll() {
    const validOptions = options.filter(o => o.trim());
    if (!title.trim() || validOptions.length < 2) return;
    setSaving(true);
    try {
      const { data } = await api.post('/polls', {
        title: title.trim(),
        description: description.trim() || null,
        options: validOptions,
        endsAt: endsAt ? new Date(endsAt).toISOString() : null,
      });
      setPolls(prev => [{ ...data, _count: { votes: 0 } }, ...prev]);
      setTitle('');
      setDescription('');
      setOptions(['', '']);
      setEndsAt('');
      setView('list');
      flash('Poll created ✓');
    } catch (err: any) {
      flash(err?.response?.data?.message || 'Failed to create poll');
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(poll: Poll) {
    try {
      await api.patch(`/polls/${poll.id}`, { isActive: !poll.isActive });
      setPolls(prev => prev.map(p => p.id === poll.id ? { ...p, isActive: !p.isActive } : p));
      flash(poll.isActive ? 'Poll closed' : 'Poll opened ✓');
    } catch {
      flash('Failed to update poll');
    }
  }

  async function deletePoll(id: string) {
    try {
      await api.delete(`/polls/${id}`);
      setPolls(prev => prev.filter(p => p.id !== id));
      setDeleteId(null);
      flash('Poll deleted');
    } catch {
      flash('Failed to delete poll');
    }
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto space-y-3 animate-pulse">
        {[1, 2].map(i => <div key={i} className="bg-white rounded-2xl border border-gray-100 h-28" />)}
      </div>
    );
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
          <h2 className="text-xl font-black text-gray-900" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>NACOS Voting</h2>
          <p className="text-sm text-gray-400 mt-0.5">Create and manage polls · {polls.length} total</p>
        </div>
        <button
          onClick={() => setView(v => v === 'list' ? 'create' : 'list')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-gray-900 hover:bg-gray-800 transition"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          {view === 'create' ? 'Cancel' : (
            <>
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              New Poll
            </>
          )}
        </button>
      </div>

      {view === 'create' && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4 shadow-[0_4px_16px_rgba(0,0,0,0.08)]">
          <p className="text-sm font-black text-gray-900" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Create Poll</p>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Poll Question *</label>
              <input value={title} onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Who should be NACOS President?"
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Description (optional)</label>
              <input value={description} onChange={e => setDescription(e.target.value)}
                placeholder="Any additional context..."
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">Options * (min 2)</label>
              <div className="space-y-2">
                {options.map((opt, i) => (
                  <div key={i} className="flex gap-2">
                    <input value={opt} onChange={e => {
                      const updated = [...options];
                      updated[i] = e.target.value;
                      setOptions(updated);
                    }}
                      placeholder={`Option ${i + 1}`}
                      className="flex-1 px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
                    {options.length > 2 && (
                      <button onClick={() => setOptions(prev => prev.filter((_, j) => j !== i))}
                        className="p-2 rounded-xl text-gray-300 hover:text-red-400 hover:bg-red-50 transition">
                        <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
                {options.length < 6 && (
                  <button onClick={() => setOptions(prev => [...prev, ''])}
                    className="text-xs font-semibold text-gray-500 hover:text-gray-800 transition"
                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    + Add option
                  </button>
                )}
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">End Date (optional)</label>
              <input type="datetime-local" value={endsAt} onChange={e => setEndsAt(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <button onClick={createPoll}
              disabled={!title.trim() || options.filter(o => o.trim()).length < 2 || saving}
              className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-gray-900 hover:bg-gray-800
                disabled:opacity-40 disabled:cursor-not-allowed transition"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              {saving ? 'Creating...' : 'Create Poll'}
            </button>
            <button onClick={() => setView('list')}
              className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-100 transition"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Cancel</button>
          </div>
        </div>
      )}

      {polls.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-14 text-center shadow-[0_2px_4px_rgba(0,0,0,0.04)]">
          <p className="text-sm font-semibold text-gray-400" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>No polls yet</p>
          <p className="text-xs text-gray-300 mt-1">Create a poll to start collecting votes</p>
        </div>
      ) : (
        <div className="space-y-4">
          {polls.map(poll => (
            <div key={poll.id} className={`bg-white rounded-2xl border p-5 shadow-[0_2px_8px_rgba(0,0,0,0.06)]
              ${poll.isActive ? 'border-gray-200' : 'border-gray-100 opacity-75'}`}>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-black text-gray-900 text-sm" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                      {poll.title}
                    </p>
                    {poll.isActive && (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-green-700
                        bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                        LIVE
                      </span>
                    )}
                  </div>
                  {poll.description && (
                    <p className="text-xs text-gray-400 mt-0.5">{poll.description}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-0.5">
                    {poll.options.length} options · {poll._count.votes} vote{poll._count.votes !== 1 ? 's' : ''}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={() => toggleActive(poll)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition
                      ${poll.isActive
                        ? 'bg-white text-gray-600 border-gray-200 hover:border-red-300 hover:text-red-500'
                        : 'bg-gray-900 text-white border-gray-900 hover:bg-gray-800'
                      }`}
                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    {poll.isActive ? 'Close' : 'Open'}
                  </button>
                  {deleteId === poll.id ? (
                    <div className="flex gap-1.5">
                      <button onClick={() => deletePoll(poll.id)}
                        className="px-2.5 py-1 rounded-lg bg-red-600 text-white text-xs font-bold">Delete</button>
                      <button onClick={() => setDeleteId(null)}
                        className="px-2.5 py-1 rounded-lg bg-gray-100 text-gray-600 text-xs font-bold">Cancel</button>
                    </div>
                  ) : (
                    <button onClick={() => setDeleteId(poll.id)}
                      className="p-1.5 rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-50 transition">
                      <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                {poll.options.map(opt => {
                  const pct = poll._count.votes > 0
                    ? Math.round((opt._count.votes / poll._count.votes) * 100) : 0;
                  return (
                    <div key={opt.id}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-gray-600" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                          {opt.text}
                        </span>
                        <span className="text-xs text-gray-400">{opt._count.votes} · {pct}%</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-gray-400 rounded-full transition-all duration-700"
                          style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
