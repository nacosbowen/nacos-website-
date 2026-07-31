const TOP_EXECS = [
  { role: 'President' },
  { role: 'Vice President' },
];

const MAIN_EXECS = [
  { role: 'General Secretary' },
  { role: 'Academic Director' },
  { role: 'Financial Secretary' },
  { role: 'Welfare Director' },
  { role: 'PRO 1' },
  { role: 'Chief Whip' },
  { role: 'Sports Director (Male)' },
  { role: 'Sports Director (Female)' },
  { role: 'Social Director (Male)' },
  { role: 'Social Director (Female)' },
  { role: 'Software Director' },
  { role: 'Hardware Director' },
  { role: 'CS Commissioner' },
  { role: 'SE Commissioner' },
  { role: 'CYB Commissioner' },
  { role: 'IFT Commissioner' },
  { role: 'Asst. General Secretary' },
  { role: 'Asst. Welfare Director' },
  { role: 'Asst. Academic Director' },
  { role: 'Asst. Software Director' },
];

const BOTTOM_EXECS = [
  { role: 'Asst. Hardware Director' },
  { role: 'PRO 2' },
];

function ExecCard({ role, large = false }: { role: string; large?: boolean }) {
  return (
    <div className="group relative cursor-default h-full">
      {/* Depth layer 2 */}
      <div className="absolute top-3 left-3 right-[-6px] bottom-[-6px] bg-gray-300 rounded-2xl transition-all duration-300 group-hover:top-4 group-hover:left-4" />
      {/* Depth layer 1 */}
      <div className="absolute top-1.5 left-1.5 right-[-3px] bottom-[-3px] bg-gray-200 rounded-2xl transition-all duration-300 group-hover:top-2.5 group-hover:left-2.5" />

      {/* Card */}
      <div
        className={`relative bg-white rounded-2xl border border-gray-100 h-full
          shadow-[0_4px_6px_rgba(0,0,0,0.04),0_10px_20px_rgba(0,0,0,0.08),0_20px_40px_rgba(0,0,0,0.06)]
          transition-all duration-300
          group-hover:-translate-y-1.5 group-hover:shadow-[0_8px_16px_rgba(0,0,0,0.06),0_24px_48px_rgba(0,0,0,0.12),0_40px_80px_rgba(0,0,0,0.08)]
          flex flex-col items-center gap-4
          ${large ? 'p-8' : 'p-5'}`}
      >
        {/* Avatar circle */}
        <div
          className={`rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center flex-shrink-0
            ${large ? 'w-28 h-28' : 'w-16 h-16'}`}
        >
          {/* Placeholder person silhouette */}
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className={`text-gray-300 ${large ? 'w-14 h-14' : 'w-8 h-8'}`}
          >
            <circle cx="12" cy="8" r="4" fill="currentColor" />
            <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" fill="currentColor" />
          </svg>
        </div>

        {/* Role title */}
        <p
          className={`font-black text-gray-900 text-center leading-snug
            ${large ? 'text-lg' : 'text-sm'}`}
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          {role}
        </p>

        {/* Name placeholder */}
        <div className="w-full mt-auto">
          <div className="h-px bg-gray-100 w-4/5 mx-auto rounded-full mb-1.5" />
          <p
            className="text-xs text-center text-gray-300 tracking-wide"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Full name
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ExecutivesSection() {
  return (
    <section id="executives" className="py-28 px-4 relative z-10">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="text-center mb-16">
          <span
            className="inline-block text-sm font-semibold tracking-widest uppercase mb-4 text-gray-500"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Leadership
          </span>
          <h2 className="text-4xl font-black text-gray-900">Our Executives</h2>
          <p className="text-gray-400 mt-3 max-w-md mx-auto text-sm">
            The faces behind NACOS Bowen — serving the student body
          </p>
        </div>

        {/* President + Vice President */}
        <div className="flex justify-center gap-10 mb-10">
          {TOP_EXECS.map((exec) => (
            <div key={exec.role} className="w-52">
              <ExecCard role={exec.role} large />
            </div>
          ))}
        </div>

        {/* Main grid — 4 cols × 5 rows */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 items-stretch mb-8">
          {MAIN_EXECS.map((exec) => (
            <ExecCard key={exec.role} role={exec.role} />
          ))}
        </div>

        {/* Last row — 2 cards centered */}
        <div className="flex justify-center gap-8">
          {BOTTOM_EXECS.map((exec) => (
            <div key={exec.role} className="w-[calc(25%-1rem)]">
              <ExecCard role={exec.role} />
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
