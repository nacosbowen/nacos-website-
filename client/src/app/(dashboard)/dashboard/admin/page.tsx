'use client';
import { useState, useEffect, FormEvent } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';

interface UserRow {
  id: string;
  fullName: string;
  email: string;
  matricNumber: string;
  level: number;
  department: { id: number; name: string; code: string };
  roles: string[];
  createdAt: string;
}
// Add these interfaces near UserRow
interface Department { id: number; name: string; code: string; }
interface DinnerData {
  id: string;
  title: string;
  date: string | null;
  time: string;
  venue: string;
  theme: string;
  dressCode: string;
  ticketPrice: string;
  highlights: string;
  imageUrl: string | null;
}

interface TimetableEntry {
  id: string;
  courseCode: string;
  courseTitle: string;
  day: string;
  startTime: string;
  endTime: string;
  venue: string | null;
}

interface ExamEntry {
  id: string;
  courseCode: string;
  courseTitle: string;
  date: string;
  time: string;
  duration: string;
  venue: string | null;
}


const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];
const LEVELS = [100, 200, 300, 400];

const ASSIGNABLE_ROLES = ['course_rep', 'executive', 'admin'];

export default function AdminDashboard() {
  const { user, logout, isLoading } = useAuth();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/users');
      setUsers(data);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

useEffect(() => {
  if (isLoading) return;
  fetchUsers();
}, [isLoading]);

  const handleRoleChange = async (userId: string, role: string, action: 'add' | 'remove') => {
    setPendingUserId(userId);
    try {
      await api.patch(`/users/${userId}/roles`, { role, action });
      await fetchUsers();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to update role');
    } finally {
      setPendingUserId(null);
    }
  };
  const [dinner, setDinner] = useState<DinnerData | null>(null);
  const [dinnerForm, setDinnerForm] = useState<Partial<DinnerData>>({});
  const [dinnerSaving, setDinnerSaving] = useState(false);
  const [dinnerError, setDinnerError] = useState('');
  const [imageUploading, setImageUploading] = useState(false);

  const [departments, setDepartments] = useState<Department[]>([]);
const [selectedDept, setSelectedDept] = useState<number | ''>('');
const [selectedLevel, setSelectedLevel] = useState<number | ''>('');
const [entries, setEntries] = useState<TimetableEntry[]>([]);
const [ttLoading, setTtLoading] = useState(false);
const [ttError, setTtError] = useState('');
const [newEntry, setNewEntry] = useState({
  courseCode: '', courseTitle: '', day: 'MONDAY', startTime: '', endTime: '', venue: '',
});
const [addingEntry, setAddingEntry] = useState(false);
const [dinnerSuccess, setDinnerSuccess] = useState(false);
const [examEntries, setExamEntries] = useState<ExamEntry[]>([]);
const [examLoading, setExamLoading] = useState(false);
const [examError, setExamError] = useState('');
const [addingExam, setAddingExam] = useState(false);
const [newExam, setNewExam] = useState({
  courseCode: '', courseTitle: '', date: '', time: '', duration: '', venue: '',
});

useEffect(() => {
  if (isLoading) return;
  api.get('/users/departments').then(({ data }) => setDepartments(data)).catch(() => {});
}, [isLoading]);

const fetchTimetable = async () => {
  if (!selectedDept || !selectedLevel) return;
  setTtLoading(true);
  setTtError('');
  try {
    const { data } = await api.get('/timetable', { params: { departmentId: selectedDept, level: selectedLevel } });
    setEntries(data);
  } catch (err: any) {
    setTtError(err?.response?.data?.message || 'Failed to load timetable');
  } finally {
    setTtLoading(false);
  }
};

useEffect(() => { fetchTimetable(); }, [selectedDept, selectedLevel]);

const fetchDinner = async () => {
  try {
    const { data } = await api.get('/dinner');
    setDinner(data);
    setDinnerForm({
      title: data.title,
      date: data.date ? data.date.slice(0, 16) : '',
      time: data.time,
      venue: data.venue,
      theme: data.theme,
      dressCode: data.dressCode,
      ticketPrice: data.ticketPrice,
      highlights: data.highlights,
    });
  } catch (err: any) {
    setDinnerError(err?.response?.data?.message || 'Failed to load dinner info');
  }
};

useEffect(() => { fetchDinner(); }, []);

const handleDinnerSave = async (e: FormEvent) => {
  e.preventDefault();
  setDinnerSaving(true);
  setDinnerError('');
  setDinnerSuccess(false);
  try {
    const { data } = await api.patch('/dinner', {
      ...dinnerForm,
      date: dinnerForm.date ? new Date(dinnerForm.date).toISOString() : null,
    });
    setDinner(data);
    setDinnerSuccess(true);
    setTimeout(() => setDinnerSuccess(false), 3000); // auto-hide after 3s
  } catch (err: any) {
    setDinnerError(err?.response?.data?.message || 'Failed to save dinner info');
  } finally {
    setDinnerSaving(false);
  }
};
const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file || imageUploading) return;
  setImageUploading(true);
  try {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await api.post('/dinner/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    setDinner(data);
  } catch (err: any) {
    setDinnerError(err?.response?.data?.message || 'Failed to upload image');
  } finally {
    setImageUploading(false);
  }
};


const handleAddEntry = async (e: FormEvent) => {
  e.preventDefault();
  if (!selectedDept || !selectedLevel || addingEntry) return;
  setAddingEntry(true);
  try {
    await api.post('/timetable', { ...newEntry, departmentId: selectedDept, level: selectedLevel });
    setNewEntry({ courseCode: '', courseTitle: '', day: 'MONDAY', startTime: '', endTime: '', venue: '' });
    fetchTimetable();
  } catch (err: any) {
    setTtError(err?.response?.data?.message || 'Failed to add entry');
  } finally {
    setAddingEntry(false);
  }
};

const handleDeleteEntry = async (id: string) => {
  try {
    await api.delete(`/timetable/${id}`);
    fetchTimetable();
  } catch (err: any) {
    setTtError(err?.response?.data?.message || 'Failed to delete entry');
  }
};

const fetchExams = async () => {
  if (!selectedDept || !selectedLevel) return;
  setExamLoading(true);
  setExamError('');
  try {
    const { data } = await api.get('/exams', { params: { departmentId: selectedDept, level: selectedLevel } });
    setExamEntries(data);
  } catch (err: any) {
    setExamError(err?.response?.data?.message || 'Failed to load exams');
  } finally {
    setExamLoading(false);
  }
};

useEffect(() => { fetchExams(); }, [selectedDept, selectedLevel]);

const handleAddExam = async (e: FormEvent) => {
  e.preventDefault();
  if (!selectedDept || !selectedLevel || addingExam) return;
  setAddingExam(true);
  try {
    await api.post('/exams', { ...newExam, departmentId: selectedDept, level: selectedLevel });
    setNewExam({ courseCode: '', courseTitle: '', date: '', time: '', duration: '', venue: '' });
    fetchExams();
  } catch (err: any) {
    setExamError(err?.response?.data?.message || 'Failed to add exam');
  } finally {
    setAddingExam(false);
  }
};

const handleDeleteExam = async (id: string) => {
  try {
    await api.delete(`/exams/${id}`);
    fetchExams();
  } catch (err: any) {
    setExamError(err?.response?.data?.message || 'Failed to delete exam');
  }
};

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-bold text-blue-700">NACOS</h1>
          <span className="text-xs bg-red-100 text-red-700 font-medium px-2 py-0.5 rounded-full">Admin</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">{user?.fullName}</span>
          <button onClick={logout} className="text-sm text-gray-500 hover:text-red-600 transition">Logout</button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">User Management</h2>
            <span className="text-sm text-gray-400">{users.length} users</span>
          </div>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm">
              {error}
            </div>
          )}

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {loading ? (
              <div className="p-6 text-center text-gray-400 text-sm">Loading users...</div>
            ) : users.length === 0 ? (
              <div className="p-6 text-center text-gray-400 text-sm">No users found</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[640px]">
                  <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                    <tr>
                      <th className="text-left px-4 py-3">Name</th>
                      <th className="text-left px-4 py-3">Matric No.</th>
                      <th className="text-left px-4 py-3">Department</th>
                      <th className="text-left px-4 py-3">Level</th>
                      <th className="text-left px-4 py-3">Roles</th>
                      <th className="text-left px-4 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {users.map((u) => (
                      <tr key={u.id}>
                        <td className="px-4 py-3">
                          <div className="font-medium text-gray-900">{u.fullName}</div>
                          <div className="text-gray-400 text-xs">{u.email}</div>
                        </td>
                        <td className="px-4 py-3 text-gray-600">{u.matricNumber}</td>
                        <td className="px-4 py-3 text-gray-600">{u.department?.code}</td>
                        <td className="px-4 py-3 text-gray-600">{u.level}</td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            {u.roles.map((r) => (
                              <span key={r} className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">
                                {r}
                                {r !== 'student' && (
                                  <button
                                    onClick={() => handleRoleChange(u.id, r, 'remove')}
                                    disabled={pendingUserId === u.id}
                                    className="text-gray-400 hover:text-red-600 font-bold"
                                  >
                                    ×
                                  </button>
                                )}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <select
                            disabled={pendingUserId === u.id}
                            defaultValue=""
                            onChange={(e) => {
                              if (e.target.value) {
                                handleRoleChange(u.id, e.target.value, 'add');
                                e.target.value = '';
                              }
                            }}
                            className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-gray-50"
                          >
                            <option value="" disabled>+ Add role</option>
                            {ASSIGNABLE_ROLES.filter((r) => !u.roles.includes(r)).map((r) => (
                              <option key={r} value={r}>{r}</option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

<section>
  <h2 className="text-lg font-semibold text-gray-900 mb-4">Timetable Management</h2>

  <div className="flex flex-wrap gap-3 mb-4">
    <select value={selectedDept} onChange={(e) => setSelectedDept(Number(e.target.value) || '')}
      className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white">
      <option value="">Select department</option>
      {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
    </select>
    <select value={selectedLevel} onChange={(e) => setSelectedLevel(Number(e.target.value) || '')}
      className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white">
      <option value="">Select level</option>
      {LEVELS.map((l) => <option key={l} value={l}>{l} Level</option>)}
    </select>
  </div>

  {ttError && (
    <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm">{ttError}</div>
  )}

  {selectedDept && selectedLevel && (
    <>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-4">
        {ttLoading ? (
          <div className="p-6 text-center text-gray-400 text-sm">Loading timetable...</div>
        ) : entries.length === 0 ? (
          <div className="p-6 text-center text-gray-400 text-sm">No entries yet for this department/level</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[560px]">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                <tr>
                  <th className="text-left px-4 py-3">Day</th>
                  <th className="text-left px-4 py-3">Time</th>
                  <th className="text-left px-4 py-3">Course</th>
                  <th className="text-left px-4 py-3">Venue</th>
                  <th className="text-left px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {entries.map((e) => (
                  <tr key={e.id}>
                    <td className="px-4 py-3 text-gray-600">{e.day}</td>
                    <td className="px-4 py-3 text-gray-600">{e.startTime} – {e.endTime}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{e.courseCode}</div>
                      <div className="text-gray-400 text-xs">{e.courseTitle}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{e.venue || '—'}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => handleDeleteEntry(e.id)} className="text-gray-400 hover:text-red-600 text-xs font-semibold">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <form onSubmit={handleAddEntry} className="bg-white rounded-xl border border-gray-200 p-4 grid grid-cols-2 md:grid-cols-3 gap-3">
        <input required placeholder="Course Code (e.g. CSC301)" value={newEntry.courseCode}
          onChange={(e) => setNewEntry({ ...newEntry, courseCode: e.target.value })}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2" />
        <input required placeholder="Course Title" value={newEntry.courseTitle}
          onChange={(e) => setNewEntry({ ...newEntry, courseTitle: e.target.value })}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 col-span-2 md:col-span-1" />
        <select value={newEntry.day} onChange={(e) => setNewEntry({ ...newEntry, day: e.target.value })}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2">
          {DAYS.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
        <input required type="time" value={newEntry.startTime}
          onChange={(e) => setNewEntry({ ...newEntry, startTime: e.target.value })}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2" />
        <input required type="time" value={newEntry.endTime}
          onChange={(e) => setNewEntry({ ...newEntry, endTime: e.target.value })}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2" />
        <input placeholder="Venue (optional)" value={newEntry.venue}
          onChange={(e) => setNewEntry({ ...newEntry, venue: e.target.value })}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2" />
        <button type="submit" className="col-span-2 md:col-span-3 bg-gray-900 text-white text-sm font-semibold py-2 rounded-lg hover:bg-gray-800">
          Add Entry
        </button>
      </form>
    </>
  )}
</section>

<section>
  <h2 className="text-lg font-semibold text-gray-900 mb-4">Exam Timetable Management</h2>
  <p className="text-xs text-gray-400 mb-3">Uses the department/level selected above</p>

  {examError && (
    <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm">{examError}</div>
  )}

  {selectedDept && selectedLevel && (
    <>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-4">
        {examLoading ? (
          <div className="p-6 text-center text-gray-400 text-sm">Loading exams...</div>
        ) : examEntries.length === 0 ? (
          <div className="p-6 text-center text-gray-400 text-sm">No exams yet for this department/level</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[640px]">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                <tr>
                  <th className="text-left px-4 py-3">Date</th>
                  <th className="text-left px-4 py-3">Time</th>
                  <th className="text-left px-4 py-3">Course</th>
                  <th className="text-left px-4 py-3">Duration</th>
                  <th className="text-left px-4 py-3">Venue</th>
                  <th className="text-left px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {examEntries.map((ex) => (
                  <tr key={ex.id}>
                    <td className="px-4 py-3 text-gray-600">{new Date(ex.date).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-gray-600">{ex.time}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{ex.courseCode}</div>
                      <div className="text-gray-400 text-xs">{ex.courseTitle}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{ex.duration}</td>
                    <td className="px-4 py-3 text-gray-600">{ex.venue || '—'}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => handleDeleteExam(ex.id)} className="text-gray-400 hover:text-red-600 text-xs font-semibold">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <form onSubmit={handleAddExam} className="bg-white rounded-xl border border-gray-200 p-4 grid grid-cols-2 md:grid-cols-3 gap-3">
        <input required placeholder="Course Code" value={newExam.courseCode}
          onChange={(e) => setNewExam({ ...newExam, courseCode: e.target.value })}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2" />
        <input required placeholder="Course Title" value={newExam.courseTitle}
          onChange={(e) => setNewExam({ ...newExam, courseTitle: e.target.value })}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 col-span-2 md:col-span-1" />
        <input required type="date" value={newExam.date}
          onChange={(e) => setNewExam({ ...newExam, date: e.target.value })}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2" />
        <input required type="time" value={newExam.time}
          onChange={(e) => setNewExam({ ...newExam, time: e.target.value })}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2" />
        <input required placeholder="Duration (e.g. 2 hours)" value={newExam.duration}
          onChange={(e) => setNewExam({ ...newExam, duration: e.target.value })}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2" />
        <input placeholder="Venue (optional)" value={newExam.venue}
          onChange={(e) => setNewExam({ ...newExam, venue: e.target.value })}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2" />
        <button type="submit" disabled={addingExam}
          className="col-span-2 md:col-span-3 bg-gray-900 text-white text-sm font-semibold py-2 rounded-lg hover:bg-gray-800 disabled:opacity-60">
          {addingExam ? 'Adding...' : 'Add Exam'}
        </button>
      </form>
    </>
  )}
</section>

<section>
  <h2 className="text-lg font-semibold text-gray-900 mb-4">Dinner Management</h2>

  {dinnerError && (
    <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm">{dinnerError}</div>
  )}

  {dinnerSuccess && (
    <div className="mb-4 px-4 py-3 rounded-xl bg-green-50 border border-green-100 text-green-700 text-sm">
      Dinner details saved successfully.
    </div>
  )}

  <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 space-y-4">
    {dinner?.imageUrl && (
      <img src={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${dinner.imageUrl}`}
        alt="Dinner" className="w-full h-40 object-cover rounded-lg" />
    )}

    <div>
      <label className="block text-xs font-semibold text-gray-500 mb-1">Dinner Image</label>
      <input type="file" accept="image/*" onChange={handleImageUpload} disabled={imageUploading}
        className="text-sm" />
      {imageUploading && <p className="text-xs text-gray-400 mt-1">Uploading...</p>}
    </div>

    <form onSubmit={handleDinnerSave} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <input placeholder="Title" value={dinnerForm.title || ''}
        onChange={(e) => setDinnerForm({ ...dinnerForm, title: e.target.value })}
        className="text-sm border border-gray-200 rounded-lg px-3 py-2 sm:col-span-2" />
      <input type="datetime-local" value={dinnerForm.date || ''}
        onChange={(e) => setDinnerForm({ ...dinnerForm, date: e.target.value })}
        className="text-sm border border-gray-200 rounded-lg px-3 py-2" />
      <input placeholder="Time (e.g. 6:00 PM)" value={dinnerForm.time || ''}
        onChange={(e) => setDinnerForm({ ...dinnerForm, time: e.target.value })}
        className="text-sm border border-gray-200 rounded-lg px-3 py-2" />
      <input placeholder="Venue" value={dinnerForm.venue || ''}
        onChange={(e) => setDinnerForm({ ...dinnerForm, venue: e.target.value })}
        className="text-sm border border-gray-200 rounded-lg px-3 py-2 sm:col-span-2" />
      <input placeholder="Theme" value={dinnerForm.theme || ''}
        onChange={(e) => setDinnerForm({ ...dinnerForm, theme: e.target.value })}
        className="text-sm border border-gray-200 rounded-lg px-3 py-2" />
      <input placeholder="Ticket Price" value={dinnerForm.ticketPrice || ''}
        onChange={(e) => setDinnerForm({ ...dinnerForm, ticketPrice: e.target.value })}
        className="text-sm border border-gray-200 rounded-lg px-3 py-2" />
      <textarea placeholder="Dress Code" value={dinnerForm.dressCode || ''}
        onChange={(e) => setDinnerForm({ ...dinnerForm, dressCode: e.target.value })}
        className="text-sm border border-gray-200 rounded-lg px-3 py-2 sm:col-span-2" rows={2} />
      <textarea placeholder="Highlights (one per line)" value={dinnerForm.highlights || ''}
        onChange={(e) => setDinnerForm({ ...dinnerForm, highlights: e.target.value })}
        className="text-sm border border-gray-200 rounded-lg px-3 py-2 sm:col-span-2" rows={4} />
      <button type="submit" disabled={dinnerSaving}
        className="sm:col-span-2 bg-gray-900 text-white text-sm font-semibold py-2 rounded-lg hover:bg-gray-800 disabled:opacity-60">
        {dinnerSaving ? 'Saving...' : 'Save Dinner Details'}
      </button>
    </form>
  </div>
</section>
      </main>
    </div>
  );
}