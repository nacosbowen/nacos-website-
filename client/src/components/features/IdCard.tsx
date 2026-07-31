'use client';
import { useAuth } from '@/context/AuthContext';

export default function IdCard() {
  const { user } = useAuth();

  const year = new Date().getFullYear();
  const initials = user?.fullName
    ? user.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : '??';

  return (
    <div className="max-w-md mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-black text-gray-900" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>ID Card</h2>
        <p className="text-sm text-gray-400 mt-0.5">Your NACOS digital student ID card</p>
      </div>

      {/* Card */}
      <div className="relative">
        <div className="absolute top-4 left-4 right-[-8px] bottom-[-8px] bg-gray-300 rounded-3xl" />
        <div className="absolute top-2 left-2 right-[-4px] bottom-[-4px] bg-gray-200 rounded-3xl" />
        <div className="relative bg-gray-900 rounded-3xl overflow-hidden"
          style={{ minHeight: 240 }}>

          {/* Dot pattern bg */}
          <div className="absolute inset-0 opacity-[0.06]"
            style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

          {/* Gold top bar */}
          <div className="h-1.5 w-full" style={{ background: 'linear-gradient(90deg, #FFD700, #FFA500, #FFD700)' }} />

          <div className="px-6 py-5 relative">
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="text-[10px] font-black text-white/40 tracking-widest uppercase"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  NACOS BOWEN
                </p>
                <p className="text-[10px] text-white/30 mt-0.5">Bowen University, Iwo</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-semibold text-white/30"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  {year}/{year + 1}
                </p>
                <p className="text-[10px] text-white/30">Academic Session</p>
              </div>
            </div>

            {/* Avatar + info */}
            <div className="flex items-start gap-4">
              <div className="w-20 h-24 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center flex-shrink-0">
                {user?.profilePictureUrl ? (
                  <img src={user.profilePictureUrl} alt="Profile" className="w-full h-full object-cover rounded-2xl" />
                ) : (
                  <span className="text-3xl font-black text-white/60" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    {initials}
                  </span>
                )}
              </div>

              <div className="flex-1 min-w-0 pt-1">
                <p className="text-lg font-black text-white leading-tight"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  {user?.fullName ?? 'Loading...'}
                </p>
                <p className="text-xs text-white/50 mt-1">
                  {user?.matricNumber ?? '—/—/—/—'}
                </p>
                <div className="mt-3 space-y-1">
                  {[
                    { label: 'Department', value: user?.department?.name ?? 'Computer Science' },
                    { label: 'Level', value: `${user?.level ?? '—'}L` },
                  ].map(r => (
                    <div key={r.label} className="flex items-center gap-2">
                      <p className="text-[10px] text-white/30 w-20 flex-shrink-0">{r.label}</p>
                      <p className="text-[11px] font-bold text-white/70" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{r.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom bar */}
            <div className="mt-5 pt-4 border-t border-white/[0.07] flex items-end justify-between">
              <div>
                <p className="text-[10px] text-white/30">Member Since</p>
                <p className="text-xs font-bold text-white/60" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{year}</p>
              </div>
              {/* Barcode placeholder */}
              <div className="flex gap-px">
                {Array.from({ length: 24 }, (_, i) => (
                  <div key={i} className="w-0.5 rounded-sm bg-white/30" style={{ height: i % 3 === 0 ? 28 : i % 2 === 0 ? 20 : 16 }} />
                ))}
              </div>
            </div>
          </div>

          {/* Bottom accent */}
          <div className="h-1" style={{ background: 'linear-gradient(90deg, #FFD700, #FFA500, #FFD700)' }} />
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-3">
        <button className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gray-900 text-white text-sm font-bold
          hover:bg-gray-800 transition shadow-[0_2px_8px_rgba(0,0,0,0.15)]"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
          Download PDF
        </button>
        <button className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white border border-gray-200 text-gray-700 text-sm font-bold
          hover:border-gray-300 transition"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
          </svg>
          Share Card
        </button>
      </div>

      <p className="text-xs text-center text-gray-400">
        This is a digital representation of your NACOS membership. Present at all NACOS events.
      </p>
    </div>
  );
}
