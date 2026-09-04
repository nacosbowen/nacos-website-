'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';

type DinnerInfo = {
  title: string; date: string | null; time: string; venue: string; theme: string;
  dressCode: string; ticketPrice: string; highlights: string; imageUrl: string | null;
};

export default function DinnerTheme() {
  const { isLoading: authLoading } = useAuth();
  const [info, setInfo] = useState<DinnerInfo | null>(null);
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, mins: 0, secs: 0, past: false });

  useEffect(() => {
    if (authLoading) return;
    api.get('/dinner').then(({ data }) => setInfo(data)).catch(() => {});
  }, [authLoading]);

  useEffect(() => {
    if (!info?.date) return;
    const target = new Date(info.date);
    const tick = () => {
      const diff = target.getTime() - Date.now();
      if (diff <= 0) { setCountdown({ days: 0, hours: 0, mins: 0, secs: 0, past: true }); return; }
      setCountdown({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        mins: Math.floor((diff % 3600000) / 60000),
        secs: Math.floor((diff % 60000) / 1000),
        past: false,
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [info?.date]);

  if (!info) return null;

  const highlights = info.highlights.split('\n').filter(Boolean);
  const priceNum = parseFloat(info.ticketPrice) || 0;

  return (
    <div className="max-w-xl mx-auto space-y-6">
      {/* Hero */}
      <div className="relative rounded-3xl overflow-hidden bg-gray-900 p-8 text-center">
        {info.imageUrl && (
          <img src={info.imageUrl} alt="Dinner" className="absolute inset-0 w-full h-full object-cover opacity-30" />
        )}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-4 right-8 w-40 h-40 rounded-full border-4 border-yellow-400" />
          <div className="absolute bottom-4 left-8 w-24 h-24 rounded-full border-2 border-yellow-400" />
          <div className="absolute top-1/2 left-1/4 w-16 h-16 rounded-full border border-yellow-400" />
        </div>
        <div className="relative">
          <p className="text-[10px] font-bold text-yellow-400 tracking-widest uppercase mb-3"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}>NACOS Bowen University</p>
          <h2 className="text-3xl font-black text-white mb-2 leading-tight"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{info.title}</h2>
          <p className="text-gray-400 text-sm">{info.theme}</p>
          {info.date && (
            <p className="text-yellow-400 font-semibold text-sm mt-2">
              {new Date(info.date).toLocaleDateString('en-NG', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              {' · '}{info.time}
            </p>
          )}
        </div>
      </div>

      {/* Countdown */}
      {info.date && !countdown.past && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
          <p className="text-xs font-bold text-gray-400 tracking-widest uppercase text-center mb-4"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Countdown</p>
          <div className="grid grid-cols-4 gap-3">
            {[['Days', countdown.days], ['Hours', countdown.hours], ['Mins', countdown.mins], ['Secs', countdown.secs]].map(([label, val]) => (
              <div key={label} className="text-center">
                <p className="text-3xl font-black text-gray-900 tabular-nums"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{String(val).padStart(2, '0')}</p>
                <p className="text-[10px] font-semibold text-gray-400 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

    
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-2xl border border-gray-100 px-4 py-4 shadow-[0_2px_4px_rgba(0,0,0,0.04)]">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Venue</p>
          <p className="text-sm font-semibold text-gray-800">{info.venue}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 px-4 py-4 shadow-[0_2px_4px_rgba(0,0,0,0.04)]">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Ticket</p>
          <p className="text-sm font-semibold text-gray-800">
            {priceNum === 0 ? 'Free Entry' : `₦${priceNum.toLocaleString()}`}
          </p>
        </div>
        <div className="col-span-2 bg-gray-900 rounded-2xl px-4 py-4 shadow-[0_2px_4px_rgba(0,0,0,0.04)]">
          <p className="text-[10px] font-bold text-yellow-400 uppercase tracking-wide mb-1">Dress Code</p>
          <p className="text-sm text-gray-200">{info.dressCode}</p>
        </div>
      </div>

      {/* Highlights */}
      {highlights.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-[0_2px_4px_rgba(0,0,0,0.04)]">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-4"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Evening Highlights</p>
          <div className="grid grid-cols-2 gap-3">
            {highlights.map((h, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <div className="w-7 h-7 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
                </div>
                <span className="text-sm text-gray-700 font-medium">{h}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {!info.date && (
        <div className="bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 text-center">
          <p className="text-sm text-gray-500" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Date and details to be announced by the NACOS executives
          </p>
        </div>
      )}
    </div>
  );
}
