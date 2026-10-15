'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { socket } from '@/lib/socket'; // same path as on the student page

const AUDIENCES = ['all', 'level_100', 'level_200', 'level_300', 'level_400'] as const;
const CATEGORIES = ['general', 'academic', 'event', 'urgent'] as const;

type SentNotification = {
  id: string;
  title: string;
  body: string;
  audience: string;
  category: string;
  createdAt: string;
  isPopup: boolean;
  popupExpiresAt: string | null;
  oneTime?: boolean;
};

export default function ExecutiveNotifications() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [audience, setAudience] = useState<typeof AUDIENCES[number]>('all');
  const [category, setCategory] = useState<typeof CATEGORIES[number]>('general');
  const [popupDays, setPopupDays] = useState(3);
  const [oneTime, setOneTime] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const { isLoading: authLoading } = useAuth();
  const [sent, setSent] = useState<SentNotification[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editBody, setEditBody] = useState('');
  const [editAudience, setEditAudience] = useState<typeof AUDIENCES[number]>('all');
  const [editCategory, setEditCategory] = useState<typeof CATEGORIES[number]>('general');
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState('');
  const [editIsPopup, setEditIsPopup] = useState(false);
  const [editWasActive, setEditWasActive] = useState(false);
  const [editExpiryActive, setEditExpiryActive] = useState(false);
  const [editPopupDays, setEditPopupDays] = useState(3);

  // One-time notifications keep a fixed 12-hour life, so their popup settings are hidden in the edit modal
  const editingOneTime = !!sent.find(n => n.id === editId)?.oneTime;

  async function loadSent() {
    try {
      const { data } = await api.get('/notifications/sent');
      setSent(data);
    } catch { /* keep the list as it was */ }
  }

  useEffect(() => {
    if (authLoading) return;
    loadSent();
  }, [authLoading]);

  // Another executive deleted a notification: drop it from this list right away
  useEffect(() => {
    function handleDeleted({ id }: { id: string }) {
      setSent(prev => prev.filter(n => n.id !== id));
    }
    socket.on('notification:delete', handleDeleted);
    return () => {
      socket.off('notification:delete', handleDeleted);
    };
  }, []);

  async function handleDelete(id: string) {
    setDeleting(true);
    try {
      await api.delete(`/notifications/${id}`);
      setSent(prev => prev.filter(n => n.id !== id));
      setDeleteId(null);
    } catch {
      setError('Failed to delete notification. Please try again.');
    } finally {
      setDeleting(false);
    }
  }

  function openEdit(n: SentNotification) {
    const expiryActive = !!n.popupExpiresAt && new Date(n.popupExpiresAt) > new Date();
    const active = n.isPopup && expiryActive;
    setEditError('');
    setEditId(n.id);
    setEditTitle(n.title);
    setEditBody(n.body);
    setEditAudience(n.audience as typeof AUDIENCES[number]);
    setEditCategory(n.category as typeof CATEGORIES[number]);
    setEditExpiryActive(expiryActive);
    setEditWasActive(active);
    setEditIsPopup(active);
    setEditPopupDays(3);
  }

  async function handleSaveEdit() {
    if (!editId) return;
    if (!editTitle.trim() || !editBody.trim()) {
      setEditError('Title and body are required');
      return;
    }
    const popupChanged = editIsPopup !== editWasActive;
    setSaving(true);
    setEditError('');
    try {
      const { data } = await api.patch(`/notifications/${editId}`, {
        title: editTitle,
        body: editBody,
        audience: editAudience,
        category: editCategory,
        ...(popupChanged && {
          isPopup: editIsPopup,
          ...(editIsPopup && !editExpiryActive && { popupDays: editPopupDays }),
        }),
      });
      setSent(prev => prev.map(n => (n.id === editId ? { ...n, ...data } : n)));
      setEditId(null);
    } catch {
      setEditError('Failed to save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  }

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
      await api.post('/notifications', {
        title,
        body,
        audience,
        category,
        popupDays,
        oneTime,
      });
      setTitle('');
      setBody('');
      setAudience('all');
      setCategory('general');
      setPopupDays(3);
      setOneTime(false);
      setSuccess(true);
      loadSent();
    } catch {
      setError('Failed to post notification. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {deleteId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          onClick={() => { if (!deleting) setDeleteId(null); }}
        >
          <div
            className="bg-white rounded-2xl p-6 w-full max-w-xs shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3
              className="text-base font-black text-gray-900 mb-2"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Delete notification?
            </h3>
            <p className="text-sm text-gray-500 mb-5">
              <span className="font-semibold text-gray-700">
                {sent.find((n) => n.id === deleteId)?.title}
              </span>{' '}
              will be removed for everyone. This can't be undone.
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

      {editId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          onClick={() => { if (!saving) setEditId(null); }}
        >
          <div
            className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <h3
              className="text-base font-black text-gray-900"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Edit notification
            </h3>

            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-base focus:outline-none focus:border-gray-400"
              placeholder="Title"
            />
            <textarea
              value={editBody}
              onChange={(e) => setEditBody(e.target.value)}
              rows={4}
              className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-base focus:outline-none focus:border-gray-400"
              placeholder="Body"
            />
            <div className="grid grid-cols-2 gap-3">
              <select
                value={editAudience}
                onChange={(e) => setEditAudience(e.target.value as typeof AUDIENCES[number])}
                className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-base focus:outline-none focus:border-gray-400"
              >
                {AUDIENCES.map(a => (
                  <option key={a} value={a}>{a === 'all' ? 'All levels' : a.replace('level_', '') + ' Level'}</option>
                ))}
              </select>
              <select
                value={editCategory}
                onChange={(e) => setEditCategory(e.target.value as typeof CATEGORIES[number])}
                className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-base focus:outline-none focus:border-gray-400 capitalize"
              >
                {CATEGORIES.map(c => (
                  <option key={c} value={c} className="capitalize">{c}</option>
                ))}
              </select>
            </div>

            {!editingOneTime && (
              <div className="rounded-xl border border-gray-200 p-3.5 space-y-3">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editIsPopup}
                    onChange={(e) => setEditIsPopup(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-gray-400"
                  />
                  <span className="text-sm font-semibold text-gray-700" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    Show as popup when students log in
                  </span>
                </label>

                {editIsPopup && !editExpiryActive && (
                  <div>
                    <label className="text-xs font-bold text-gray-500 mb-1 block" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                      Days to show popup
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={30}
                      value={editPopupDays}
                      onChange={(e) => setEditPopupDays(Number(e.target.value))}
                      className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-base focus:outline-none focus:border-gray-400"
                    />
                  </div>
                )}

                <p className="text-[11px] text-gray-400">
                  {editExpiryActive
                    ? 'Turning the popup off and on again keeps the original expiry date.'
                    : 'This popup has no active expiry, so enabling it starts a fresh countdown.'}
                </p>
              </div>
            )}
            {editError && <p className="text-xs font-semibold text-red-600">{editError}</p>}

            <div className="flex gap-2">
              <button
                onClick={() => setEditId(null)}
                disabled={saving}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition disabled:opacity-50"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={saving}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-gray-900 hover:bg-gray-800 transition disabled:opacity-50"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                {saving ? 'Saving...' : 'Save changes'}
              </button>
            </div>
          </div>
        </div>
      )}

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
            className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-base focus:outline-none focus:border-gray-400"
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
            className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-base focus:outline-none focus:border-gray-400"
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
              className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-base focus:outline-none focus:border-gray-400"
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
              className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-base focus:outline-none focus:border-gray-400 capitalize"
            >
              {CATEGORIES.map(c => (
                <option key={c} value={c} className="capitalize">{c}</option>
              ))}
            </select>
          </div>
        </div>

        {!oneTime && (
          <div>
            <label className="text-xs font-bold text-gray-500 mb-1 block" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Days to show popup
            </label>
            <input
              type="number"
              min={1}
              max={30}
              value={popupDays}
              onChange={(e) => setPopupDays(Number(e.target.value))}
              className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-base focus:outline-none focus:border-gray-400"
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
          <span className="text-sm text-gray-700" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            One-time phone notification only
            <span className="block text-[11px] text-gray-400 font-normal">
              Sent as a phone alert. Students can tap it to open it on the Notifications page, where it stays for 12 hours and is then deleted automatically. It will not appear as a login popup.
            </span>
          </span>
        </label>

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

      <div className="space-y-3">
        <p className="text-xs font-bold text-gray-400 tracking-widest uppercase"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          Sent notifications · {sent.length}
        </p>

        {sent.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
            <p className="text-sm text-gray-400">Nothing sent yet</p>
          </div>
        ) : (
          sent.map(n => {
            const popupActive = n.isPopup && n.popupExpiresAt && new Date(n.popupExpiresAt) > new Date();
            return (
              <div key={n.id} className="bg-white rounded-2xl border border-gray-100 p-4
                shadow-[0_2px_4px_rgba(0,0,0,0.04)]">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-[10px] font-bold text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">
                        {n.audience === 'all' ? 'All levels' : n.audience.replace('level_', '') + ' Level'}
                      </span>
                      <span className="text-[10px] font-bold text-gray-500 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded-full capitalize">
                        {n.category}
                      </span>
                      {n.oneTime && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-blue-50 text-blue-700 border-blue-200">
                          One-time
                        </span>
                      )}
                      {n.isPopup && (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border
                          ${popupActive
                            ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                            : 'bg-gray-50 text-gray-400 border-gray-200'}`}>
                          {popupActive ? 'Popup active' : 'Popup expired'}
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-black text-gray-900" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                      {n.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.body}</p>
                    <p className="text-[11px] text-gray-400 mt-1">
                      {new Date(n.createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    <button
                      onClick={() => openEdit(n)}
                      className="text-xs font-semibold text-gray-400 hover:text-gray-900 transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => { setError(''); setDeleteId(n.id); }}
                      className="text-xs font-semibold text-gray-400 hover:text-red-500 transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}