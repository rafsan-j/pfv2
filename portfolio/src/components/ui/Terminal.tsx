'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

const CMDS: Record<string, string[]> = {
  help: ['Available commands:', '  help · ls · whoami · cat about.txt', '  cat skills.txt · cat awards.txt', '  cd <route> · clear · exit'],
  ls:   ['drwxr-xr-x  /lab      → Projects', 'drwxr-xr-x  /archive  → Research', 'drwxr-xr-x  /inkwell  → Writing', 'drwxr-xr-x  /visuals  → Gallery', 'drwxr-xr-x  /map      → BD Map', 'drwxr-xr-x  /contact  → Contact'],
  whoami: ['rafsan-jani', 'Engineering Aspirant | CS Student | Builder', 'Top 0.01% National Merit (HSC 2025)', 'College Prefect — Rajshahi Cadet College', 'Dinajpur, Bangladesh'],
  'cat about.txt': ["Hello. I'm Rafsan Jani.", '', 'Graduate of Rajshahi Cadet College.', 'College Prefect — led 297 cadets.', '', 'Building at the intersection of AI', 'and sustainable infrastructure.', '', '"The world deserves leaders who are', ' both capable and principled."'],
  'cat skills.txt': ['PROGRAMMING:  Python · C/C++ · HTML · CSS', 'HARDWARE:     Arduino · Raspberry Pi · ESP32', 'DESIGN:       Adobe Illustrator · Photoshop', 'LANGUAGES:    Bengali (Native) · English (C1) · Arabic'],
  'cat awards.txt': ['[Silver]  IYMC International Math Challenge 2024', '[Winner]  BdJSO National Science Olympiad 2020', '[Qualify] IAAC Astronomy Competition 2022', '[1st]     TIB Anti-Corruption National 2022', '[Green]   ISSB — Army Officer Recommended', '[Bronze]  Innovation World Cup BD — AgriBase', '[CERN]    Beamline for Schools Experiment'],
};

export function Terminal() {
  const [open, setOpen]             = useState(false);
  const [history, setHistory]       = useState<{ cmd: string; out: string[] }[]>([
    { cmd: '', out: ['RJ Terminal v1.0.0  — type "help" for commands', ''] },
  ]);
  const [input, setInput]           = useState('');
  const [cmdHist, setCmdHist]       = useState<string[]>([]);
  const [histIdx, setHistIdx]       = useState(-1);
  const inputRef  = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const router    = useRouter();

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === '`') { e.preventDefault(); setOpen(o => !o); }
      if (e.key === 'Escape' && open) setOpen(false);
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [open]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [open, history]);

  const run = () => {
    const cmd = input.trim().toLowerCase();
    if (!cmd) return;
    setCmdHist(h => [cmd, ...h]);
    setHistIdx(-1);
    setInput('');

    if (cmd.startsWith('cd ')) {
      const route = '/' + cmd.slice(3).replace(/^\//, '');
      const valid = ['/lab', '/archive', '/inkwell', '/visuals', '/map', '/contact'];
      if (valid.includes(route)) {
        setHistory(h => [...h, { cmd, out: [`→ Navigating to ${route}...`] }]);
        setTimeout(() => { router.push(route); setOpen(false); }, 500);
      } else {
        setHistory(h => [...h, { cmd, out: [`cd: ${route}: not found. Run ls for routes.`] }]);
      }
      return;
    }
    if (cmd === 'clear') { setHistory([{ cmd: '', out: ['Cleared.'] }]); return; }
    if (cmd === 'exit')  { setHistory(h => [...h, { cmd, out: ['Goodbye.'] }]); setTimeout(() => setOpen(false), 400); return; }
    const out = CMDS[cmd] ?? [`"${cmd}": command not found. Try "help".`];
    setHistory(h => [...h, { cmd, out }]);
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter')     { run(); return; }
    if (e.key === 'Escape')    { setOpen(false); return; }
    if (e.key === 'ArrowUp')   { const i = Math.min(histIdx + 1, cmdHist.length - 1); setHistIdx(i); setInput(cmdHist[i] ?? ''); }
    if (e.key === 'ArrowDown') { const i = Math.max(histIdx - 1, -1); setHistIdx(i); setInput(i < 0 ? '' : cmdHist[i]); }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          className="fixed bottom-0 inset-x-0 z-[100] h-80 bg-surface border-t border-neon/30 font-mono text-xs">
          <div className="flex items-center justify-between px-4 h-8 border-b border-border bg-panel">
            <div className="flex gap-1.5">
              <span className="w-3 h-3 rounded-full bg-red-500/70" />
              <span className="w-3 h-3 rounded-full bg-amber/70" />
              <span className="w-3 h-3 rounded-full bg-neon/70" />
            </div>
            <span className="text-ghost tracking-widest text-[10px]">RJ-TERMINAL — ` to toggle</span>
            <button onClick={() => setOpen(false)} className="text-ghost hover:text-snow">✕</button>
          </div>
          <div className="h-[calc(100%-4.25rem)] overflow-y-auto px-4 pt-3 space-y-1">
            {history.map((h, i) => (
              <div key={i}>
                {h.cmd && (
                  <p><span className="text-ghost">rafsan</span><span className="text-muted">@</span>
                    <span className="text-cyan">portfolio</span><span className="text-muted">:~$</span>
                    <span className="text-snow ml-1">{h.cmd}</span></p>
                )}
                {h.out.map((line, j) => <p key={j} className="text-ghost">{line || '\u00a0'}</p>)}
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
          <div className="flex items-center gap-1 px-4 h-9 border-t border-border bg-panel">
            <span className="text-ghost">rafsan</span><span className="text-muted">@</span>
            <span className="text-cyan">portfolio</span><span className="text-muted">:~$</span>
            <input ref={inputRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={onKey}
              className="flex-1 bg-transparent text-snow outline-none caret-neon ml-1"
              autoComplete="off" spellCheck={false} />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
