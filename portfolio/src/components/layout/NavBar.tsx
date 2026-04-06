'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { useVisitorMode, type VisitorMode } from '@/components/ui/VisitorModeProvider';

const LINKS = [
  { href: '/lab',     label: 'Lab'     },
  { href: '/archive', label: 'Archive' },
  { href: '/inkwell', label: 'Inkwell' },
  { href: '/visuals', label: 'Visuals' },
  { href: '/map',     label: 'Map'     },
  { href: '/contact', label: 'Contact' },
];

const MODES: { id: VisitorMode; label: string; color: string; desc: string }[] = [
  { id: 'developer', label: 'Developer', color: '#00ff88', desc: 'Full cyberpunk experience' },
  { id: 'recruiter', label: 'Recruiter', color: '#e8e8e8', desc: 'Clean & professional'     },
  { id: 'friend',    label: 'Friend',    color: '#f472b6', desc: 'Casual & friendly'         },
];

export function NavBar() {
  const pathname = usePathname();
  const { mode, setMode } = useVisitorMode();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [modeOpen, setModeOpen]     = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setModeOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const currentMode = MODES.find(m => m.id === mode)!;

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-void/90 backdrop-blur-md border-b border-[#1a1a2e]">
      <nav className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-4">

        {/* Logo */}
        <Link href="/" className="font-display text-sm tracking-widest text-[#00ff88] hover:opacity-80 transition-all flex-shrink-0">
          RJ<span className="text-[#8888aa]">://</span>
        </Link>

        {/* Desktop nav links */}
        <ul className="hidden md:flex items-center gap-1 flex-1">
          {LINKS.map(l => {
            const active = pathname.startsWith(l.href);
            return (
              <li key={l.href}>
                <Link href={l.href}
                  className={`px-3 py-1 text-xs tracking-widest uppercase transition-colors font-mono
                    ${active ? 'text-[#00ff88] border-b border-[#00ff88]' : 'text-[#8888aa] hover:text-[#e8e8f0]'}`}>
                  {l.label}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Mode switcher dropdown */}
        <div className="relative hidden md:block" ref={dropRef}>
          <button
            onClick={() => setModeOpen(o => !o)}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-mono tracking-widest uppercase border rounded transition-all"
            style={{
              borderColor: `${currentMode.color}40`,
              color:       currentMode.color,
              background:  `${currentMode.color}08`,
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: currentMode.color, boxShadow: `0 0 4px ${currentMode.color}` }} />
            {currentMode.label}
            <span className="opacity-50 ml-1">{modeOpen ? '▲' : '▼'}</span>
          </button>

          {modeOpen && (
            <div className="absolute right-0 top-full mt-2 w-52 rounded-lg border border-[#1a1a2e] overflow-hidden shadow-2xl"
              style={{ background: '#0d0d12', zIndex: 200 }}>
              {MODES.map(m => (
                <button
                  key={m.id}
                  onClick={() => { setMode(m.id); setModeOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-[#111118]"
                  style={{ borderBottom: '1px solid #1a1a2e' }}
                >
                  <span className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ background: m.color, boxShadow: `0 0 5px ${m.color}` }} />
                  <div>
                    <p className="text-xs font-mono tracking-widest uppercase" style={{ color: m.color }}>{m.label}</p>
                    <p className="text-[10px] text-[#4a4a6a] mt-0.5">{m.desc}</p>
                  </div>
                  {mode === m.id && <span className="ml-auto text-[10px]" style={{ color: m.color }}>✓</span>}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Keyboard hints */}
        <div className="hidden lg:flex gap-3 text-xs text-[#4a4a6a] font-mono flex-shrink-0">
          <span title="Command palette">⌘K</span>
          <span title="Terminal">~</span>
        </div>

        {/* Mobile hamburger */}
        <button className="md:hidden text-[#8888aa] hover:text-[#e8e8f0] ml-auto" onClick={() => setMobileOpen(o => !o)}>
          {mobileOpen ? '✕' : '☰'}
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-[#1a1a2e]" style={{ background: '#0d0d12' }}>
          {LINKS.map(l => (
            <Link key={l.href} href={l.href} onClick={() => setMobileOpen(false)}
              className="block px-4 py-3 text-sm text-[#8888aa] hover:text-[#00ff88] border-b border-[#1a1a2e] transition-colors font-mono">
              &gt; {l.label}
            </Link>
          ))}
          {/* Mode switcher in mobile */}
          <div className="px-4 py-3 border-b border-[#1a1a2e]">
            <p className="text-[10px] text-[#4a4a6a] tracking-widest uppercase mb-2 font-mono">View Mode</p>
            <div className="flex gap-2 flex-wrap">
              {MODES.map(m => (
                <button key={m.id} onClick={() => { setMode(m.id); setMobileOpen(false); }}
                  className="px-3 py-1 text-[10px] font-mono tracking-widest uppercase rounded border transition-all"
                  style={{
                    borderColor: mode === m.id ? m.color : '#1a1a2e',
                    color:       mode === m.id ? m.color : '#8888aa',
                    background:  mode === m.id ? `${m.color}10` : 'transparent',
                  }}>
                  {m.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
