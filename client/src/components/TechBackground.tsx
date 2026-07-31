'use client';

import { useEffect, useState, useMemo } from 'react';

const ICON_TYPES = ['react','js','ts','python','html','css','git','terminal','node','brackets','database','code','docker','vue','github'];

function TechIcon({ type, size }: { type: string; size: number }) {
  const p = { width: size, height: size, fill: 'none', stroke: 'currentColor', strokeWidth: 1.4, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  switch (type) {
    case 'react': return <svg {...p} viewBox="-15 -15 30 30"><circle r="2.4" fill="currentColor" stroke="none"/><ellipse rx="13" ry="4.5"/><ellipse rx="13" ry="4.5" transform="rotate(60)"/><ellipse rx="13" ry="4.5" transform="rotate(-60)"/></svg>;
    case 'js': return <svg {...p} viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="3"/><path d="M12 14v4c0 1.2-1.5 1.8-2.5 1"/><path d="M16.5 13.5c0-.8-.7-1.5-1.5-1.5s-1.5.7-1.5 1.5.7 1.5 1.5 2 1.5.7 1.5 2-.7 1.5-1.5 1.5-1.5-.7-1.5-1.5"/></svg>;
    case 'ts': return <svg {...p} viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="3"/><path d="M7 10h10M12 10v8"/><path d="M16.5 14.5c0-.8-.7-1.5-1.5-1.5s-1.5.7-1.5 1.5.7 1.5 1.5 2 1.5.7 1.5 2-.7 1.5-1.5 1.5-1.5-.7-1.5-1.5"/></svg>;
    case 'python': return <svg {...p} viewBox="0 0 24 24"><path d="M12 2C9.2 2 7 3.3 7 5.5V9h5v1H6C4 10 2 11.3 2 14s2 4.5 4 4.5h1v-2.5C7 13.5 9 12 12 12s5 1.5 5 4V18h1c2 0 4-1.5 4-4s-2-4-4-4h-1V5.5C17 3.3 14.8 2 12 2z"/><circle cx="9.5" cy="6" r="1" fill="currentColor" stroke="none"/><circle cx="14.5" cy="18" r="1" fill="currentColor" stroke="none"/></svg>;
    case 'html': return <svg {...p} viewBox="0 0 24 24"><path d="M4 3l1.6 17 6.4 2 6.4-2L20 3z"/><path d="M8 8h8l-.6 6-3.4 1-3.4-1L8.3 12H15"/></svg>;
    case 'css': return <svg {...p} viewBox="0 0 24 24"><path d="M4 3l1.6 17 6.4 2 6.4-2L20 3z"/><path d="M16 8H8l.4 4h7l-.5 5-3 .8-3-.8-.2-2h2l.1 1 1.1.3 1.1-.3.2-2H8"/></svg>;
    case 'git': return <svg {...p} viewBox="0 0 24 24"><circle cx="6" cy="6" r="2"/><circle cx="18" cy="6" r="2"/><circle cx="6" cy="18" r="2"/><path d="M8 6h6M6 8v8M14 8l2.5-2.5"/></svg>;
    case 'terminal': return <svg {...p} viewBox="0 0 24 24"><rect x="2" y="4" width="20" height="16" rx="3"/><path d="M6 9l4 3-4 3M13 15h6"/></svg>;
    case 'node': return <svg {...p} viewBox="0 0 24 24"><path d="M12 2l9 5.2v9.6L12 22l-9-5.2V7.2z"/><path d="M12 7v5M9.5 12l2.5 3.5 2.5-3.5"/></svg>;
    case 'brackets': return <svg {...p} viewBox="0 0 24 24"><path d="M8 3H6v18h2M16 3h2v18h-2"/></svg>;
    case 'database': return <svg {...p} viewBox="0 0 24 24"><ellipse cx="12" cy="6" rx="8" ry="3"/><path d="M4 6v6c0 1.66 3.58 3 8 3s8-1.34 8-3V6"/><path d="M4 12v6c0 1.66 3.58 3 8 3s8-1.34 8-3v-6"/></svg>;
    case 'code': return <svg {...p} viewBox="0 0 24 24"><path d="M9 8L5 12l4 4M15 8l4 4-4 4"/><path d="M13.5 5.5l-3 13"/></svg>;
    case 'docker': return <svg {...p} viewBox="0 0 24 24"><rect x="2" y="10" width="3" height="3"/><rect x="6" y="10" width="3" height="3"/><rect x="10" y="10" width="3" height="3"/><rect x="10" y="6" width="3" height="3"/><rect x="6" y="6" width="3" height="3"/><rect x="14" y="10" width="3" height="3"/><path d="M18 10.5c1-1 3-.5 3 1v1c0 3-4 5-8 5H5c-1.5 0-3-1-3-3"/></svg>;
    case 'vue': return <svg {...p} viewBox="0 0 24 24"><path d="M2 4l10 16L22 4h-4l-6 10L6 4z"/><path d="M6 4l6 10L18 4h-3l-3 5-3-5z"/></svg>;
    case 'github': return <svg {...p} viewBox="0 0 24 24"><path d="M9 19c-4.3 1.4-4.3-2.5-6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1-.3-3.3 1.3a11.5 11.5 0 0 0-6 0C6.3 2.8 5.3 3.1 5.3 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 3.9 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21"/></svg>;
    default: return null;
  }
}

export default function TechBackground() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const items = useMemo(() => Array.from({ length: 72 }, (_, i) => ({
    id: i,
    type: ICON_TYPES[Math.floor(Math.random() * ICON_TYPES.length)],
    x: Math.random() * 100, y: Math.random() * 100,
    size: 22 + Math.random() * 28,
    rotation: Math.random() * 50 - 25,
    opacity: 0.045 + Math.random() * 0.055,
  })), []);

  if (!mounted) return null;
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden text-gray-900" style={{ zIndex: 0 }}>
      {items.map(item => (
        <div key={item.id} className="absolute" style={{ left: `${item.x}%`, top: `${item.y}%`, transform: `rotate(${item.rotation}deg) translate(-50%,-50%)`, opacity: item.opacity }}>
          <TechIcon type={item.type} size={item.size} />
        </div>
      ))}
    </div>
  );
}
