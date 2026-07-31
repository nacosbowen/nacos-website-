'use client';
import { useState } from 'react';

const GRADE_POINTS: Record<string, number> = { A: 5, B: 4, C: 3, D: 2, E: 1, F: 0 };
const GRADES = ['A', 'B', 'C', 'D', 'E', 'F'];

type Course = { id: string; name: string; units: number; grade: string };
type Semester = { id: string; label: string; courses: Course[] };

function calcGPA(courses: Course[]) {
  const totalUnits = courses.reduce((s, c) => s + c.units, 0);
  if (totalUnits === 0) return 0;
  const totalPoints = courses.reduce((s, c) => s + c.units * (GRADE_POINTS[c.grade] ?? 0), 0);
  return totalPoints / totalUnits;
}

function gpaClass(gpa: number) {
  if (gpa >= 4.5) return { label: 'First Class', color: 'text-green-600 bg-green-50 border-green-200' };
  if (gpa >= 3.5) return { label: '2nd Class Upper', color: 'text-blue-600 bg-blue-50 border-blue-200' };
  if (gpa >= 2.4) return { label: '2nd Class Lower', color: 'text-yellow-600 bg-yellow-50 border-yellow-200' };
  if (gpa >= 1.5) return { label: 'Third Class', color: 'text-orange-600 bg-orange-50 border-orange-200' };
  if (gpa >= 1.0) return { label: 'Pass', color: 'text-red-500 bg-red-50 border-red-200' };
  return { label: 'Fail', color: 'text-red-700 bg-red-100 border-red-300' };
}

function newCourse(): Course { return { id: Date.now().toString(), name: '', units: 3, grade: 'B' }; }
function newSemester(n: number): Semester { return { id: Date.now().toString(), label: `Semester ${n}`, courses: [newCourse()] }; }

export default function CgpaCalculator() {
  const [semesters, setSemesters] = useState<Semester[]>([newSemester(1)]);
  const [activeSem, setActiveSem] = useState(0);

  function addSemester() {
    setSemesters(s => [...s, newSemester(s.length + 1)]);
    setActiveSem(semesters.length);
  }

  function addCourse(semId: string) {
    setSemesters(s => s.map(sem => sem.id === semId
      ? { ...sem, courses: [...sem.courses, newCourse()] }
      : sem
    ));
  }

  function removeCourse(semId: string, courseId: string) {
    setSemesters(s => s.map(sem => sem.id === semId
      ? { ...sem, courses: sem.courses.filter(c => c.id !== courseId) }
      : sem
    ));
  }

  function updateCourse(semId: string, courseId: string, key: keyof Course, value: string | number) {
    setSemesters(s => s.map(sem => sem.id === semId
      ? { ...sem, courses: sem.courses.map(c => c.id === courseId ? { ...c, [key]: value } : c) }
      : sem
    ));
  }

  function removeSemester(semId: string) {
    const updated = semesters.filter(s => s.id !== semId);
    setSemesters(updated);
    setActiveSem(Math.min(activeSem, updated.length - 1));
  }

  const allCourses = semesters.flatMap(s => s.courses);
  const cgpa = calcGPA(allCourses);
  const cls = gpaClass(cgpa);
  const sem = semesters[activeSem];
  const semGPA = sem ? calcGPA(sem.courses) : 0;

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div>
        <h2 className="text-xl font-black text-gray-900" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>CGPA Calculator</h2>
        <p className="text-sm text-gray-400 mt-0.5">Nigerian University 5-point grading system</p>
      </div>

      {/* CGPA display */}
      <div className="bg-gray-900 rounded-2xl p-5 flex items-center justify-between flex-wrap gap-4">
        <div>
          <p className="text-white/50 text-xs font-semibold tracking-widest uppercase"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Cumulative GPA</p>
          <p className="text-4xl font-black text-white mt-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            {cgpa.toFixed(2)}
          </p>
          <span className={`inline-block text-xs font-bold border px-2.5 py-1 rounded-full mt-2 ${cls.color}`}
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            {cls.label}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-4 text-right">
          <div>
            <p className="text-white/40 text-xs">{sem?.label} GPA</p>
            <p className="text-xl font-black text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              {semGPA.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-white/40 text-xs">Total Units</p>
            <p className="text-xl font-black text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              {allCourses.reduce((s, c) => s + c.units, 0)}
            </p>
          </div>
        </div>
      </div>

      {/* Grade scale reference */}
      <div className="flex gap-1.5 flex-wrap">
        {Object.entries(GRADE_POINTS).map(([g, pts]) => (
          <div key={g} className="flex items-center gap-1 bg-white border border-gray-100 px-2.5 py-1.5 rounded-lg
            shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            <span className="text-xs font-black text-gray-900" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{g}</span>
            <span className="text-xs text-gray-400">= {pts}.0</span>
          </div>
        ))}
      </div>

      {/* Semester tabs */}
      <div className="flex gap-1.5 flex-wrap items-center">
        {semesters.map((s, i) => (
          <button key={s.id} onClick={() => setActiveSem(i)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all
              ${activeSem === i ? 'bg-gray-900 text-white' : 'bg-white text-gray-500 border border-gray-200 hover:border-gray-300'}`}
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            {s.label}
          </button>
        ))}
        <button onClick={addSemester}
          className="px-3 py-1.5 rounded-xl text-xs font-bold text-gray-400 border border-dashed border-gray-300 hover:border-gray-400 hover:text-gray-600 transition"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          + Add Semester
        </button>
      </div>

      {/* Active semester courses */}
      {sem && (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
          <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
            <p className="text-sm font-black text-gray-900" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{sem.label}</p>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">GPA: <strong className="text-gray-700">{semGPA.toFixed(2)}</strong></span>
              {semesters.length > 1 && (
                <button onClick={() => removeSemester(sem.id)}
                  className="text-gray-300 hover:text-red-400 transition ml-1">
                  <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          <div className="divide-y divide-gray-50">
            {sem.courses.map(c => (
              <div key={c.id} className="px-5 py-3.5 flex items-center gap-3">
                <input
                  value={c.name} onChange={e => updateCourse(sem.id, c.id, 'name', e.target.value)}
                  placeholder="Course name..."
                  className="flex-1 min-w-0 px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-sm
                    focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                />
                <select value={c.units} onChange={e => updateCourse(sem.id, c.id, 'units', Number(e.target.value))}
                  className="w-16 px-2 py-2 rounded-xl border border-gray-200 bg-gray-50 text-sm text-center
                    focus:outline-none focus:ring-2 focus:ring-gray-900">
                  {[1, 2, 3, 4, 5, 6].map(u => <option key={u} value={u}>{u} CU</option>)}
                </select>
                <select value={c.grade} onChange={e => updateCourse(sem.id, c.id, 'grade', e.target.value)}
                  className="w-16 px-2 py-2 rounded-xl border border-gray-200 bg-gray-50 text-sm text-center font-bold
                    focus:outline-none focus:ring-2 focus:ring-gray-900">
                  {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
                <span className="w-12 text-right text-sm font-black text-gray-500 flex-shrink-0"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  {(c.units * (GRADE_POINTS[c.grade] ?? 0)).toFixed(0)} pts
                </span>
                {sem.courses.length > 1 && (
                  <button onClick={() => removeCourse(sem.id, c.id)} className="text-gray-300 hover:text-red-400 transition flex-shrink-0">
                    <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="px-5 py-3.5 border-t border-gray-100">
            <button onClick={() => addCourse(sem.id)}
              className="flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-gray-700 transition"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Add Course
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
