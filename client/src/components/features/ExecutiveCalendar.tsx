'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/api';

type NacosEvent = {
  id: string;
  title: string;
  description: string | null;
  date: string;
  location: string | null;
  imageUrl: string | null;
  price: number;
  spots: number;
  category: string;
  createdAt: string;
  _count: { rsvps: number };
};

const CATEGORIES = ['Annual Dinner', 'Tech Talk', 'Workshop', 'Sports', 'Social', 'Competition', 'Other'];
const EMPTY_FORM = { title: '', description: '', date: '', location: '', price: '0', spots: '0', category: 'Other' };
export default function ExecutiveCalendar() {
  const [events, setEvents] = useState<NacosEvent[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editing, setEditing] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [uploadingImageFor, setUploadingImageFor] = useState<string | null>(null);
  const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5001';


  useEffect(() => {
    api.get('/events').then(r => {
      setEvents(r.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  function flash(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  }

 async function handleSave() {
  if (!form.title || !form.date) return;
  setSaving(true);
  try {
    const payload = {
      title: form.title,
      description: form.description || null,
      date: new Date(form.date).toISOString(),
      location: form.location || null,
      price: Number(form.price) || 0,
      spots: Number(form.spots) || 0,
      category: form.category,
    };
    if (editing) {
      const { data } = await api.patch(`/events/${editing}`, payload);
      setEvents(prev => prev.map(e => e.id === editing ? { ...data, _count: e._count } : e));
      flash('Event updated ✓');
    } else {
      const { data } = await api.post('/events', payload);
      setEvents(prev => [{ ...data, _count: { rsvps: 0 } }, ...prev]);
      flash('Event created ✓');
    }
    setForm(EMPTY_FORM);
    setEditing(null);
    setShowForm(false);
  } catch (err: any) {
    flash(err?.response?.data?.message || 'Failed to save event');
  } finally {
    setSaving(false);
  }
}

  async function handleDelete(id: string) {
    try {
      await api.delete(`/events/${id}`);
      setEvents(prev => prev.filter(e => e.id !== id));
      setDeleteId(null);
      flash('Event deleted');
    } catch {
      flash('Failed to delete event');
    }
  }

 function startEdit(event: NacosEvent) {
  const localDate = new Date(event.date);
  const pad = (n: number) => String(n).padStart(2, '0');
  const dateLocal = `${localDate.getFullYear()}-${pad(localDate.getMonth() + 1)}-${pad(localDate.getDate())}T${pad(localDate.getHours())}:${pad(localDate.getMinutes())}`;
  setForm({
    title: event.title,
    description: event.description ?? '',
    date: dateLocal,
    location: event.location ?? '',
    price: String(event.price),
    spots: String(event.spots),
    category: event.category,
  });
  setEditing(event.id);
  setShowForm(true);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
  const sorted = [...events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto space-y-3 animate-pulse">
        {[1, 2, 3].map(i => <div key={i} className="bg-white rounded-2xl border border-gray-100 h-20" />)}
      </div>
    );
  }
  async function handleImageUpload(eventId: string, file: File) {
  setUploadingImageFor(eventId);
  try {
    const fd = new FormData();
    fd.append('file', file);
    const { data } = await api.post(`/events/${eventId}/image`, fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    setEvents(prev => prev.map(e => e.id === eventId ? { ...e, imageUrl: data.imageUrl } : e));
    flash('Image uploaded ✓');
  } catch (err: any) {
    flash(err?.response?.data?.message || 'Failed to upload image');
  } finally {
    setUploadingImageFor(null);
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
          <h2 className="text-xl font-black text-gray-900" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>NACOS Events</h2>
          <p className="text-sm text-gray-400 mt-0.5">Create and manage events · {events.length} total</p>
        </div>
        <button onClick={() => { setShowForm(s => !s); setEditing(null); setForm(EMPTY_FORM); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-gray-900 hover:bg-gray-800 transition"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          New Event
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4 shadow-[0_4px_16px_rgba(0,0,0,0.08)]">
          <p className="text-sm font-black text-gray-900" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            {editing ? 'Edit Event' : 'Create Event'}
          </p>
          <div className="grid grid-cols-1 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Title *</label>
              <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="e.g. NACOS Tech Week 2025"
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Date & Time *</label>
              <input type="datetime-local" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Location</label>
              <input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                placeholder="e.g. CS Lecture Hall 1"
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
            </div>
            <div className="grid grid-cols-3 gap-3">
  <div>
    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Category</label>
    <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
      className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900">
      {CATEGORIES.map(c => <option key={c}>{c}</option>)}
    </select>
  </div>
  <div>
    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Price (₦, 0 = Free)</label>
    <input type="number" min="0" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
      className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
  </div>
  <div>
    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Spots (0 = Unlimited)</label>
    <input type="number" min="0" value={form.spots} onChange={e => setForm(f => ({ ...f, spots: e.target.value }))}
      className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
  </div>
</div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Description</label>
              <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                rows={3} placeholder="Optional details about the event..."
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none" />
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <button onClick={handleSave} disabled={!form.title || !form.date || saving}
              className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-gray-900 hover:bg-gray-800
                disabled:opacity-40 disabled:cursor-not-allowed transition"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              {saving ? 'Saving...' : editing ? 'Save Changes' : 'Create Event'}
            </button>
            <button onClick={() => { setShowForm(false); setEditing(null); setForm(EMPTY_FORM); }}
              className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-100 transition"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Cancel</button>
          </div>
        </div>
      )}

      {events.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-14 text-center shadow-[0_2px_4px_rgba(0,0,0,0.04)]">
          <p className="text-sm font-semibold text-gray-400" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>No events yet</p>
          <p className="text-xs text-gray-300 mt-1">Create your first event to get started</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map(event => {
            const d = new Date(event.date);
            const isPast = d < new Date();
              return (
              <div key={event.id} className={`bg-white rounded-2xl border p-5 shadow-[0_2px_8px_rgba(0,0,0,0.06)]
                ${isPast ? 'border-gray-100 opacity-70' : 'border-gray-200'}`}>
                {event.imageUrl && (
                  <img src={`${baseUrl}${event.imageUrl}`} alt={event.title}
                    className="w-full h-32 object-cover rounded-xl mb-4" />
                )}
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 text-center">
                    <p className="text-xl font-black text-gray-900" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{d.getDate()}</p>
                    <p className="text-xs font-semibold text-gray-400 uppercase">
                      {d.toLocaleDateString('en-GB', { month: 'short' })}
                    </p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-gray-900 text-sm" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{event.title}</p>
                    <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1">
                      <span className="text-xs text-gray-400">
                        {d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {event.location && <span className="text-xs text-gray-400">{event.location}</span>}
                      <span className="text-xs text-gray-400">{event._count.rsvps} RSVPs</span>
                    </div>
                    {event.description && (
                      <p className="text-xs text-gray-500 mt-1.5 leading-relaxed line-clamp-2">{event.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button onClick={() => startEdit(event)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition">
                      <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                    </button>
                    {deleteId === event.id ? (
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => handleDelete(event.id)}
                          className="px-2.5 py-1 rounded-lg bg-red-600 text-white text-xs font-bold">Delete</button>
                        <button onClick={() => setDeleteId(null)}
                          className="px-2.5 py-1 rounded-lg bg-gray-100 text-gray-600 text-xs font-bold">Cancel</button>
                      </div>
                    ) : (
                      <button onClick={() => setDeleteId(event.id)}
                        className="p-1.5 rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-50 transition">
                        <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <label className="text-xs text-gray-400 cursor-pointer hover:text-gray-600">
                    {uploadingImageFor === event.id ? 'Uploading...' : event.imageUrl ? 'Change image' : '+ Add image'}
                    <input type="file" accept="image/*" className="hidden"
                      disabled={uploadingImageFor === event.id}
                      onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload(event.id, file);
                      }} />
                  </label>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
