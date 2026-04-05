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
    <header className="fixed top-0 inset-x-0 z-50 bg-void/80 backdrop-blur-sm border-b border-border">
      <nav className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="font-display text-sm tracking-widest text-neon hover:text-neon-glow transition-all">
          RJ<span className="text-ghost">://</span>
        </Link>
        <ul className="hidden md:flex items-center gap-1">
          {LINKS.map(l => {
            const active = pathname.startsWith(l.href);
            return (
              <li key={l.href}>
                <Link href={l.href}
                  className={`px-3 py-1 text-xs tracking-widest uppercase transition-colors
                    ${active ? 'text-neon border-b border-neon' : 'text-ghost hover:text-snow'}`}>
                  {l.label}
                </Link>
              </li>
            );
          })}
        </ul>
        <div className="hidden md:flex gap-3 text-xs text-muted">
          <span title="Command palette">⌘K</span>
          <span title="Terminal">~</span>
        </div>
        <button className="md:hidden text-ghost hover:text-snow" onClick={() => setOpen(o => !o)}>
          {open ? '✕' : '☰'}
        </button>
      </nav>
      {open && (
        <div className="md:hidden bg-surface border-t border-border px-4 pb-4">
          {LINKS.map(l => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)}
              className="block py-3 text-sm text-ghost hover:text-neon border-b border-border transition-colors">
              &gt; {l.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}