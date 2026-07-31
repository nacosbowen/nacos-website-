'use client';
import { useState } from 'react';
import api from '@/lib/api';

const CATEGORIES = ['Academic', 'Welfare', 'Events & Activities', 'Finance', 'Leadership', 'Infrastructure', 'Other'];

export default function SuggestionBox() {
  const [category, setCategory] = useState('');
  const [text, setText] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!category || !text.trim()) return;
    setLoading(true);
    setError('');
    try {
      const body = `[${category}] ${text.trim()}`;
      await api.post('/suggestions', { body, anonymous: true });
      setSubmitted(true);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to submit suggestion');
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setCategory('');
    setText('');
    setSubmitted(false);
    setError('');
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-black text-gray-900" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          Suggestion Box
        </h2>
        <p className="text-sm text-gray-400 mt-0.5">
          Your feedback goes directly to NACOS executives — completely anonymous
        </p>
      </div>

      {submitted ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center
          shadow-[0_4px_6px_rgba(0,0,0,0.04),0_10px_20px_rgba(0,0,0,0.07)]">
          <div className="w-14 h-14 rounded-full bg-gray-900 flex items-center justify-center mx-auto mb-5">
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6 text-white">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
          <p className="text-base font-black text-gray-900 mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Suggestion submitted!
          </p>
          <p className="text-sm text-gray-400 mb-6">
            Your anonymous feedback has been sent to the executives.
          </p>
          <button onClick={reset}
            className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-gray-900 hover:bg-gray-800 transition"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Submit another
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 p-6
          shadow-[0_4px_6px_rgba(0,0,0,0.04),0_10px_20px_rgba(0,0,0,0.07)]">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-2 tracking-wide uppercase"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                Category
              </label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => (
                  <button key={cat} type="button" onClick={() => setCategory(cat)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all
                      ${category === cat
                        ? 'bg-gray-900 text-white border-gray-900'
                        : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'
                      }`}
                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 tracking-wide uppercase"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                Your suggestion
              </label>
              <textarea
                value={text}
                onChange={e => setText(e.target.value)}
                rows={5}
                placeholder="Share your thoughts, ideas, or concerns with the NACOS executives..."
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-900
                  placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent
                  transition-all duration-200 resize-none"
              />
              <p className="text-xs text-gray-400 mt-1">{text.length} characters · min 10</p>
            </div>

            {error && (
              <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm">
                {error}
              </div>
            )}

            <div className="flex items-center gap-3 pt-1">
              <button type="submit"
                disabled={!category || text.trim().length < 10 || loading}
                className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-gray-900 hover:bg-gray-800
                  disabled:opacity-40 disabled:cursor-not-allowed transition"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                {loading ? 'Sending...' : 'Submit anonymously'}
              </button>
              <div className="flex items-center gap-1.5 text-xs text-gray-400">
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                100% anonymous
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
