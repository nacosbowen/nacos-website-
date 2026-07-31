'use client';
import { useState, useEffect } from 'react';

type DinnerInfo = {
  title: string; date: string; time: string; venue: string; theme: string;
  dressCode: string; ticketPrice: string; highlights: string;
};

const DEFAULT: DinnerInfo = {
  title: 'NACOS Annual Dinner',
  date: '',
  time: '6:00 PM',
  venue: 'Bowen University Recreation Center',
  theme: 'Black & Gold',
  dressCode: 'Black tie / formal. Gold accessories encouraged.',
  ticketPrice: '5000',
  highlights: 'Live performances\nAward ceremony\nNetworking\nPhoto booth',
};

function load(): DinnerInfo {
  try {
    const stored = localStorage.getItem('nacos_dinner');
    return stored ? { ...DEFAULT, ...JSON.parse(stored) } : { ...DEFAULT };
  } catch { return { ...DEFAULT }; }
}
function save(data: DinnerInfo) { localStorage.setItem('nacos_dinner', JSON.stringify(data)); }

export default function ExecutiveDinner() {
  const [info, setInfo] = useState<DinnerInfo>({ ...DEFAULT });
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<DinnerInfo>({ ...DEFAULT });
  const [toast, setToast] = useState('');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const data = load();
    setInfo(data);
    setForm(data);
    setLoaded(true);
  }, []);

  function saveChanges() {
    save(form);
    setInfo({ ...form });
    setEditing(false);
    flash('Dinner details updated ✓');
  }

  function flash(msg: string) { setToast(msg); setTimeout(() => setToast(''), 3000); }

  if (!loaded) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
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
          <h2 className="text-xl font-black text-gray-900" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>NACOS Dinner</h2>
          <p className="text-sm text-gray-400 mt-0.5">Edit dinner details · updates reflect on student view instantly</p>
        </div>
        {!editing && (
          <button onClick={() => { setForm({ ...info }); setEditing(true); }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-gray-900 hover:bg-gray-800 transition"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
            Edit Details
          </button>
        )}
      </div>

      {editing ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4 shadow-[0_4px_16px_rgba(0,0,0,0.08)]">
          <p className="text-sm font-black text-gray-900" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Edit Dinner Details</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Event Title</label>
              <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
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
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
            </div>
            <div className="col-span-2">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Venue</label>
              <input value={form.venue} onChange={e => setForm(f => ({ ...f, venue: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Theme</label>
              <input value={form.theme} onChange={e => setForm(f => ({ ...f, theme: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Ticket Price (₦)</label>
              <input value={form.ticketPrice} onChange={e => setForm(f => ({ ...f, ticketPrice: e.target.value }))}
                placeholder="0 = Free"
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
            </div>
            <div className="col-span-2">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Dress Code</label>
              <input value={form.dressCode} onChange={e => setForm(f => ({ ...f, dressCode: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
            </div>
            <div className="col-span-2">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">
                Highlights <span className="text-gray-300 font-normal normal-case">(one per line)</span>
              </label>
              <textarea value={form.highlights} onChange={e => setForm(f => ({ ...f, highlights: e.target.value }))}
                rows={4}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-gray-900" />
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <button onClick={saveChanges}
              className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-gray-900 hover:bg-gray-800 transition"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Save & Publish</button>
            <button onClick={() => setEditing(false)}
              className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-100 transition"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Cancel</button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Preview card */}
          <div className="bg-gray-900 rounded-2xl p-6 text-white relative overflow-hidden">
            <div className="absolute inset-0 opacity-5">
              <div className="absolute top-4 right-8 w-32 h-32 rounded-full border-4 border-yellow-400" />
              <div className="absolute bottom-4 left-12 w-20 h-20 rounded-full border-2 border-yellow-400" />
            </div>
            <p className="text-[10px] font-bold text-yellow-400 tracking-widest uppercase mb-2"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Annual Event</p>
            <h3 className="text-2xl font-black text-white mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{info.title}</h3>
            <p className="text-sm text-gray-400">{info.theme} · {info.venue}</p>
            {info.date && (
              <p className="text-sm text-yellow-400 mt-1 font-semibold">
                {new Date(info.date + 'T12:00:00').toLocaleDateString('en-NG', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} · {info.time}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Theme', value: info.theme },
              { label: 'Ticket Price', value: info.ticketPrice === '0' ? 'Free' : `₦${parseInt(info.ticketPrice || '0').toLocaleString()}` },
              { label: 'Dress Code', value: info.dressCode },
              { label: 'Time', value: `${info.date ? new Date(info.date + 'T12:00:00').toLocaleDateString('en-NG', { day: 'numeric', month: 'short' }) + ' · ' : ''}${info.time}` },
            ].map(({ label, value }) => (
              <div key={label} className="bg-white rounded-2xl border border-gray-100 px-4 py-3 shadow-[0_2px_4px_rgba(0,0,0,0.04)]">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">{label}</p>
                <p className="text-sm font-semibold text-gray-800 mt-0.5">{value || '—'}</p>
              </div>
            ))}
          </div>

          {info.highlights && (
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-[0_2px_4px_rgba(0,0,0,0.04)]">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Highlights</p>
              <ul className="space-y-2">
                {info.highlights.split('\n').filter(Boolean).map((h, i) => (
                  <li key={i} className="flex items-center gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{h}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
