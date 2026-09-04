'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/api';

const CATS = ['Events', 'Academic', 'Sports', 'Tech', 'Cultural', 'Other'];
const TYPES = ['Gallery', 'Document', 'Video', 'Report', 'Newsletter', 'Other'];
const EMPTY = { title: '', type: 'Document', year: new Date().getFullYear().toString(), category: 'Events', description: '' };

const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5001';

type ArchiveImage = { id: string; imageUrl: string };
type ArchiveItem = {
  id: string; title: string; type: string; year: string; category: string;
  description: string | null; createdAt: string; images: ArchiveImage[];
};

const TYPE_ICONS: Record<string, string> = {
  Gallery: '🖼', Document: '📄', Video: '🎬', Report: '📊', Newsletter: '📰', Other: '📁',
};

export default function ExecutiveArchive() {
  const [items, setItems] = useState<ArchiveItem[]>([]);
  const [form, setForm] = useState({ ...EMPTY });
  const [showForm, setShowForm] = useState(false);
  const [toast, setToast] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [uploadingFor, setUploadingFor] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    api.get('/archive').then(r => setItems(r.data)).catch(() => {});
  }, []);

  function flash(msg: string) { setToast(msg); setTimeout(() => setToast(''), 3000); }

  async function addItem() {
    if (!form.title.trim() || creating) return;
    setCreating(true);
    try {
      const { data } = await api.post('/archive', form);
      setItems(prev => [data, ...prev]);
      setForm({ ...EMPTY });
      setShowForm(false);
      flash('Added to NACOS Archive ✓');
    } catch (err: any) {
      flash(err?.response?.data?.message || 'Failed to add item');
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await api.delete(`/archive/${id}`);
      setItems(prev => prev.filter(x => x.id !== id));
      setDeleteId(null);
      flash('Deleted');
    } catch {
      flash('Failed to delete');
    }
  }

  async function handleImagesUpload(itemId: string, files: FileList) {
    setUploadingFor(itemId);
    try {
      const fd = new FormData();
      Array.from(files).forEach(f => fd.append('files', f));
      const { data } = await api.post(`/archive/${itemId}/images`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setItems(prev => prev.map(i => i.id === itemId ? { ...i, images: [...i.images, ...data] } : i));
      flash('Images added ✓');
    } catch (err: any) {
      flash(err?.response?.data?.message || 'Failed to upload images');
    } finally {
      setUploadingFor(null);
    }
  }

  async function handleImageDelete(itemId: string, imageId: string) {
    try {
      await api.delete(`/archive/${itemId}/images/${imageId}`);
      setItems(prev => prev.map(i => i.id === itemId
        ? { ...i, images: i.images.filter(img => img.id !== imageId) } : i));
    } catch {
      flash('Failed to delete image');
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {toast && (
        <div className="fixed top-5 right-5 z-50 bg-gray-900 text-white px-4 py-2.5 rounded-xl text-sm font-semibold
          shadow-lg flex items-center gap-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-green-400 flex-shrink-0">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          {toast}
        </div>
      )}

      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-black text-gray-900" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>NACOS Archive</h2>
          <p className="text-sm text-gray-400 mt-0.5">Manage historical records · {items.length} item{items.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => setShowForm(s => !s)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-gray-900 hover:bg-gray-800 transition"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Add Item
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4 shadow-[0_4px_16px_rgba(0,0,0,0.08)]">
          <p className="text-sm font-black text-gray-900" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>New Archive Item</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Title</label>
              <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="e.g. NACOS Week 2024 Photos"
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Type</label>
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900">
                {TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Year</label>
              <input value={form.year} onChange={e => setForm(f => ({ ...f, year: e.target.value }))}
                placeholder="e.g. 2024"
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Category</label>
              <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900">
                {CATS.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Description (optional)</label>
              <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                rows={2} placeholder="Brief description..."
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-gray-900" />
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <button onClick={addItem} disabled={!form.title.trim() || creating}
              className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-gray-900 hover:bg-gray-800
                disabled:opacity-40 disabled:cursor-not-allowed transition"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              {creating ? 'Adding...' : 'Add to Archive'}
            </button>
            <button onClick={() => { setShowForm(false); setForm({ ...EMPTY }); }}
              className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-100 transition"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Cancel</button>
          </div>
        </div>
      )}

      {items.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-14 text-center shadow-[0_2px_4px_rgba(0,0,0,0.04)]">
          <p className="text-sm font-semibold text-gray-400" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Archive is empty</p>
          <p className="text-xs text-gray-300 mt-1">Add historical records, photos, and documents</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map(item => {
            const isExpanded = expandedId === item.id;
            return (
              <div key={item.id} className="bg-white rounded-2xl border border-gray-100 p-4
                shadow-[0_2px_4px_rgba(0,0,0,0.04)]">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0 text-lg">
                    {TYPE_ICONS[item.type] ?? '📁'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <span className="text-xs font-bold text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">{item.year}</span>
                      <span className="text-xs font-bold text-gray-500 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded-full">{item.category}</span>
                      <span className="text-xs text-gray-400">{item.type}</span>
                      {item.images.length > 0 && (
                        <span className="text-xs text-gray-400">{item.images.length} image{item.images.length !== 1 ? 's' : ''}</span>
                      )}
                    </div>
                    <p className="text-sm font-semibold text-gray-800">{item.title}</p>
                    {item.description && <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{item.description}</p>}
                    <button onClick={() => setExpandedId(isExpanded ? null : item.id)}
                      className="text-xs text-gray-400 hover:text-gray-600 mt-1.5">
                      {isExpanded ? 'Hide images ↑' : 'Manage images ↓'}
                    </button>
                  </div>
                  {deleteId === item.id ? (
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <p className="text-xs text-gray-500">Remove?</p>
                      <button onClick={() => handleDelete(item.id)}
                        className="px-2.5 py-1 rounded-lg bg-red-600 text-white text-xs font-bold">Yes</button>
                      <button onClick={() => setDeleteId(null)}
                        className="px-2.5 py-1 rounded-lg bg-gray-100 text-gray-600 text-xs font-bold">No</button>
                    </div>
                  ) : (
                    <button onClick={() => setDeleteId(item.id)}
                      className="p-1.5 rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-50 transition flex-shrink-0">
                      <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  )}
                </div>

                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    {item.images.length > 0 && (
                      <div className="grid grid-cols-4 gap-2 mb-3">
                        {item.images.map(img => (
                          <div key={img.id} className="relative group">
                            <img src={`${baseUrl}${img.imageUrl}`} alt=""
                              className="w-full h-20 object-cover rounded-lg" />
                            <button onClick={() => handleImageDelete(item.id, img.id)}
                              className="absolute top-1 right-1 w-5 h-5 bg-black/60 text-white rounded-full text-xs
                                opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    <label className="text-xs text-gray-400 cursor-pointer hover:text-gray-600">
                      {uploadingFor === item.id ? 'Uploading...' : '+ Add images'}
                      <input type="file" accept="image/*" multiple className="hidden"
                        disabled={uploadingFor === item.id}
                        onChange={e => {
                          if (e.target.files && e.target.files.length > 0) {
                            handleImagesUpload(item.id, e.target.files);
                          }
                        }} />
                    </label>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}