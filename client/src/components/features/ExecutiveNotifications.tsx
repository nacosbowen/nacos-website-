'use client';
import { useState } from 'react';
import api from '@/lib/api';

const AUDIENCES = ['all', 'level_100', 'level_200', 'level_300', 'level_400'] as const;
const CATEGORIES = ['general', 'academic', 'event', 'urgent'] as const;

export default function ExecutiveNotifications() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [audience, setAudience] = useState<typeof AUDIENCES[number]>('all');
  const [category, setCategory] = useState<typeof CATEGORIES[number]>('general');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!title.trim() || !body.trim()) {
      setError('Title and body are required');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/notifications', { title, body, audience, category });
      setTitle('');
      setBody('');
      setAudience('all');
      setCategory('general');
      setSuccess(true);
    } catch {
      setError('Failed to post notification. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-black text-gray-900" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          Post Notification
        </h2>
        <p className="text-sm text-gray-400 mt-0.5">Send an update to students</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4
        shadow-[0_2px_4px_rgba(0,0,0,0.04)]">

        <div>
          <label className="text-xs font-bold text-gray-500 mb-1 block" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm focus:outline-none focus:border-gray-400"
            placeholder="Notification title"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-gray-500 mb-1 block" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Body
          </label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={4}
            className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm focus:outline-none focus:border-gray-400"
            placeholder="Notification details"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-bold text-gray-500 mb-1 block" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Audience
            </label>
            <select
              value={audience}
              onChange={(e) => setAudience(e.target.value as typeof AUDIENCES[number])}
              className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm focus:outline-none focus:border-gray-400"
            >
              {AUDIENCES.map(a => (
                <option key={a} value={a}>{a === 'all' ? 'All levels' : a.replace('level_', '') + ' Level'}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 mb-1 block" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as typeof CATEGORIES[number])}
              className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm focus:outline-none focus:border-gray-400 capitalize"
            >
              {CATEGORIES.map(c => (
                <option key={c} value={c} className="capitalize">{c}</option>
              ))}
            </select>
          </div>
        </div>

        {error && (
          <p className="text-xs font-semibold text-red-600">{error}</p>
        )}
        {success && (
          <p className="text-xs font-semibold text-green-600">Notification posted successfully</p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-gray-900 text-white rounded-xl py-2.5 text-sm font-bold hover:bg-gray-800 transition disabled:opacity-50"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          {submitting ? 'Posting...' : 'Post Notification'}
        </button>
      </form>
    </div>
  );
}