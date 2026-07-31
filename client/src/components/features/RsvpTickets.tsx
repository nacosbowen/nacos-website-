'use client';
import { useState, useEffect } from 'react';

type RsvpEvent = {
  id: string; title: string; date: string; time: string; venue: string;
  price: number; spots: number; category: string; desc: string; createdAt: number;
};

function getVoterId(): string {
  const stored = localStorage.getItem('nacos_voter_id');
  if (stored) return stored;
  const id = Math.random().toString(36).slice(2) + Date.now().toString(36);
  localStorage.setItem('nacos_voter_id', id);
  return id;
}

function loadEvents(): RsvpEvent[] {
  try { return JSON.parse(localStorage.getItem('nacos_rsvp_events') ?? '[]'); } catch { return []; }
}

function loadMyRsvps(voterId: string): Record<string, { ticketCode: string; rsvpedAt: number }> {
  try {
    const all = JSON.parse(localStorage.getItem('nacos_rsvp_tickets') ?? '{}') as Record<string, Record<string, unknown>>;
    return (all[voterId] ?? {}) as Record<string, { ticketCode: string; rsvpedAt: number }>;
  } catch { return {}; }
}

function saveRsvp(voterId: string, eventId: string, ticketCode: string) {
  try {
    const all = JSON.parse(localStorage.getItem('nacos_rsvp_tickets') ?? '{}') as Record<string, Record<string, unknown>>;
    all[voterId] = { ...(all[voterId] ?? {}), [eventId]: { ticketCode, rsvpedAt: Date.now() } };
    localStorage.setItem('nacos_rsvp_tickets', JSON.stringify(all));
  } catch { /* ignore */ }
}

function getRsvpCount(eventId: string): number {
  try {
    const all = JSON.parse(localStorage.getItem('nacos_rsvp_tickets') ?? '{}') as Record<string, Record<string, unknown>>;
    return Object.values(all).filter(v => v[eventId]).length;
  } catch { return 0; }
}

const CAT_STYLE: Record<string, string> = {
  'Annual Dinner': 'bg-yellow-50 text-yellow-700 border-yellow-200',
  'Tech Talk': 'bg-blue-50 text-blue-700 border-blue-200',
  'Workshop': 'bg-purple-50 text-purple-700 border-purple-200',
  'Sports': 'bg-green-50 text-green-700 border-green-200',
  'Social': 'bg-pink-50 text-pink-700 border-pink-200',
  'Competition': 'bg-orange-50 text-orange-700 border-orange-200',
  'Other': 'bg-gray-50 text-gray-600 border-gray-200',
};

export default function RsvpTickets() {
  const [events, setEvents] = useState<RsvpEvent[]>([]);
  const [myRsvps, setMyRsvps] = useState<Record<string, { ticketCode: string; rsvpedAt: number }>>({});
  const [voterId, setVoterId] = useState('');
  const [ticket, setTicket] = useState<{ event: RsvpEvent; code: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const id = getVoterId();
    setVoterId(id);
    const load = () => {
      setEvents(loadEvents());
      setMyRsvps(loadMyRsvps(id));
      setLoading(false);
    };
    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, []);

  function rsvp(event: RsvpEvent) {
    const code = 'NACOS-' + event.id.slice(-4).toUpperCase() + '-' + Math.random().toString(36).slice(2, 6).toUpperCase();
    saveRsvp(voterId, event.id, code);
    setMyRsvps(prev => ({ ...prev, [event.id]: { ticketCode: code, rsvpedAt: Date.now() } }));
    setTicket({ event, code });
  }

  if (loading) return (
    <div className="max-w-2xl mx-auto space-y-4 animate-pulse">
      {[1, 2].map(i => <div key={i} className="bg-white rounded-2xl border border-gray-100 h-36" />)}
    </div>
  );

  const today = new Date(); today.setHours(0, 0, 0, 0);
  const upcoming = events.filter(e => new Date(e.date + 'T12:00:00') >= today).sort((a, b) => a.date.localeCompare(b.date));
  const past = events.filter(e => new Date(e.date + 'T12:00:00') < today).sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-black text-gray-900" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>RSVP & Tickets</h2>
        <p className="text-sm text-gray-400 mt-0.5">RSVP to events and get your digital ticket</p>
      </div>

      {/* Ticket modal */}
      {ticket && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
          onClick={() => setTicket(null)}>
          <div className="bg-white rounded-3xl max-w-sm w-full shadow-2xl overflow-hidden"
            onClick={e => e.stopPropagation()}>
            <div className="bg-gray-900 px-6 py-8 text-center relative overflow-hidden">
              <div className="absolute inset-0 opacity-10">
                <div className="absolute -top-4 -right-4 w-32 h-32 rounded-full border-4 border-yellow-400" />
                <div className="absolute -bottom-4 -left-4 w-24 h-24 rounded-full border-2 border-yellow-400" />
              </div>
              <p className="text-[10px] font-bold text-yellow-400 tracking-widest uppercase mb-2"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}>NACOS Official Ticket</p>
              <p className="text-white text-lg font-black leading-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                {ticket.event.title}
              </p>
              <p className="text-gray-400 text-xs mt-2">
                {new Date(ticket.event.date + 'T12:00:00').toLocaleDateString('en-NG', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                {' · '}{ticket.event.time}
              </p>
            </div>
            <div className="px-6 py-5">
              <div className="border-t-2 border-dashed border-gray-200 -mx-6 mb-5" />
              <p className="text-xs text-gray-400 text-center mb-2">Ticket Code</p>
              <p className="text-xl font-black text-gray-900 text-center tracking-widest"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{ticket.code}</p>
              <div className="mt-4 bg-gray-50 rounded-xl p-3">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Venue</span><span className="font-semibold text-gray-700">{ticket.event.venue}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1.5">
                  <span>Price</span>
                  <span className="font-semibold text-gray-700">
                    {ticket.event.price === 0 ? 'Free' : `₦${ticket.event.price.toLocaleString()}`}
                  </span>
                </div>
              </div>
              <button onClick={() => setTicket(null)}
                className="mt-5 w-full py-3 rounded-xl bg-gray-900 text-white text-sm font-bold hover:bg-gray-800 transition"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Done</button>
            </div>
          </div>
        </div>
      )}

      {events.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-14 text-center shadow-[0_2px_4px_rgba(0,0,0,0.04)]">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}
            className="w-12 h-12 text-gray-200 mx-auto mb-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 010 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 010-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375z" />
          </svg>
          <p className="text-sm font-semibold text-gray-400" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>No events available yet</p>
          <p className="text-xs text-gray-300 mt-1">NACOS events will appear here when published by the executives</p>
        </div>
      ) : (
        <div className="space-y-6">
          {upcoming.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs font-bold text-gray-400 tracking-widest uppercase"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Upcoming · {upcoming.length}</p>
              {upcoming.map(ev => {
                const myTicket = myRsvps[ev.id];
                const count = getRsvpCount(ev.id);
                const isFull = ev.spots > 0 && count >= ev.spots;
                const catStyle = CAT_STYLE[ev.category] ?? CAT_STYLE.Other;
                const d = new Date(ev.date + 'T12:00:00');
                return (
                  <div key={ev.id} className="bg-white rounded-2xl border border-gray-100 p-5
                    shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
                    <div className="flex items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className={`text-[10px] font-bold border px-2.5 py-0.5 rounded-full ${catStyle}`}
                            style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{ev.category}</span>
                          {ev.price === 0
                            ? <span className="text-[10px] font-bold text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">Free</span>
                            : <span className="text-[10px] font-bold text-gray-600 bg-gray-100 border border-gray-200 px-2 py-0.5 rounded-full">₦{ev.price.toLocaleString()}</span>
                          }
                          {myTicket && <span className="text-[10px] font-bold text-green-700 bg-green-100 border border-green-200 px-2 py-0.5 rounded-full">RSVP'd ✓</span>}
                        </div>
                        <p className="text-sm font-black text-gray-900" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{ev.title}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {d.toLocaleDateString('en-NG', { weekday: 'short', day: 'numeric', month: 'long' })} · {ev.time} · {ev.venue}
                        </p>
                        {ev.desc && <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">{ev.desc}</p>}
                        {ev.spots > 0 && !myTicket && (
                          <p className="text-xs text-gray-400 mt-1.5">{Math.max(ev.spots - count, 0)} spot{Math.max(ev.spots - count, 0) !== 1 ? 's' : ''} left</p>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-50">
                      {myTicket ? (
                        <button onClick={() => setTicket({ event: ev, code: myTicket.ticketCode })}
                          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-900 text-white text-xs font-bold hover:bg-gray-800 transition"
                          style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                            <path fillRule="evenodd" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 010 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 010-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375z" clipRule="evenodd" />
                          </svg>
                          View My Ticket · {myTicket.ticketCode}
                        </button>
                      ) : (
                        <button onClick={() => rsvp(ev)} disabled={isFull}
                          className="px-5 py-2 rounded-xl text-sm font-bold text-white bg-gray-900 hover:bg-gray-800
                            disabled:opacity-40 disabled:cursor-not-allowed transition"
                          style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                          {isFull ? 'Fully Booked' : 'RSVP & Get Ticket'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {past.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs font-bold text-gray-400 tracking-widest uppercase"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Past Events · {past.length}</p>
              {past.map(ev => (
                <div key={ev.id} className="bg-white rounded-2xl border border-gray-100 p-4 opacity-60
                  shadow-[0_2px_4px_rgba(0,0,0,0.04)]">
                  <p className="text-sm font-semibold text-gray-700">{ev.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(ev.date + 'T12:00:00').toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' })} · {ev.venue}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
