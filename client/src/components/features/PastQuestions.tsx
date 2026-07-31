'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/api';

const LEVELS = ['All', '100', '200', '300', '400', '500'];

type PQ = {
  id: string;
  title: string;
  courseCode: string;
  level: number;
  year: number;
  fileUrl: string;
  createdAt: string;
};

export default function PastQuestions() {
  const [questions, setQuestions] = useState<PQ[]>([]);
  const [search, setSearch] = useState('');
  const [level, setLevel] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams();
    if (level !== 'All') params.set('level', level);
    api.get(`/past-questions?${params}`).then(r => {
      setQuestions(r.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [level]);

  const filtered = questions.filter(q => {
    if (!search) return true;
    const s = search.toLowerCase();
    return q.courseCode.toLowerCase().includes(s) || q.title.toLowerCase().includes(s);
  });

  const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5001';

  if (loading) return (
    <div className="max-w-3xl mx-auto space-y-3 animate-pulse">
      {[1, 2, 3].map(i => <div key={i} className="bg-white rounded-2xl border border-gray-100 h-20" />)}
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-black text-gray-900" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Past Questions</h2>
        <p className="text-sm text-gray-400 mt-0.5">Browse and download past exam questions · {questions.length} available</p>
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <svg viewBox="0 0 20 20" fill="currentColor"
            className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 pointer-events-none">
            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
          </svg>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by course code or title..."
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-white text-sm
              focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent" />
        </div>
        <select value={level} onChange={e => setLevel(e.target.value)}
          className="px-3 py-2 rounded-xl border border-gray-200 bg-white text-xs font-semibold text-gray-600
            focus:outline-none focus:ring-2 focus:ring-gray-900"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          {LEVELS.map(l => <option key={l}>{l === 'All' ? 'All Levels' : `${l}L`}</option>)}
        </select>
      </div>

      {questions.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-14 text-center shadow-[0_2px_4px_rgba(0,0,0,0.04)]">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}
            className="w-12 h-12 text-gray-200 mx-auto mb-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
          <p className="text-sm font-semibold text-gray-400" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>No past questions uploaded yet</p>
          <p className="text-xs text-gray-300 mt-1">Past questions will appear here when uploaded by your course rep or executives</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
          <p className="text-sm text-gray-400">No results match your search</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(q => (
            <div key={q.id} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-4
              shadow-[0_2px_4px_rgba(0,0,0,0.04)]">
              <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-gray-400">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-0.5">
                  <span className="text-xs font-black text-gray-900" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    {q.courseCode}
                  </span>
                  <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                    {q.level}L
                  </span>
                  <span className="text-[10px] text-gray-400">{q.year}</span>
                </div>
                <p className="text-sm text-gray-700">{q.title}</p>
              </div>
              <a
                href={`${baseUrl}${q.fileUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                download
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-gray-100 text-gray-600 hover:bg-gray-200 transition flex-shrink-0"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                Download
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
