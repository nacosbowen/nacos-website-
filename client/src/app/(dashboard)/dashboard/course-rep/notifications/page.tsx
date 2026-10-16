'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import DashboardShell from '@/components/dashboard/DashboardShell';

const CATEGORIES = ['general', 'academic', 'event', 'urgent'] as const;

type RepClass = {
  departmentId: number;
  level: number;
  department: { id: number; name: string; code: string };
};

type SentNotification = {
  id: string;
  title: string;
  body: string;
  audience: string;
  category: string;
  createdAt: string;
  departmentId: number | null;
  isPopup: boolean;
  popupExpiresAt: string | null;
  oneTime?: boolean;
};

export default function CourseRepNotifications() {
  const { isLoading: authLoading } = useAuth();
  const [classes, setClasses] = useState<RepClass[]>([]);
  const [classesLoading, setClassesLoading] = useState(true);
  const [classIndex, setClassIndex] = useState(0);

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [category, setCategory] = useState<typeof CATEGORIES[number]>('general');
  const [popupDays, setPopupDays] = useState(3);
  const [oneTime, setOneTime] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [sent, setSent] = useState<SentNotification[]>([]);
  const [sentLoading, setSentLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function loadSent() {
    try {
      const { data } = await api.get('/notifications/course-rep/sent');
      setSent(data);
    } catch { /* keep the list as it was */ }
    finally {
      setSentLoading(false);
    }
  }

  useEffect(() => {
    if (authLoading) return;
    api.get('/notifications/course-rep/classes')
      .then((r) => setClasses(r.data))
      .catch(() => setClasses([]))
      .finally(() => setClassesLoading(false));
    loadSent();
  }, [authLoading]);

  async function handleDelete(id: string) {
    setDeleting(true);
    try {
      await api.delete(`/notifications/course-rep/${id}`);
      setSent((prev) => prev.filter((n) => n.id !== id));
      setDeleteId(null);
    } catch {
      setError('Failed to delete notification. Please try again.');
    } finally {
      setDeleting(false);
    }
  }

  const selected = classes[classIndex];
  const classLabel = (c: RepClass) => `${c.level} Level · ${c.department.name}`;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (classesLoading) return;
    if (!selected) {
      setError('You are not assigned to a class yet');
      return;
    }
    if (!title.trim() || !body.trim()) {
      setError('Title and body are required');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/notifications/course-rep', {
        title,
        body,
        category,
        popupDays,
        oneTime,
        departmentId: selected.departmentId,
        level: selected.level,
      });
      setTitle('');
      setBody('');
      setCategory('general');
      setPopupDays(3);
      setOneTime(false);
      setSuccess(true);
      loadSent();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Failed to post notification. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  const label = 'text-xs font-bold text-gray-500 mb-1 block';
  const field =
    'w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-base focus:outline-none focus:border-gray-400';
  const grotesk = { fontFamily: "'Space Grotesk', sans-serif" };

  return (
    <DashboardShell title="Post Notification">
      <div className="max-w-2xl mx-auto space-y-6">
        {deleteId && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
            onClick={() => { if (!deleting) setDeleteId(null); }}
          >
            <div className="bg-white rounded-2xl p-6 w-full max-w-xs shadow-xl" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-base font-black text-gray-900 mb-2" style={grotesk}>Delete notification?</h3>
              <p className="text-sm text-gray-500 mb-5">
                <span className="font-semibold text-gray-700">{sent.find((n) => n.id === deleteId)?.title}</span>{' '}
                will be removed for your class. This can't be undone.
              </p>
              {error && <p className="text-xs font-semibold text-red-600 mb-3">{error}</p>}
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

        <div>
          <h2 className="text-xl font-black text-gray-900" style={grotesk}>Post Notification</h2>
          <p className="text-sm text-gray-400 mt-0.5">Send an update to students in your class</p>
        </div>

        {!classesLoading && classes.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
            <p className="text-sm text-gray-400">You are not assigned to a class yet</p>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4 shadow-[0_2px_4px_rgba(0,0,0,0.04)]"
          >
            <div>
              <label className={label} style={grotesk}>Sending to</label>
              {classesLoading ? (
                <div className="h-[46px] rounded-xl border border-gray-200 bg-gray-50 animate-pulse" />
              ) : classes.length === 1 ? (
                <div className="rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-base text-gray-700">
                  {classLabel(classes[0])}
                </div>
              ) : (
                <select
                  value={classIndex}
                  onChange={(e) => setClassIndex(Number(e.target.value))}
                  className={field}
                >
                  {classes.map((c, i) => (
                    <option key={i} value={i}>{classLabel(c)}</option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label className={label} style={grotesk}>Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={field}
                placeholder="Notification title"
              />
            </div>

            <div>
              <label className={label} style={grotesk}>Body</label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={4}
                className={field}
                placeholder="Notification details"
              />
            </div>

            <div>
              <label className={label} style={grotesk}>Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as typeof CATEGORIES[number])}
                className={`${field} capitalize`}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c} className="capitalize">{c}</option>
                ))}
              </select>
            </div>

            {!oneTime && (
              <div>
                <label className={label} style={grotesk}>Days to show popup</label>
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={popupDays}
                  onChange={(e) => setPopupDays(Number(e.target.value))}
                  className={field}
                />
                <p className="text-[11px] text-gray-400 mt-1">
                  Students will see this popup each time they log in during this period.
                </p>
              </div>
            )}

            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={oneTime}
                onChange={(e) => setOneTime(e.target.checked)}
                className="w-4 h-4 mt-0.5 rounded border-gray-300 text-gray-900 focus:ring-gray-400"
              />
              <span className="text-sm text-gray-700" style={grotesk}>
                One-time phone notification only
                <span className="block text-[11px] text-gray-400 font-normal">
                  Sent as a phone alert. Available on the Notifications page for 12 hours. No login popup.
                </span>
              </span>
            </label>

            {error && <p className="text-xs font-semibold text-red-600">{error}</p>}
            {success && (
              <p className="text-xs font-semibold text-green-600">Notification posted successfully</p>
            )}

            <button
              type="submit"
              disabled={submitting || classesLoading}
              className="w-full bg-gray-900 text-white rounded-xl py-2.5 text-sm font-bold hover:bg-gray-800 transition disabled:opacity-50"
              style={grotesk}
            >
              {submitting ? 'Posting...' : 'Post Notification'}
            </button>
          </form>
        )}

        <div className="space-y-3">
          <p className="text-xs font-bold text-gray-400 tracking-widest uppercase" style={grotesk}>
            Sent notifications · {sent.length}
          </p>

          {sentLoading ? (
            <div className="space-y-3 animate-pulse">
              {[1, 2].map((i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 h-24" />
              ))}
            </div>
          ) : sent.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
              <p className="text-sm text-gray-400">Nothing sent yet</p>
            </div>
          ) : (
            sent.map((n) => {
              const cls = classes.find(
                (c) => c.departmentId === n.departmentId && `level_${c.level}` === n.audience
              );
              return (
                <div key={n.id} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-[0_2px_4px_rgba(0,0,0,0.04)]">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-[10px] font-bold text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">
                          {cls ? classLabel(cls) : n.audience.replace('level_', '') + ' Level'}
                        </span>
                        <span className="text-[10px] font-bold text-gray-500 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded-full capitalize">
                          {n.category}
                        </span>
                        {n.oneTime && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-blue-50 text-blue-700 border-blue-200">
                            One-time
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-black text-gray-900" style={grotesk}>{n.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.body}</p>
                      <p className="text-[11px] text-gray-400 mt-1">
                        {new Date(n.createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                    <button
                      onClick={() => { setError(''); setDeleteId(n.id); }}
                      className="text-xs font-semibold text-gray-400 hover:text-red-500 transition flex-shrink-0">
                      Delete
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </DashboardShell>
  );
}