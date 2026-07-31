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
  options: PollOption[];
  _count: { votes: number };
  myVote: string | null;
};

export default function NacosVoting() {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState<{ pollId: string; optionId: string } | null>(null);
  const [voting, setVoting] = useState<string | null>(null);

  useEffect(() => {
    // Fetch each active poll individually so we get myVote
    api.get('/polls').then(async r => {
      const allPolls: Poll[] = r.data;
      const withVotes = await Promise.all(
        allPolls.map(p =>
          p.isActive
            ? api.get(`/polls/${p.id}`).then(r2 => r2.data as Poll).catch(() => ({ ...p, myVote: null }))
            : Promise.resolve({ ...p, myVote: null })
        )
      );
      setPolls(withVotes);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  async function vote(pollId: string, optionId: string) {
    setVoting(pollId);
    try {
      await api.post(`/polls/${pollId}/vote`, { optionId });
      setPolls(prev => prev.map(p => {
        if (p.id !== pollId) return p;
        return {
          ...p,
          myVote: optionId,
          _count: { votes: p._count.votes + 1 },
          options: p.options.map(o =>
            o.id === optionId ? { ...o, _count: { votes: o._count.votes + 1 } } : o
          ),
        };
      }));
    } catch { /* already voted */ }
    setVoting(null);
    setConfirming(null);
  }

  const activePolls = polls.filter(p => p.isActive);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto space-y-4 animate-pulse">
        {[1, 2].map(i => <div key={i} className="bg-white rounded-2xl border border-gray-100 h-32" />)}
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-black text-gray-900" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          NACOS Voting
        </h2>
        <p className="text-sm text-gray-400 mt-0.5">
          Cast your vote in NACOS polls — each vote is confidential.
        </p>
      </div>

      {activePolls.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-14 text-center shadow-[0_2px_4px_rgba(0,0,0,0.04)]">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-5">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-8 h-8 text-gray-300">
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
          </div>
          <p className="text-sm font-black text-gray-400" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            No active polls right now
          </p>
          <p className="text-xs text-gray-300 mt-2 max-w-xs mx-auto leading-relaxed">
            The NACOS executives will open voting when polls go live. Check back soon.
          </p>
        </div>
      )}

      {activePolls.map(poll => {
        const totalVotes = poll._count.votes;
        const hasVoted = !!poll.myVote;

        return (
          <div key={poll.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-base font-black text-gray-900" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    {poll.title}
                  </p>
                  <span className="flex items-center gap-1 text-[10px] font-bold text-green-700
                    bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    LIVE
                  </span>
                </div>
                {poll.description && (
                  <p className="text-xs text-gray-400 mt-0.5">{poll.description}</p>
                )}
                <p className="text-xs text-gray-400 mt-0.5">
                  {poll.options.length} options · {totalVotes} vote{totalVotes !== 1 ? 's' : ''}
                </p>
              </div>
              {hasVoted && (
                <span className="text-[10px] font-bold text-green-700 bg-green-100 border border-green-200
                  px-2.5 py-1 rounded-full flex-shrink-0"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  Voted ✓
                </span>
              )}
            </div>

            <div className="divide-y divide-gray-50">
              {poll.options.map(option => {
                const voteCount = option._count.votes;
                const pct = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;
                const isMyChoice = poll.myVote === option.id;

                return (
                  <div key={option.id} className={`p-5 transition-colors ${isMyChoice ? 'bg-gray-50' : ''}`}>
                    <div className="flex items-start gap-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-black
                        ${isMyChoice ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500'}`}
                        style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                        {option.text.charAt(0).toUpperCase()}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-black text-gray-900" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                            {option.text}
                          </p>
                          {isMyChoice && (
                            <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-gray-900 flex-shrink-0">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>

                        {hasVoted && (
                          <div className="mt-2">
                            <div className="flex items-center justify-between mb-1">
                              <p className="text-xs font-bold text-gray-500">{pct}%</p>
                              <p className="text-xs text-gray-400">{voteCount} vote{voteCount !== 1 ? 's' : ''}</p>
                            </div>
                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-700 ${isMyChoice ? 'bg-gray-900' : 'bg-gray-300'}`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        )}

                        {!hasVoted && (
                          confirming?.pollId === poll.id && confirming?.optionId === option.id ? (
                            <div className="mt-3 flex items-center gap-2 flex-wrap">
                              <p className="text-xs text-gray-500 flex-1">
                                Confirm your vote for <strong>{option.text}</strong>?
                              </p>
                              <div className="flex gap-2">
                                <button onClick={() => vote(poll.id, option.id)} disabled={voting === poll.id}
                                  className="px-3 py-1.5 rounded-lg bg-gray-900 text-white text-xs font-bold hover:bg-gray-800 transition disabled:opacity-50"
                                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                                  {voting === poll.id ? '...' : 'Confirm'}
                                </button>
                                <button onClick={() => setConfirming(null)}
                                  className="px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 text-xs font-bold hover:bg-gray-200 transition"
                                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={() => setConfirming({ pollId: poll.id, optionId: option.id })}
                              className="mt-3 px-4 py-1.5 rounded-lg border border-gray-200 text-xs font-bold text-gray-600
                                hover:border-gray-900 hover:text-gray-900 transition"
                              style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                              Vote for this option
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {activePolls.length > 0 && activePolls.every(p => p.myVote) && (
        <div className="bg-gray-900 text-white rounded-2xl px-5 py-4 flex items-center gap-3">
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-green-400 flex-shrink-0">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          <p className="text-sm font-semibold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            You&apos;ve voted in all active polls. Results will be announced by the executives.
          </p>
        </div>
      )}
    </div>
  );
}
