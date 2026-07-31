'use client';
import { useState, useEffect } from 'react';

const CATS = ['Annual Dinner', 'Tech Talk', 'Workshop', 'Sports', 'Social', 'Competition', 'Other'];
const EMPTY = { title: '', date: '', time: '', venue: '', price: '', spots: '', category: 'Other', desc: '' };

type RsvpEvent = {
  id: string; title: string; date: string; time: string; venue: string;
  price: number; spots: number; category: string; desc: string; createdAt: number;
};

function load(): RsvpEvent[] {
  try { return JSON.parse(localStorage.getItem('nacos_rsvp_events') ?? '[]'); } catch { return []; }
}
function save(data: RsvpEvent[]) { localStorage.setItem('nacos_rsvp_events', JSON.stringify(data)); }

function getRsvpCount(eventId: string): number {
  try {
    const all = JSON.parse(localStorage.getItem('nacos_rsvp_tickets') ?? '{}') as Record<string, Record<string, unknown>>;
    return Object.values(all).filter(v => v[eventId]).length;
  } catch { return 0; }
}

export default function ExecutiveRsvp() {
  const [events, setEvents] = useState<RsvpEvent[]>([]);
  const [form, setForm] = useState({ ...EMPTY });
  const [showForm, setShowForm] = useState(false);
  const [toast, setToast] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => { setEvents(load()); }, []);

  function persist(data: RsvpEvent[]) { setEvents(data); save(data); }

  function addEvent() {
    if (!form.title.trim() || !form.date || !form.time || !form.venue.trim()) return;
    const event: RsvpEvent = {
      id: Date.now().toString(),
      title: form.title.trim(),
      date: form.date,
      time: form.time,
      venue: form.venue.trim(),
      price: parseFloat(form.price) || 0,
      spots: parseInt(form.spots) || 0,
      category: form.category,
      desc: form.desc.trim(),
      createdAt: Date.now(),
    };
    persist([...events, event].sort((a, b) => a.date.localeCompare(b.date)));
    setForm({ ...EMPTY });
    setShowForm(false);
    flash('Event created · students can now RSVP ✓');
  }

  function flash(msg: string) { setToast(msg); setTimeout(() => setToast(''), 3000); }

  const CAT_STYLE: Record<string, string> = {
    'Annual Dinner': 'bg-yellow-50 text-yellow-700 border-yellow-200',
    'Tech Talk': 'bg-blue-50 text-blue-700 border-blue-200',
    'Workshop': 'bg-purple-50 text-purple-700 border-purple-200',
    'Sports': 'bg-green-50 text-green-700 border-green-200',
    'Social': 'bg-pink-50 text-pink-700 border-pink-200',
    'Competition': 'bg-orange-50 text-orange-700 border-orange-200',
    'Other': 'bg-gray-50 text-gray-600 border-gray-200',
  };

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
          <h2 className="text-xl font-black text-gray-900" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>RSVP Events</h2>
          <p className="text-sm text-gray-400 mt-0.5">Create events · students RSVP and receive digital tickets</p>
        </div>
        <button onClick={() => setShowForm(s => !s)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-gray-900 hover:bg-gray-800 transition"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Create Event
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4 shadow-[0_4px_16px_rgba(0,0,0,0.08)]">
          <p className="text-sm font-black text-gray-900" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>New RSVP Event</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Event Title</label>
              <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="e.g. NACOS Annual Dinner 2025"
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Date</label>
              <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Time</label>
              <input value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))}
                placeholder="e.g. 6:00 PM"
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Venue</label>
              <input value={form.venue} onChange={e => setForm(f => ({ ...f, venue: e.target.value }))}
                placeholder="e.g. Bowen Recreation Center"
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Category</label>
              <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900">
                {CATS.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Ticket Price (₦)</label>
              <input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                placeholder="0 = Free"
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Available Spots</label>
              <input type="number" value={form.spots} onChange={e => setForm(f => ({ ...f, spots: e.target.value }))}
                placeholder="0 = Unlimited"
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
            </div>
            <div className="col-span-2">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Description (optional)</label>
              <textarea value={form.desc} onChange={e => setForm(f => ({ ...f, desc: e.target.value }))}
                rows={2} placeholder="Brief event description..."
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-gray-900" />
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <button onClick={addEvent}
              disabled={!form.title.trim() || !form.date || !form.time || !form.venue.trim()}
              className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-gray-900 hover:bg-gray-800
                disabled:opacity-40 disabled:cursor-not-allowed transition"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Create & Publish</button>
            <button onClick={() => { setShowForm(false); setForm({ ...EMPTY }); }}
              className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-100 transition"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Cancel</button>
          </div>
        </div>
      )}

      {events.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-14 text-center shadow-[0_2px_4px_rgba(0,0,0,0.04)]">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}
            className="w-12 h-12 text-gray-200 mx-auto mb-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 010 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 010-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375z" />
          </svg>
          <p className="text-sm font-semibold text-gray-400" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>No events created yet</p>
          <p className="text-xs text-gray-300 mt-1">Create an event above — students will see it and can RSVP</p>
        </div>
      ) : (
        <div className="space-y-3">
          {events.map(ev => {
            const rsvpCount = getRsvpCount(ev.id);
            const d = new Date(ev.date + 'T12:00:00');
            const catStyle = CAT_STYLE[ev.category] ?? CAT_STYLE.Other;
            return (
              <div key={ev.id} className="bg-white rounded-2xl border border-gray-100 p-5
                shadow-[0_2px_4px_rgba(0,0,0,0.04)]">
                <div className="flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className={`text-[10px] font-bold border px-2.5 py-0.5 rounded-full ${catStyle}`}
                        style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{ev.category}</span>
                      {ev.price === 0 ? (
                        <span className="text-[10px] font-bold text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">Free</span>
                      ) : (
                        <span className="text-[10px] font-bold text-gray-600 bg-gray-100 border border-gray-200 px-2 py-0.5 rounded-full">₦{ev.price.toLocaleString()}</span>
                      )}
                    </div>
                    <p className="text-sm font-black text-gray-900" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{ev.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {d.toLocaleDateString('en-NG', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })} · {ev.time} · {ev.venue}
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs font-bold text-gray-700" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                        {rsvpCount} RSVP{rsvpCount !== 1 ? 's' : ''}
                      </span>
                      {ev.spots > 0 && (
                        <span className="text-xs text-gray-400">{Math.max(ev.spots - rsvpCount, 0)} spots left</span>
                      )}
                    </div>
                  </div>
                  {deleteId === ev.id ? (
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <p className="text-xs text-gray-500">Delete?</p>
                      <button onClick={() => { persist(events.filter(e => e.id !== ev.id)); setDeleteId(null); }}
                        className="px-2.5 py-1 rounded-lg bg-red-600 text-white text-xs font-bold">Yes</button>
                      <button onClick={() => setDeleteId(null)}
                        className="px-2.5 py-1 rounded-lg bg-gray-100 text-gray-600 text-xs font-bold">No</button>
                    </div>
                  ) : (
                    <button onClick={() => setDeleteId(ev.id)}
                      className="p-1.5 rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-50 transition flex-shrink-0">
                      <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
