'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

const ACTIONS = [
  { id: 'home',     label: 'Go Home',            hint: '/',        type: 'nav'      },
  { id: 'lab',      label: 'Open The Lab',        hint: '/lab',     type: 'nav'      },
  { id: 'archive',  label: 'Open The Archive',    hint: '/archive', type: 'nav'      },
  { id: 'inkwell',  label: 'Open The Inkwell',    hint: '/inkwell', type: 'nav'      },
  { id: 'visuals',  label: 'Open Visuals',        hint: '/visuals', type: 'nav'      },
  { id: 'map',      label: 'View Bangladesh Map', hint: '/map',     type: 'nav'      },
  { id: 'contact',  label: 'Contact Rafsan',      hint: '/contact', type: 'nav'      },
  { id: 'resume',   label: 'Download Resume',     hint: 'PDF',      type: 'action'   },
  { id: 'github',   label: 'Open GitHub',         hint: 'rafsan-j', type: 'external' },
  { id: 'email',    label: 'Send Email',          hint: 'gmail',    type: 'external' },
  { id: 'terminal', label: 'Toggle Terminal',     hint: '`',        type: 'action'   },
];
const TC: Record<string, string> = { nav: '#00ff88', action: '#ffb400', external: '#00d4ff' };

export function CommandPalette() {
  const [open, setOpen]     = useState(false);
  const [query, setQuery]   = useState('');
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router   = useRouter();

  const filtered = ACTIONS.filter(a => a.label.toLowerCase().includes(query.toLowerCase()));

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setOpen(o => !o); }
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, []);

  useEffect(() => { if (open) { inputRef.current?.focus(); setQuery(''); setActive(0); } }, [open]);

  const execute = (a: (typeof ACTIONS)[0]) => {
    setOpen(false);
    const nav: Record<string, string> = { home: '/', lab: '/lab', archive: '/archive', inkwell: '/inkwell', visuals: '/visuals', map: '/map', contact: '/contact' };
    if (nav[a.id]) { router.push(nav[a.id]); return; }
    if (a.id === 'resume')   { window.open('/resume.pdf'); return; }
    if (a.id === 'github')   { window.open('https://github.com/rafsan-j'); return; }
    if (a.id === 'email')    { window.location.href = 'mailto:rafsan2972jani@gmail.com'; return; }
    if (a.id === 'terminal') { window.dispatchEvent(new KeyboardEvent('keydown', { key: '`', bubbles: true })); }
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive(i => Math.min(i + 1, filtered.length - 1)); }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setActive(i => Math.max(i - 1, 0)); }
    if (e.key === 'Enter' && filtered[active]) execute(filtered[active]);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] bg-void/70 backdrop-blur-sm flex items-start justify-center pt-[18vh] px-4"
          onClick={e => e.target === e.currentTarget && setOpen(false)}>
          <motion.div initial={{ scale: .96, y: -8 }} animate={{ scale: 1, y: 0 }} exit={{ scale: .96 }}
            className="panel w-full max-w-lg overflow-hidden"
            style={{ boxShadow: '0 0 0 1px rgba(0,255,136,.2), 0 30px 60px rgba(0,0,0,.8)' }}>
            <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
              <span className="text-ghost">⌘</span>
              <input ref={inputRef} value={query}
                onChange={e => { setQuery(e.target.value); setActive(0); }}
                onKeyDown={onKey} placeholder="Search commands..."
                className="flex-1 bg-transparent text-sm text-snow outline-none placeholder:text-muted font-mono" />
              <kbd className="text-[10px] px-1.5 py-0.5 border border-border rounded text-ghost">ESC</kbd>
            </div>
            <div className="max-h-64 overflow-y-auto py-1">
              {filtered.length === 0 && <p className="text-center text-ghost text-xs py-6">No results.</p>}
              {filtered.map((a, i) => (
                <button key={a.id} onClick={() => execute(a)} onMouseEnter={() => setActive(i)}
                  className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors ${i === active ? 'bg-surface' : ''}`}>
                  <span className={i === active ? 'text-snow' : 'text-ghost'}>{a.label}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded border"
                    style={{ color: TC[a.type], borderColor: `${TC[a.type]}40`, background: `${TC[a.type]}0d` }}>
                    {a.hint}
                  </span>
                </button>
              ))}
            </div>
            <div className="px-4 py-2 border-t border-border text-[10px] text-muted flex gap-4">
              <span>↑↓ navigate</span><span>↵ open</span><span>ESC close</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
