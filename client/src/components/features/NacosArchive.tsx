'use client';
import { useState, useEffect } from 'react';

type ArchiveItem = { id: string; title: string; type: string; year: string; category: string; desc: string; addedAt: number };

const TYPE_ICONS: Record<string, string> = {
  Gallery: '🖼', Document: '📄', Video: '🎬', Report: '📊', Newsletter: '📰', Other: '📁',
};

const CAT_STYLE: Record<string, string> = {
  Events: 'bg-pink-50 text-pink-700 border-pink-200',
  Academic: 'bg-blue-50 text-blue-700 border-blue-200',
  Sports: 'bg-green-50 text-green-700 border-green-200',
  Tech: 'bg-purple-50 text-purple-700 border-purple-200',
  Cultural: 'bg-orange-50 text-orange-700 border-orange-200',
  Other: 'bg-gray-50 text-gray-600 border-gray-200',
};

export default function NacosArchive() {
  const [items, setItems] = useState<ArchiveItem[]>([]);
  const [search, setSearch] = useState('');
  const [yearFilter, setYearFilter] = useState('All');
  const [catFilter, setCatFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = () => {
      try { setItems(JSON.parse(localStorage.getItem('nacos_archive') ?? '[]')); } catch { setItems([]); }
      setLoading(false);
    };
    load();
    const id = setInterval(load, 5000);
    return () => clearInterval(id);
  }, []);

  const years = ['All', ...Array.from(new Set(items.map(i => i.year))).sort((a, b) => Number(b) - Number(a))];
  const cats = ['All', ...Array.from(new Set(items.map(i => i.category)))];

  const filtered = items.filter(item => {
    if (yearFilter !== 'All' && item.year !== yearFilter) return false;
    if (catFilter !== 'All' && item.category !== catFilter) return false;
    if (search && !item.title.toLowerCase().includes(search.toLowerCase()) && !item.desc.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  if (loading) return (
    <div className="max-w-3xl mx-auto space-y-3 animate-pulse">
      {[1, 2, 3].map(i => <div key={i} className="bg-white rounded-2xl border border-gray-100 h-20" />)}
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-black text-gray-900" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>NACOS Archive</h2>
        <p className="text-sm text-gray-400 mt-0.5">Historical records, photos, and documents · {items.length} item{items.length !== 1 ? 's' : ''}</p>
      </div>

      <div className="relative">
        <svg viewBox="0 0 20 20" fill="currentColor"
          className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 pointer-events-none">
          <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
        </svg>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search archives..."
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-white text-sm
            focus:outline-none focus:ring-2 focus:ring-gray-900" />
      </div>

      {(years.length > 2 || cats.length > 2) && (
        <div className="flex gap-3 flex-wrap">
          <select value={yearFilter} onChange={e => setYearFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-gray-200 bg-white text-xs font-semibold text-gray-600
              focus:outline-none focus:ring-2 focus:ring-gray-900"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            {years.map(y => <option key={y}>{y}</option>)}
          </select>
          <select value={catFilter} onChange={e => setCatFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-gray-200 bg-white text-xs font-semibold text-gray-600
              focus:outline-none focus:ring-2 focus:ring-gray-900"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            {cats.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
      )}

      {items.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-14 text-center shadow-[0_2px_4px_rgba(0,0,0,0.04)]">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}
            className="w-12 h-12 text-gray-200 mx-auto mb-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
          </svg>
          <p className="text-sm font-semibold text-gray-400" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Archive is empty</p>
          <p className="text-xs text-gray-300 mt-1">Historical records will appear here when added by the executives</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
          <p className="text-sm text-gray-400">No items match your search</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(item => {
            const catStyle = CAT_STYLE[item.category] ?? CAT_STYLE.Other;
            return (
              <div key={item.id} className="bg-white rounded-2xl border border-gray-100 p-5 flex items-start gap-4
                shadow-[0_2px_4px_rgba(0,0,0,0.04)]">
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0 text-xl">
                  {TYPE_ICONS[item.type] ?? '📁'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-xs font-bold text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full"
                      style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{item.year}</span>
                    <span className={`text-[10px] font-bold border px-2 py-0.5 rounded-full ${catStyle}`}
                      style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{item.category}</span>
                    <span className="text-[10px] text-gray-400">{item.type}</span>
                  </div>
                  <p className="text-sm font-semibold text-gray-800">{item.title}</p>
                  {item.desc && <p className="text-xs text-gray-400 mt-1 leading-relaxed">{item.desc}</p>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
