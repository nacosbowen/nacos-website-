'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

type NacosEvent = {
  id: string; title: string; description: string | null; date: string;
  location: string | null; imageUrl: string | null;
  price: number; spots: number; category: string;
  createdAt: string; _count: { rsvps: number };
};

type MyRsvp = { ticketCode: string; rsvpAt: string };

const CAT_STYLE: Record<string, string> = {
  'Annual Dinner': 'bg-yellow-50 text-yellow-700 border-yellow-200',
  'Tech Talk': 'bg-blue-50 text-blue-700 border-blue-200',
  'Workshop': 'bg-purple-50 text-purple-700 border-purple-200',
  'Sports': 'bg-green-50 text-green-700 border-green-200',
  'Social': 'bg-pink-50 text-pink-700 border-pink-200',
  'Competition': 'bg-orange-50 text-orange-700 border-orange-200',
  'Other': 'bg-gray-50 text-gray-600 border-gray-200',
};

const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5001';

export default function RsvpTickets() {
  const { isLoading: authLoading } = useAuth();
  const [events, setEvents] = useState<NacosEvent[]>([]);
  const [myRsvps, setMyRsvps] = useState<Record<string, MyRsvp>>({});
  const [ticket, setTicket] = useState<{ event: NacosEvent; code: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [rsvping, setRsvping] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    api.get('/events').then(async (r) => {
      const evs: NacosEvent[] = r.data;
      setEvents(evs);
      // check RSVP status for each event
      const results = await Promise.all(
        evs.map((e) => api.get(`/events/${e.id}/rsvp/me`).then(res => ({ id: e.id, data: res.data })).catch(() => null))
      );
      const map: Record<string, MyRsvp> = {};
      results.forEach((r) => {
        if (r && r.data.rsvped && r.data.rsvp) {
          map[r.id] = { ticketCode: r.data.rsvp.ticketCode, rsvpAt: r.data.rsvp.rsvpAt };
        }
      });
      setMyRsvps(map);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [authLoading]);

  async function rsvp(event: NacosEvent) {
    setRsvping(event.id);
    try {
      const { data } = await api.post(`/events/${event.id}/rsvp`);
      setMyRsvps(prev => ({ ...prev, [event.id]: { ticketCode: data.ticketCode, rsvpAt: data.rsvpAt } }));
      setEvents(prev => prev.map(e => e.id === event.id ? { ...e, _count: { rsvps: e._count.rsvps + 1 } } : e));
      setTicket({ event, code: data.ticketCode });
    } catch (err: any) {
      // already rsvp'd, event full, etc — silently ignore or could show a toast
    } finally {
      setRsvping(null);
    }
  }

  if (loading) return (
    <div className="max-w-2xl mx-auto space-y-4 animate-pulse">
      {[1, 2].map(i => <div key={i} className="bg-white rounded-2xl border border-gray-100 h-36" />)}
    </div>
  );

  const now = new Date();
  const upcoming = events.filter(e => new Date(e.date) >= now).sort((a, b) => a.date.localeCompare(b.date));
  const past = events.filter(e => new Date(e.date) < now).sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-black text-gray-900" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>RSVP & Tickets</h2>
        <p className="text-sm text-gray-400 mt-0.5">RSVP to events and get your digital ticket</p>
      </div>

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
                {new Date(ticket.event.date).toLocaleDateString('en-NG', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                {' · '}{new Date(ticket.event.date).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
            <div className="px-6 py-5">
              <div className="border-t-2 border-dashed border-gray-200 -mx-6 mb-5" />
              <p className="text-xs text-gray-400 text-center mb-2">Ticket Code</p>
              <p className="text-xl font-black text-gray-900 text-center tracking-widest"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{ticket.code}</p>
              <div className="mt-4 bg-gray-50 rounded-xl p-3">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Venue</span><span className="font-semibold text-gray-700">{ticket.event.location || 'TBA'}</span>
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
                const isFull = ev.spots > 0 && ev._count.rsvps >= ev.spots;
                const catStyle = CAT_STYLE[ev.category] ?? CAT_STYLE.Other;
                const d = new Date(ev.date);
                return (
                  <div key={ev.id} className="bg-white rounded-2xl border border-gray-100 p-5
                    shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
                    {ev.imageUrl && (
                      <img src={`${baseUrl}${ev.imageUrl}`} alt={ev.title}
                        className="w-full h-32 object-cover rounded-xl mb-4" />
                    )}
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
                          {d.toLocaleDateString('en-NG', { weekday: 'short', day: 'numeric', month: 'long' })} · {d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })} · {ev.location || 'TBA'}
                        </p>
                        {ev.description && <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">{ev.description}</p>}
                        {ev.spots > 0 && !myTicket && (
                          <p className="text-xs text-gray-400 mt-1.5">{Math.max(ev.spots - ev._count.rsvps, 0)} spot{Math.max(ev.spots - ev._count.rsvps, 0) !== 1 ? 's' : ''} left</p>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-50">
                      {myTicket ? (
                        <button onClick={() => setTicket({ event: ev, code: myTicket.ticketCode })}
                          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-900 text-white text-xs font-bold hover:bg-gray-800 transition"
                          style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                          View My Ticket · {myTicket.ticketCode.slice(0, 8).toUpperCase()}
                        </button>
                      ) : (
                        <button onClick={() => rsvp(ev)} disabled={isFull || rsvping === ev.id}
                          className="px-5 py-2 rounded-xl text-sm font-bold text-white bg-gray-900 hover:bg-gray-800
                            disabled:opacity-40 disabled:cursor-not-allowed transition"
                          style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                          {rsvping === ev.id ? 'RSVPing...' : isFull ? 'Fully Booked' : 'RSVP & Get Ticket'}
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
                    {new Date(ev.date).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' })} · {ev.location || 'TBA'}
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