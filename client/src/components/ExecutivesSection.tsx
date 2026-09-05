import Image from 'next/image';

const TOP_EXECS = [
  { role: 'President', name: 'Eniola Somoye', imageUrl: '' },
  { role: 'Vice President', name: 'Ayomikun Akinade', imageUrl: '/executives/Ayomikun.jpeg' },
];

const MAIN_EXECS = [
  { role: 'General Secretary', name: 'Toluwalase Oduyemi', imageUrl: '/executives/toluwalase.jpg' },
  { role: 'Academic Director', name: 'Afonrinwo Fifunmi', imageUrl: '/executives/fifunmi.jpeg' },
  { role: 'Financial Secretary', name: 'Itansanogooluwa Agunloye', imageUrl: '' },
  { role: 'Welfare Director', name: 'Victoria Asabor', imageUrl: '' },
  { role: 'PRO 1', name: 'Opemipo Oladiti', imageUrl: '' },
  { role: 'Chief Whip', name: '', imageUrl: '' },
  { role: 'Sports Director (Male)', name: 'Oluwafemi Adesope', imageUrl: '' },
  { role: 'Sports Director (Female)', name: 'Deborah Egenuka', imageUrl: '/executives/deborah.jpeg' },
  { role: 'Social Director (Male)', name: 'Chijioke David', imageUrl: '' },
  { role: 'Social Director (Female)', name: 'Oreoluwa Owobamirin', imageUrl: '/executives/ore.jpeg' },
  { role: 'Software Director', name: 'Emmanuel Odofin', imageUrl: '/executives/Emmanuel.jpeg' },
  { role: 'Hardware Director', name: 'Zoe Ayilara', imageUrl: '' },
  { role: 'CS Commissioner', name: 'Tolulope Adegoke', imageUrl: '/executives/tolu.png' },
  { role: 'SE Commissioner', name: 'Favour Owoyalumo', imageUrl: '' },
  { role: 'CYB Commissioner', name: 'Zzim Madaki', imageUrl: '/executives/zzim.jpg' },
  { role: 'IFT Commissioner', name: 'Obaloluwa Waheed', imageUrl: '/executives/oba.png' },
  { role: 'Asst. General Secretary', name: 'Temiloluwa Daramola', imageUrl: '/executives/temi.jpeg' },
  { role: 'Asst. Welfare Director', name: 'Benedicta Boardman', imageUrl: '/executives/benedicta.jpeg' },
  { role: 'Asst. Academic Director', name: 'Bright Lawal', imageUrl: '' },
  { role: 'Asst. Software Director', name: 'Boluwatito Akinnuoye', imageUrl: '/executives/tito.jpeg' },
];

const BOTTOM_EXECS = [
  { role: 'Asst. Hardware Director', name: '', imageUrl: '' },
  { role: 'PRO 2', name: '', imageUrl: '' },
];

function ExecCard({
  role,
  name,
  imageUrl,
  large = false,
}: {
  role: string;
  name?: string;
  imageUrl?: string;
  large?: boolean;
}) {
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
         className={`rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center flex-shrink-0 overflow-hidden
           ${large ? 'w-24 h-24 sm:w-32 sm:h-32 lg:w-40 lg:h-40' : 'w-24 h-24'}`}
        >
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={name || role}
              width={large ? 160 : 96}
              height={large ? 160 : 96}
              className="w-full h-full object-cover"
            />
          ) : (
            /* Placeholder person silhouette */
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className={`text-gray-300 ${large ? 'w-20 h-20' : 'w-12 h-12'}`}
            >
              <circle cx="12" cy="8" r="4" fill="currentColor" />
              <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" fill="currentColor" />
            </svg>
          )}
        </div>

        {/* Role title */}
        <p
          className={`font-black text-gray-900 text-center leading-snug
            ${large ? 'text-lg' : 'text-sm'}`}
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          {role}
        </p>

        {/* Name */}
        <div className="w-full mt-auto">
          <div className="h-px bg-gray-100 w-4/5 mx-auto rounded-full mb-1.5" />
          <p
            className={`text-xs text-center tracking-wide ${name ? 'text-gray-500' : 'text-gray-300'}`}
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            {name || 'Full name'}
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
        <div className="flex flex-wrap justify-center gap-4 sm:gap-6 lg:gap-10 mb-10 px-2">
          {TOP_EXECS.map((exec) => (
            <div key={exec.role} className="w-36 sm:w-48 lg:w-60">
              <ExecCard role={exec.role} name={exec.name} imageUrl={exec.imageUrl} large />
            </div>
          ))}
        </div>

        {/* Main grid — 4 cols x 5 rows */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 items-stretch mb-8">
          {MAIN_EXECS.map((exec) => (
            <ExecCard key={exec.role} role={exec.role} name={exec.name} imageUrl={exec.imageUrl} />
          ))}
        </div>

        {/* Last row — 2 cards centered */}
        <div className="flex justify-center gap-8">
          {BOTTOM_EXECS.map((exec) => (
            <div key={exec.role} className="w-[calc(25%-1rem)]">
              <ExecCard role={exec.role} name={exec.name} imageUrl={exec.imageUrl} />
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}