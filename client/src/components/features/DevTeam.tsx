'use client';
import { useState } from 'react';

const ROLES = ['Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'Mobile Developer', 'UI/UX Designer', 'DevOps Engineer', 'Data Analyst', 'Other'];

const TEAM = [
  { name: 'Oluwaseun Adeyemi', role: 'Lead Developer', dept: 'CS', level: 400, skills: ['React', 'Node.js', 'TypeScript'] },
  { name: 'Chidera Nwankwo', role: 'Backend Engineer', dept: 'SE', level: 300, skills: ['Python', 'Django', 'PostgreSQL'] },
  { name: 'Amara Okoye', role: 'UI/UX Designer', dept: 'CS', level: 300, skills: ['Figma', 'React', 'Tailwind'] },
  { name: 'Emeka Eze', role: 'Mobile Developer', dept: 'CS', level: 300, skills: ['Flutter', 'React Native', 'Firebase'] },
  { name: 'Fatima Usman', role: 'DevOps Engineer', dept: 'CYB', level: 400, skills: ['AWS', 'Docker', 'CI/CD'] },
  { name: 'Tunde Adebayo', role: 'Full Stack Dev', dept: 'IFT', level: 200, skills: ['Vue.js', 'Express', 'MongoDB'] },
];

const PROJECTS = [
  { name: 'NACOS Website & App', desc: 'The official NACOS Bowen web app you\'re using right now — built from scratch.', status: 'Live', tech: ['Next.js', 'TypeScript', 'Node.js'] },
  { name: 'CGPA Tracker', desc: 'A mobile app to help students track their academic performance across semesters.', status: 'In Progress', tech: ['Flutter', 'Firebase'] },
  { name: 'PQ Library', desc: 'A searchable archive of past questions across all NACOS departments.', status: 'In Progress', tech: ['React', 'Supabase'] },
];

export default function DevTeam() {
  const [form, setForm] = useState({ name: '', dept: '', level: '', role: ROLES[0], skills: '', reason: '' });
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.dept || !form.level || !form.reason) return;
    try {
      const existing = JSON.parse(localStorage.getItem('nacos_dev_applications') ?? '[]');
      const app = { id: Date.now().toString(), name: form.name, dept: form.dept, level: form.level, role: form.role, skills: form.skills, motivation: form.reason, submittedAt: Date.now(), status: 'pending' };
      localStorage.setItem('nacos_dev_applications', JSON.stringify([...existing, app]));
    } catch { /* ignore */ }
    setSubmitted(true);
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h2 className="text-xl font-black text-gray-900" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>NACOS Dev Team</h2>
        <p className="text-sm text-gray-400 mt-0.5">Building tech solutions for NACOS Bowen</p>
      </div>

      {/* Mission */}
      <div className="bg-gray-900 rounded-2xl px-7 py-6"
        style={{ backgroundImage: 'radial-gradient(circle at 80% 50%, rgba(255,255,255,0.04) 0%, transparent 60%)' }}>
        <p className="text-xs font-bold text-white/40 tracking-widest uppercase mb-2"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Our Mission</p>
        <p className="text-white font-semibold text-sm leading-relaxed max-w-lg">
          We are a group of passionate student developers building real-world tech solutions for NACOS Bowen.
          From websites to mobile apps, we create tools that improve student experience.
        </p>
      </div>

      {/* Projects */}
      <div>
        <p className="text-xs font-bold text-gray-400 tracking-widest uppercase mb-4"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Our Projects</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {PROJECTS.map(p => (
            <div key={p.name} className="bg-white rounded-2xl border border-gray-100 p-4
              shadow-[0_2px_4px_rgba(0,0,0,0.04)]">
              <div className="flex items-start justify-between gap-2 mb-2">
                <p className="text-sm font-black text-gray-900" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{p.name}</p>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex-shrink-0
                  ${p.status === 'Live' ? 'bg-green-50 text-green-600 border-green-200' : 'bg-orange-50 text-orange-500 border-orange-200'}`}
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  {p.status}
                </span>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed mb-3">{p.desc}</p>
              <div className="flex flex-wrap gap-1.5">
                {p.tech.map(t => (
                  <span key={t} className="text-[10px] font-bold bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{t}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Team */}
      <div>
        <p className="text-xs font-bold text-gray-400 tracking-widest uppercase mb-4"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}>The Team</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {TEAM.map(m => {
            const initials = m.name.split(' ').map(n => n[0]).join('').slice(0, 2);
            return (
              <div key={m.name} className="bg-white rounded-2xl border border-gray-100 p-4
                shadow-[0_2px_4px_rgba(0,0,0,0.04)]">
                <div className="w-10 h-10 rounded-xl bg-gray-900 flex items-center justify-center mb-3">
                  <span className="text-xs font-black text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{initials}</span>
                </div>
                <p className="text-xs font-black text-gray-900" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{m.name}</p>
                <p className="text-[11px] text-gray-500 mt-0.5">{m.role}</p>
                <p className="text-[10px] text-gray-400 mt-1">{m.dept} · {m.level}L</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {m.skills.slice(0, 2).map(s => (
                    <span key={s} className="text-[9px] font-bold bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">{s}</span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Join form */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
        <p className="text-base font-black text-gray-900 mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          Join the Dev Team
        </p>
        <p className="text-xs text-gray-400 mb-5">We're always looking for passionate student developers</p>

        {submitted ? (
          <div className="text-center py-6">
            <div className="w-12 h-12 bg-gray-900 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-6 h-6 text-white">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            <p className="text-sm font-black text-gray-900" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Application Sent!</p>
            <p className="text-xs text-gray-400 mt-1">We'll review your application and reach out via email.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {[
                { key: 'name', label: 'Full Name', placeholder: 'Your full name' },
                { key: 'dept', label: 'Department', placeholder: 'e.g. Computer Science' },
              ].map(f => (
                <div key={f.key}>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block"
                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{f.label}</label>
                  <input value={form[f.key as keyof typeof form]}
                    onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                    placeholder={f.placeholder}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm
                      focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent" />
                </div>
              ))}
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Level</label>
                <select value={form.level} onChange={e => setForm(p => ({ ...p, level: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900">
                  <option value="">Select level</option>
                  {['100L', '200L', '300L', '400L'].map(l => <option key={l}>{l}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Role Applying For</label>
                <select value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900">
                  {ROLES.map(r => <option key={r}>{r}</option>)}
                </select>
              </div>
              <div className="col-span-2">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Skills</label>
                <input value={form.skills} onChange={e => setForm(p => ({ ...p, skills: e.target.value }))}
                  placeholder="e.g. React, Python, Figma"
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm
                    focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent" />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Why do you want to join?</label>
              <textarea value={form.reason} onChange={e => setForm(p => ({ ...p, reason: e.target.value }))}
                rows={3} placeholder="Tell us why you're passionate about joining the NACOS Dev Team..."
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm resize-none
                  focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent" />
            </div>
            <button type="submit"
              className="px-6 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-bold hover:bg-gray-800 transition"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Submit Application
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
