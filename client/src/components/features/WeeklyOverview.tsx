'use client';

const grotesk = { fontFamily: "'Space Grotesk', sans-serif" };
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

export type OverviewEntry = {
  id: string;
  name: string;
  code: string;
  day: string;
  start: string;
  end: string;
  venue: string;
};

export default function WeeklyOverview({ classes }: { classes: OverviewEntry[] }) {
  const d = new Date().getDay();
  const today = d >= 1 && d <= 5 ? DAYS[d - 1] : '';

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-[0_2px_4px_rgba(0,0,0,0.04)]">
      <div className="px-5 py-3 border-b border-gray-100">
        <p className="text-xs font-bold text-gray-400 tracking-widest uppercase" style={grotesk}>
          Weekly Summary
        </p>
      </div>

      <div className="divide-y divide-gray-100">
        {DAYS.map((day) => {
          const list = classes
            .filter((c) => c.day === day)
            .sort((a, b) => a.start.localeCompare(b.start));
          const isToday = day === today;

          return (
            <div key={day} className={`px-4 sm:px-5 py-4 flex gap-4 ${isToday ? 'bg-gray-50' : ''}`}>
              <div className="w-16 flex-shrink-0">
                <p className="text-xs font-black text-gray-900 tracking-wide" style={grotesk}>
                  {day.slice(0, 3).toUpperCase()}
                </p>
                {isToday && (
                  <span
                    className="inline-block mt-1 text-[9px] font-bold text-white bg-gray-900 px-1.5 py-0.5 rounded-full"
                    style={grotesk}>
                    TODAY
                  </span>
                )}
                {!isToday && list.length > 0 && (
                  <p className="text-[10px] text-gray-400 mt-1">
                    {list.length} {list.length === 1 ? 'class' : 'classes'}
                  </p>
                )}
              </div>

              <div className="flex-1 min-w-0 space-y-2">
                {list.length === 0 ? (
                  <p className="text-xs text-gray-300 pt-0.5">Free day</p>
                ) : (
                  list.map((c) => (
                    <div
                      key={c.id}
                      className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white px-3 py-2.5">
                      <div className="w-1 self-stretch rounded-full bg-gray-900 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-black text-gray-900 truncate" style={grotesk}>
                          {c.code}
                          <span className="font-semibold text-gray-500"> · {c.name}</span>
                        </p>
                        {c.venue && <p className="text-xs text-gray-400 mt-0.5 truncate">{c.venue}</p>}
                      </div>
                      <span
                        className="text-xs font-bold text-gray-700 bg-gray-100 px-2.5 py-1 rounded-full whitespace-nowrap flex-shrink-0"
                        style={grotesk}>
                        {c.start} – {c.end}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}