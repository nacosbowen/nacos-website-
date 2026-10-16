'use client';
import { useState, useEffect, useCallback, FormEvent } from 'react';
import api from '@/lib/api';

interface LogRow {
  id: string;
  userName: string;
  userRole: string;
  action: string;
  entityType: string;
  details: string | null;
  createdAt: string;
}

const ROLE_STYLES: Record<string, string> = {
  admin: 'bg-red-100 text-red-700',
  executive: 'bg-blue-100 text-blue-700',
  course_rep: 'bg-green-100 text-green-700',
};

const ENTITY_TYPES = ['timetable', 'notification', 'past question', 'suggestion'];

export default function ActivityLog() {
  const [items, setItems] = useState<LogRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [role, setRole] = useState('');
  const [entityType, setEntityType] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchLog = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/admin/activity', {
        params: {
          page,
          ...(role && { role }),
          ...(entityType && { entityType }),
          ...(search && { search }),
        },
      });
      setItems(data.items);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load activity');
    } finally {
      setLoading(false);
    }
  }, [page, role, entityType, search]);

  useEffect(() => { fetchLog(); }, [fetchLog]);

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Activity Log</h2>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-400">{total} entries</span>
          <button onClick={fetchLog} className="text-xs font-semibold text-gray-500 hover:text-gray-900">
            Refresh
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <select value={role} onChange={(e) => { setRole(e.target.value); setPage(1); }}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white">
          <option value="">All roles</option>
          <option value="executive">Executive</option>
          <option value="course_rep">Course rep</option>
          <option value="admin">Admin</option>
        </select>
        <select value={entityType} onChange={(e) => { setEntityType(e.target.value); setPage(1); }}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white">
          <option value="">All activity</option>
          {ENTITY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <form onSubmit={handleSearch} className="flex gap-2">
          <input placeholder="Search by name" value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2" />
          <button type="submit" className="text-sm font-semibold bg-gray-900 text-white px-4 rounded-lg hover:bg-gray-800">
            Search
          </button>
        </form>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm">{error}</div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-6 text-center text-gray-400 text-sm">Loading activity...</div>
        ) : items.length === 0 ? (
          <div className="p-6 text-center text-gray-400 text-sm">No activity recorded yet</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[640px]">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                <tr>
                  <th className="text-left px-4 py-3">When</th>
                  <th className="text-left px-4 py-3">Who</th>
                  <th className="text-left px-4 py-3">Action</th>
                  <th className="text-left px-4 py-3">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map((row) => (
                  <tr key={row.id}>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                      {new Date(row.createdAt).toLocaleString('en-NG', { dateStyle: 'medium', timeStyle: 'short' })}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{row.userName}</div>
                      <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full mt-0.5 ${ROLE_STYLES[row.userRole] ?? 'bg-gray-100 text-gray-600'}`}>
                        {row.userRole}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                      {row.action} {row.entityType}
                    </td>
                    <td className="px-4 py-3 text-gray-500">{row.details || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <button onClick={() => setPage((p) => Math.max(p - 1, 1))} disabled={page === 1}
            className="text-sm font-semibold text-gray-600 disabled:opacity-40">
            Previous
          </button>
          <span className="text-xs text-gray-400">Page {page} of {totalPages}</span>
          <button onClick={() => setPage((p) => Math.min(p + 1, totalPages))} disabled={page === totalPages}
            className="text-sm font-semibold text-gray-600 disabled:opacity-40">
            Next
          </button>
        </div>
      )}
    </section>
  );
}