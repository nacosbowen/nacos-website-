import Image from 'next/image';

const COMMUNITIES = [
  { name: 'She Code Africa', imageUrl: '/communities/shecodeafrica.png' },
  { name: 'GDG Developer Groups', imageUrl: '/communities/gdg.png' },
  { name: 'Bowen Tech Hub', imageUrl: '/communities/bth.png' },
  { name: 'BTW Team', imageUrl: '/communities/btw.jpeg' },
  { name: 'Electoral Community', imageUrl: '/communities/election.png' },
];

// Duplicate for seamless loop
const TRACK = [...COMMUNITIES, ...COMMUNITIES, ...COMMUNITIES];

export default function CommunitiesSection() {
  return (
    <section id="communities" className="py-28 relative z-10 overflow-hidden">

      {/* Header */}
      <div className="text-center mb-16 px-4">
        <span
          className="inline-block text-sm font-semibold tracking-widest uppercase mb-4 text-gray-500"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          Ecosystem
        </span>
        <h2 className="text-4xl font-black text-gray-900">NACOS Communities</h2>
        <p className="text-gray-400 mt-3 max-w-md mx-auto text-sm">
          Student-led groups and partnerships within our tech ecosystem
        </p>
      </div>

      {/* Marquee track */}
      <div className="relative">
        {/* Left fade */}
        <div className="absolute left-0 top-0 bottom-0 w-32 z-10 pointer-events-none"
          style={{ background: 'linear-gradient(to right, white, transparent)' }} />
        {/* Right fade */}
        <div className="absolute right-0 top-0 bottom-0 w-32 z-10 pointer-events-none"
          style={{ background: 'linear-gradient(to left, white, transparent)' }} />

        <div className="flex gap-8 marquee-track" style={{ width: 'max-content' }}>
          {TRACK.map((community, i) => (
            <div
              key={i}
              className="group flex-shrink-0 w-56 cursor-default"
            >
              {/* Image placeholder */}
              <div className="relative w-full h-40 rounded-2xl overflow-hidden border border-gray-100
                bg-gradient-to-br from-gray-50 to-gray-100
                shadow-[0_4px_6px_rgba(0,0,0,0.04),0_10px_20px_rgba(0,0,0,0.07)]
                transition-all duration-300
                group-hover:shadow-[0_8px_24px_rgba(0,0,0,0.10),0_20px_40px_rgba(0,0,0,0.08)]
                group-hover:-translate-y-1
                flex items-center justify-center"
              >
                {/* Placeholder icon */}
                {community.imageUrl ? (
                <Image src={community.imageUrl} alt={community.name} fill className="object-cover" />
              ) : (
                <svg viewBox="0 0 48 48" fill="none" className="w-14 h-14 text-gray-200">
                  <rect x="4" y="10" width="40" height="28" rx="4" fill="currentColor" />
                  <circle cx="18" cy="21" r="5" fill="white" opacity="0.8" />
                  <path d="M4 32l10-8 8 6 8-10 14 14" stroke="white" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" opacity="0.8" />
                </svg>
              )}
                {/* Subtle shine overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-transparent pointer-events-none" />
              </div>

              {/* Community name */}
              <p
                className="mt-3 text-sm font-bold text-gray-700 text-center leading-snug group-hover:text-gray-900 transition-colors duration-200"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                {community.name}
              </p>
            </div>
          ))}
        </div>
      </div>

    </section>
  );
}
