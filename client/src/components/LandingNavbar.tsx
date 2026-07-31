'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

const NAV_LINKS = [
  { label: 'About', href: '#about' },
  { label: 'Courses', href: '#courses' },
  { label: 'Executives', href: '#executives' },
  { label: 'NACOS Communities', href: '#communities' },
];

export default function LandingNavbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="fixed top-6 left-0 right-0 z-40 flex justify-center px-4">
      {/* Desktop */}
      <nav className="nav-pill hidden md:flex items-center gap-3 rounded-full px-4 py-3 relative overflow-hidden">
        <div className="nav-shine" />
        <div className="nav-logo w-12 h-12 bg-white rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden cursor-pointer">
          <Image src="/1690802623935.jpeg" alt="NACOS" width={44} height={44} className="object-contain rounded-full" />
        </div>
        <div className="flex items-center gap-1 px-3">
          {NAV_LINKS.map((link, i) => (
            <a key={link.label} href={link.href}
              className="nav-link-item px-5 py-2.5 text-base font-medium text-white/75 rounded-full"
              style={{ animationDelay: `${0.1 + i * 0.08}s` }}>
              {link.label}
            </a>
          ))}
        </div>
        <Link href="/login" className="nav-login-btn bg-white text-[#111] text-base font-semibold px-6 py-2.5 rounded-full">
          Login
        </Link>
      </nav>

      {/* Mobile */}
      <div className="flex md:hidden flex-col w-full max-w-sm gap-2">
        <nav className="nav-pill flex items-center justify-between rounded-full px-3 py-2 relative overflow-hidden">
          <div className="nav-shine" />
          <div className="nav-logo w-9 h-9 bg-white rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
            <Image src="/1690802623935.jpeg" alt="NACOS" width={32} height={32} className="object-contain rounded-full" />
          </div>
          <span className="text-white text-sm font-semibold tracking-wide">NACOS BOWEN</span>
          <div className="flex items-center gap-2">
            <Link href="/login" className="nav-login-btn bg-white text-[#111] text-xs font-semibold px-4 py-1.5 rounded-full">Login</Link>
            <button onClick={() => setMenuOpen(p => !p)} className="w-8 h-8 flex flex-col items-center justify-center gap-1.5 relative z-10">
              <span className={`block w-5 h-0.5 bg-white transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
              <span className={`block w-5 h-0.5 bg-white transition-all duration-300 ${menuOpen ? 'opacity-0 scale-x-0' : ''}`} />
              <span className={`block w-5 h-0.5 bg-white transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
            </button>
          </div>
        </nav>
        <div className={`nav-pill overflow-hidden rounded-2xl transition-all duration-300 ${menuOpen ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'}`}>
          {NAV_LINKS.map(link => (
            <a key={link.label} href={link.href} onClick={() => setMenuOpen(false)}
              className="block px-6 py-4 text-sm font-medium text-white/75 hover:text-white hover:bg-white/10 transition border-b border-white/5 last:border-0">
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
