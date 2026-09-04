'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

type NacosEvent = {
  id: string;
  title: string;
  description: string | null;
  date: string;
  location: string | null;
  imageUrl: string | null;  // ← also add this line to the type
  createdAt: string;
  _count: { rsvps: number };
};

const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5001';

export default function CalendarEvents() {
  const { isLoading: authLoading } = useAuth();
  const [events, setEvents] = useState<NacosEvent[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [rsvping, setRsvping] = useState<string | null>(null);
  const [myRsvps, setMyRsvps] = useState<Set<string>>(new Set());

 useEffect(() => {
    if (authLoading) return;
    api.get('/events').then(r => {
      setEvents(r.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [authLoading]);

  async function handleRsvp(eventId: string) {
    setRsvping(eventId);
    try {
      if (myRsvps.has(eventId)) {
        await api.delete(`/events/${eventId}/rsvp`);
        setMyRsvps(prev => { const s = new Set(prev); s.delete(eventId); return s; });
        setEvents(prev => prev.map(e => e.id === eventId
          ? { ...e, _count: { rsvps: e._count.rsvps - 1 } } : e));
      } else {
        await api.post(`/events/${eventId}/rsvp`);
        setMyRsvps(prev => new Set([...prev, eventId]));
        setEvents(prev => prev.map(e => e.id === eventId
          ? { ...e, _count: { rsvps: e._count.rsvps + 1 } } : e));
      }
    } catch { /* already rsvp'd or other error */ }
    setRsvping(null);
  }

  function formatTime(dateStr: string) {
    const d = new Date(dateStr);
    return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  }

  const now = new Date();
  const upcoming = events.filter(e => new Date(e.date) >= now);
  const past = events.filter(e => new Date(e.date) < now);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto space-y-3 animate-pulse">
        {[1, 2, 3].map(i => <div key={i} className="bg-white rounded-2xl border border-gray-100 h-24" />)}
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-black text-gray-900" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          NACOS Calendar Events
        </h2>
        <p className="text-sm text-gray-400 mt-0.5">
          All upcoming NACOS events, workshops, and competitions
        </p>
      </div>

      {events.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-14 text-center shadow-[0_2px_4px_rgba(0,0,0,0.04)]">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}
            className="w-12 h-12 text-gray-200 mx-auto mb-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
          </svg>
          <p className="text-sm font-semibold text-gray-400" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            No events scheduled yet
          </p>
          <p className="text-xs text-gray-300 mt-1">Events will appear here when posted by the executives</p>
        </div>
      ) : (
        <>
          {upcoming.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs font-bold text-gray-400 tracking-widest uppercase"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                Upcoming · {upcoming.length}
              </p>
              {upcoming.map(event => (
                <EventCard key={event.id} event={event} formatTime={formatTime}
                  expanded={expanded} setExpanded={setExpanded}
                  rsvping={rsvping} hasRsvp={myRsvps.has(event.id)} onRsvp={handleRsvp} />
              ))}
            </div>
          )}

          {past.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs font-bold text-gray-400 tracking-widest uppercase"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                Past events · {past.length}
              </p>
              {past.map(event => (
                <EventCard key={event.id} event={event} formatTime={formatTime}
                  expanded={expanded} setExpanded={setExpanded}
                  rsvping={rsvping} hasRsvp={myRsvps.has(event.id)} onRsvp={handleRsvp} isPast />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function EventCard({ event, formatTime, expanded, setExpanded, rsvping, hasRsvp, onRsvp, isPast = false }: {
  event: NacosEvent;
  formatTime: (d: string) => string;
  expanded: string | null;
  setExpanded: (id: string | null) => void;
  rsvping: string | null;
  hasRsvp: boolean;
  onRsvp: (id: string) => void;
  isPast?: boolean;
}) {
   const isExpanded = expanded === event.id;
  return (
    <div className={`bg-white rounded-2xl border p-5 shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition-all
      ${isPast ? 'border-gray-100 opacity-70' : 'border-gray-200'}`}>
      {event.imageUrl && (
        <img src={`${baseUrl}${event.imageUrl}`} alt={event.title}
          className="w-full h-32 object-cover rounded-xl mb-4" />
      )}
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-12 text-center">
          <p className="text-xl font-black text-gray-900" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            {new Date(event.date).getDate()}
          </p>
          <p className="text-xs font-semibold text-gray-400 uppercase">
            {new Date(event.date).toLocaleDateString('en-GB', { month: 'short' })}
          </p>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-black text-gray-900 text-sm" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            {event.title}
          </p>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
            <span className="text-xs text-gray-400">{formatTime(event.date)}</span>
            {event.location && (
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <svg viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3">
                  <path fillRule="evenodd" d="M8 1.5A4.5 4.5 0 003.5 6c0 3.15 4.5 8.5 4.5 8.5S12.5 9.15 12.5 6A4.5 4.5 0 008 1.5zm0 6.25a1.75 1.75 0 110-3.5 1.75 1.75 0 010 3.5z" clipRule="evenodd" />
                </svg>
                {event.location}
              </span>
            )}
            <span className="text-xs text-gray-400">{event._count.rsvps} attending</span>
          </div>

          {event.description && (
            <>
              <button onClick={() => setExpanded(isExpanded ? null : event.id)}
                className="text-xs text-gray-400 hover:text-gray-600 mt-1.5 transition"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                {isExpanded ? 'Hide details ↑' : 'See details ↓'}
              </button>
              {isExpanded && (
                <p className="text-xs text-gray-500 mt-2 leading-relaxed">{event.description}</p>
              )}
            </>
          )}
        </div>

        {!isPast && (
          <button
            onClick={() => onRsvp(event.id)}
            disabled={rsvping === event.id}
            className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all
              ${hasRsvp
                ? 'bg-gray-900 text-white border-gray-900'
                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-900 hover:text-gray-900'
              } disabled:opacity-50`}
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            {rsvping === event.id ? '...' : hasRsvp ? 'Going ✓' : 'RSVP'}
          </button>
        )}
      </div>
    </div>
  );
}
