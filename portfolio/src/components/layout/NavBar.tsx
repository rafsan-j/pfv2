'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const LINKS = [
  { href: '/lab',     label: 'Lab'     },
  { href: '/archive', label: 'Archive' },
  { href: '/inkwell', label: 'Inkwell' },
  { href: '/visuals', label: 'Visuals' },
  { href: '/map',     label: 'Map'     },
  { href: '/contact', label: 'Contact' },
];

export function NavBar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-void/80 backdrop-blur-sm border-b border-[#1a1a2e]">
      <nav className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="font-display text-sm tracking-widest text-[#00ff88] hover:opacity-80 transition-all">
          RJ<span className="text-[#8888aa]">://</span>
        </Link>
        <ul className="hidden md:flex items-center gap-1">
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
        <div className="hidden md:flex gap-3 text-xs text-[#4a4a6a] font-mono">
          <span title="Command palette">⌘K</span>
          <span title="Terminal">~</span>
        </div>
        <button className="md:hidden text-[#8888aa] hover:text-[#e8e8f0]" onClick={() => setOpen(o => !o)}>
          {open ? '✕' : '☰'}
        </button>
      </nav>
      {open && (
        <div className="md:hidden bg-[#0d0d12] border-t border-[#1a1a2e] px-4 pb-4">
          {LINKS.map(l => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)}
              className="block py-3 text-sm text-[#8888aa] hover:text-[#00ff88] border-b border-[#1a1a2e] transition-colors font-mono">
              &gt; {l.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
