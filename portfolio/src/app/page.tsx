'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useVisitorMode, type VisitorMode } from '@/components/ui/VisitorModeProvider';
import { NavBar }          from '@/components/layout/NavBar';
import { WebGLBackground } from '@/components/sections/WebGLBackground';
import { AIAssistant }     from '@/components/sections/AIAssistant';

const STATUSES = [
  'Currently building: this portfolio.',
  'Reading: CLRS Algorithms.',
  'Open to: BSc CSE in Türkiye.',
  'Last commit: today.',
  'Status: caffeinated and building.',
];

const BENTO = [
  { href: '/lab',     label: '// THE LAB',     sub: 'Projects & builds',      color: '#00ff88', size: 'md:col-span-2', icon: '⚗', preview: 'AgriBase · HAYTHAM X ONE · DCMD' },
  { href: '/archive', label: '// THE ARCHIVE',  sub: 'Research & academic',    color: '#00d4ff', size: 'md:col-span-1', icon: '◈', preview: 'CERN · BdJSO · IYMC' },
  { href: '/inkwell', label: '// THE INKWELL',  sub: 'Writing & poetry',       color: '#a78bfa', size: 'md:col-span-1', icon: '✦', preview: 'Essays · Verse · Thoughts' },
  { href: '/visuals', label: '// VISUALS',      sub: 'Photography & art',      color: '#fb923c', size: 'md:col-span-1', icon: '◎', preview: 'Gallery · Generative' },
  { href: '/map',     label: '// COORDINATES',  sub: 'Bangladesh on the grid', color: '#34d399', size: 'md:col-span-2', icon: '◉', preview: 'Dinajpur · Rajshahi · Dhaka' },
  { href: '/contact', label: '// TRANSMISSION', sub: 'Get in touch',           color: '#f472b6', size: 'md:col-span-1', icon: '▶', preview: 'Open for opportunities' },
];

// ── Mode switcher pill ─────────────────────────────────────────────────────
function ModeSwitcher({ mode, setMode, dark }: { mode: VisitorMode; setMode: (m: VisitorMode) => void; dark: boolean }) {
  const modes: { id: VisitorMode; label: string }[] = [
    { id: 'recruiter', label: 'Recruiter' },
    { id: 'developer', label: 'Developer' },
    { id: 'friend',    label: 'Friend'    },
  ];
  return (
    <div className={`fixed top-3 left-1/2 -translate-x-1/2 z-[300] flex gap-1 rounded-full px-2 py-1.5 shadow-lg border
      ${dark
        ? 'bg-panel/90 backdrop-blur-sm border-border'
        : 'bg-white/90 backdrop-blur-sm border-gray-200'}`}>
      {modes.map(m => (
        <button
          key={m.id}
          onClick={() => setMode(m.id)}
          className={`text-[10px] px-3 py-1 rounded-full transition-all font-medium capitalize
            ${mode === m.id
              ? dark ? 'bg-neon text-void' : 'bg-gray-900 text-white'
              : dark ? 'text-ghost hover:text-snow' : 'text-gray-400 hover:text-gray-800'}`}
        >
          {m.label}
        </button>
      ))}
    </div>
  );
}

// ── RECRUITER MODE ─────────────────────────────────────────────────────────
function RecruiterPage({ onAI, darkMode }: { onAI: () => void; darkMode: boolean }) {
  const bg   = darkMode ? '#0a0a0a' : '#ffffff';
  const fg   = darkMode ? '#e8e8e8' : '#111111';
  const sub  = darkMode ? '#999999' : '#666666';
  const card = darkMode ? '#141414' : '#f9f9f9';
  const bdr  = darkMode ? '#222222' : '#e5e5e5';

  return (
    <div className="min-h-screen transition-colors duration-300" style={{ background: bg, color: fg, fontFamily: "'Space Grotesk', sans-serif" }}>
      {/* Minimal nav */}
      <header className="fixed top-0 inset-x-0 z-50 h-14 flex items-center px-8 justify-between border-b"
        style={{ background: bg, borderColor: bdr }}>
        <span style={{ fontFamily: "'Orbitron', monospace", fontSize: '0.75rem', letterSpacing: '0.2em', color: sub }}>
          RAFSAN JANI
        </span>
        <nav className="flex gap-6">
          {[['Resume', '/resume.pdf'], ['Lab', '/lab'], ['Contact', '/contact']].map(([l, h]) => (
            <a key={l} href={h} className="text-xs tracking-widest uppercase transition-colors hover:opacity-60" style={{ color: sub }}>{l}</a>
          ))}
        </nav>
      </header>

      <main className="max-w-4xl mx-auto px-8 pt-28 pb-20">
        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="mb-20">
          <p className="text-xs tracking-[0.3em] uppercase mb-5" style={{ color: sub }}>Engineering Aspirant · Bangladesh</p>
          <h1 className="font-bold leading-none mb-6" style={{ fontSize: 'clamp(3rem, 10vw, 6rem)', fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 300 }}>
            Rafsan<br />Jani
          </h1>
          <p className="text-lg leading-relaxed mb-10 max-w-xl" style={{ color: sub }}>
            Top 0.01% nationally. Builder of precision agriculture systems, CERN particle physics experiments, and sustainable infrastructure technology.
          </p>
          <div className="flex gap-4 flex-wrap">
            <a href="/resume.pdf"
              className="inline-block px-8 py-3 text-xs tracking-widest uppercase transition-all hover:opacity-80"
              style={{ background: fg, color: bg }}>
              Download Resume
            </a>
            <button onClick={onAI}
              className="inline-block px-8 py-3 text-xs tracking-widest uppercase border transition-all hover:opacity-60"
              style={{ borderColor: bdr, color: sub }}>
              Ask AI About Me
            </button>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-px mb-20" style={{ background: bdr }}>
          {[
            { v: '17th',   l: 'National Rank',        d: 'of 180,000+ students' },
            { v: '5.00',   l: 'HSC GPA',              d: 'Perfect — twice' },
            { v: '297',    l: 'Cadets Led',            d: 'As College Prefect' },
            { v: 'Bronze', l: 'Innovation World Cup',  d: 'AgriBase project' },
          ].map(s => (
            <div key={s.l} className="p-6 transition-colors" style={{ background: bg }}>
              <div className="text-3xl font-light mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>{s.v}</div>
              <div className="text-xs font-medium mb-1" style={{ color: fg }}>{s.l}</div>
              <div className="text-xs" style={{ color: sub }}>{s.d}</div>
            </div>
          ))}
        </motion.div>

        {/* Projects */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="mb-20">
          <h2 className="text-xl font-light mb-6 pb-3 border-b" style={{ fontFamily: "'Playfair Display', serif", borderColor: bdr }}>Selected Projects</h2>
          {[
            { t: 'AgriBase',          r: 'Engineer',    a: 'Bronze — Innovation World Cup BD', d: 'Converted 50,000+ agricultural records into a predictive database using Bayesian Regression.' },
            { t: 'CERN Beamline',     r: 'Researcher',  a: 'International Competition',       d: 'Designed experiment using SiPMs and BC-408 scintillators to verify relativistic time dilation.' },
            { t: 'HAYTHAM X ONE',     r: 'Architect',   a: 'Original Research',               d: 'Framework integrating CSP solar with AI management and hydrogen production.' },
          ].map(p => (
            <div key={p.t} className="py-5 border-b flex gap-6 items-start" style={{ borderColor: bdr }}>
              <div className="flex-1">
                <div className="flex items-baseline gap-3 mb-1">
                  <h3 className="font-medium">{p.t}</h3>
                  <span className="text-xs" style={{ color: sub }}>{p.r}</span>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: sub }}>{p.d}</p>
              </div>
              <span className="text-xs whitespace-nowrap flex-shrink-0 pt-0.5" style={{ color: sub }}>{p.a}</span>
            </div>
          ))}
        </motion.div>

        {/* Skills */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
          <h2 className="text-xl font-light mb-4 pb-3 border-b" style={{ fontFamily: "'Playfair Display', serif", borderColor: bdr }}>Technical Skills</h2>
          <div className="flex flex-wrap gap-2">
            {['Python', 'C/C++', 'Flask', 'HTML/CSS', 'Arduino', 'Raspberry Pi', 'ESP32', 'Adobe Suite', 'GitHub'].map(s => (
              <span key={s} className="px-3 py-1 text-xs border" style={{ borderColor: bdr, color: sub }}>{s}</span>
            ))}
          </div>
        </motion.div>

        {/* Contact footer */}
        <div className="mt-16 pt-8 border-t flex gap-8 text-xs flex-wrap" style={{ borderColor: bdr, color: sub }}>
          <a href="mailto:rafsan2972jani@gmail.com" className="hover:opacity-60 transition-opacity">rafsan2972jani@gmail.com</a>
          <a href="https://github.com/rafsan-j" target="_blank" rel="noreferrer" className="hover:opacity-60 transition-opacity">github.com/rafsan-j</a>
          <a href="https://linkedin.com/in/ralsan-jani72" target="_blank" rel="noreferrer" className="hover:opacity-60 transition-opacity">LinkedIn</a>
          <span>Dinajpur, Bangladesh</span>
        </div>
      </main>
    </div>
  );
}

// ── FRIEND MODE ────────────────────────────────────────────────────────────
function FriendPage({ onAI, darkMode }: { onAI: () => void; darkMode: boolean }) {
  const bg   = darkMode ? '#0f0a1a' : '#fdf2f8';
  const card = darkMode ? '#1a0f2e' : '#ffffff';
  const fg   = darkMode ? '#e2d9f3' : '#1e293b';
  const sub  = darkMode ? '#9d7fc9' : '#64748b';
  const bdr  = darkMode ? '#2d1f4a' : '#e2e8f0';
  const acc  = '#f472b6';

  return (
    <div className="min-h-screen transition-colors duration-300" style={{ background: bg, color: fg, fontFamily: "'Space Grotesk', sans-serif" }}>
      {/* Friendly nav */}
      <header className="fixed top-0 inset-x-0 z-50 h-14 flex items-center px-6 justify-between border-b"
        style={{ background: `${bg}e0`, backdropFilter: 'blur(12px)', borderColor: bdr }}>
        <span style={{ fontFamily: 'Georgia, serif', fontSize: '1.1rem', color: acc, fontStyle: 'italic' }}>Rafsan ✨</span>
        <div className="flex gap-4">
          {[['Lab', '#8b5cf6'], ['Inkwell', '#f472b6'], ['Contact', '#06b6d4']].map(([l, c]) => (
            <Link key={l} href={`/${l.toLowerCase()}`} className="text-sm font-medium transition-opacity hover:opacity-70" style={{ color: c }}>{l}</Link>
          ))}
        </div>
      </header>

      <main className="max-w-xl mx-auto px-6 pt-24 pb-20">
        {/* Avatar + greeting */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
          <div className="text-center mb-10">
            <div className="w-20 h-20 rounded-full mx-auto mb-5 flex items-center justify-center text-3xl"
              style={{ background: 'linear-gradient(135deg, #f472b6, #a78bfa, #60a5fa)', boxShadow: '0 8px 30px rgba(244,114,182,0.3)' }}>
              👋
            </div>
            <h1 className="font-bold mb-2" style={{ fontSize: '2rem', fontFamily: 'Georgia, serif', fontWeight: 400 }}>
              Hey, I'm Rafsan!
            </h1>
            <p className="leading-relaxed" style={{ color: sub, fontSize: '1rem' }}>
              Student, builder, occasional poet. I love making things — from apps to physics experiments. Welcome!
            </p>
          </div>

          {/* Fun cards */}
          <div className="grid grid-cols-2 gap-3 mb-8">
            {[
              { e: '🏆', t: 'Top 0.01%',   b: 'National Merit List — out of 180,000+ students.',     bg: darkMode ? '#1a1500' : '#fefce8', bd: darkMode ? '#4a3800' : '#fde047' },
              { e: '🔬', t: 'CERN Exp.',   b: 'Designed a real particle physics experiment.',          bg: darkMode ? '#001a10' : '#f0fdf4', bd: darkMode ? '#004428' : '#86efac' },
              { e: '🌱', t: 'AgriBase',    b: 'Agriculture app. Bronze medal. 50k+ records.',          bg: darkMode ? '#001020' : '#eff6ff', bd: darkMode ? '#002244' : '#93c5fd' },
              { e: '⚡', t: '297 Cadets',  b: 'Led the whole cadet college as College Prefect.',       bg: darkMode ? '#1a0020' : '#fdf4ff', bd: darkMode ? '#440050' : '#d8b4fe' },
            ].map(c => (
              <motion.div key={c.t} whileHover={{ y: -3 }} transition={{ type: 'spring', stiffness: 400 }}
                className="rounded-2xl p-4" style={{ background: c.bg, border: `1.5px solid ${c.bd}` }}>
                <div className="text-2xl mb-2">{c.e}</div>
                <p className="font-semibold text-sm mb-1" style={{ color: fg }}>{c.t}</p>
                <p className="text-xs leading-relaxed" style={{ color: sub }}>{c.b}</p>
              </motion.div>
            ))}
          </div>

          {/* Currently */}
          <div className="rounded-2xl p-5 mb-8" style={{ background: card, border: `1.5px solid ${bdr}` }}>
            <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: sub }}>Right now I'm...</p>
            {[
              ['💻', 'Building this portfolio (meta, I know)'],
              ['📚', 'Studying algorithms & data structures'],
              ['🌍', 'Planning for university in Türkiye'],
              ['☕', 'Surviving on tea and curiosity'],
            ].map(([e, t]) => (
              <div key={t} className="flex items-center gap-3 py-2 text-sm" style={{ color: sub }}>
                <span className="text-xl">{e}</span> {t}
              </div>
            ))}
          </div>

          {/* CTAs */}
          <div className="flex gap-3">
            <Link href="/contact"
              className="flex-1 text-center py-3 px-6 rounded-full font-semibold text-white text-sm transition-transform hover:scale-105"
              style={{ background: 'linear-gradient(135deg, #f472b6, #a78bfa)' }}>
              Say Hello! 💌
            </Link>
            <button onClick={onAI}
              className="flex-1 py-3 px-6 rounded-full font-semibold text-sm border-2 transition-opacity hover:opacity-70"
              style={{ borderColor: '#a78bfa', color: '#a78bfa', background: 'transparent' }}>
              Ask AI ✨
            </button>
          </div>
        </motion.div>
      </main>
    </div>
  );
}

// ── DEVELOPER MODE ─────────────────────────────────────────────────────────
function DeveloperPage({ onAI }: { onAI: () => void }) {
  const [statusIdx, setStatusIdx] = useState(0);
  const [time, setTime]           = useState('');
  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString('en-US', { timeZone: 'Asia/Dhaka', hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    tick(); const id = setInterval(tick, 1000); return () => clearInterval(id);
  }, []);
  useEffect(() => {
    const id = setInterval(() => setStatusIdx(i => (i + 1) % STATUSES.length), 3500);
    return () => clearInterval(id);
  }, []);

  return (
    <>
      <WebGLBackground />
      <NavBar />
      <main className="relative z-10 min-h-screen px-4 pt-24 pb-16 max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <span className="status-dot" />
            <span className="text-neon text-xs tracking-widest">DEVELOPER MODE</span>
            <span className="text-ghost text-xs ml-auto">BD / {time}</span>
          </div>

          {/* RAFSAN glitches (primary name), JANI is steady */}
          <h1 className="font-display text-5xl md:text-7xl font-bold mb-2 leading-none tracking-tight">
            <span className="text-neon-glow glitch" data-text="RAFSAN">RAFSAN</span>
            <span className="text-snow"> JANI</span>
          </h1>

          <p className="text-ghost text-sm tracking-[0.3em] uppercase mb-6">Engineering Aspirant &nbsp;·&nbsp; CS Student &nbsp;·&nbsp; Builder</p>
          <AnimatePresence mode="wait">
            <motion.p key={statusIdx} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-xs text-ghost tracking-widest mb-8">
              &gt;&nbsp;<span className="text-neon">{STATUSES[statusIdx]}</span><span className="cursor" />
            </motion.p>
          </AnimatePresence>
          <div className="flex gap-4 flex-wrap">
            <a href="https://github.com/rafsan-j" target="_blank" rel="noreferrer" className="btn-neon"><span>View GitHub →</span></a>
            <button onClick={onAI} className="btn-neon" style={{ borderColor: '#4a4a6a', color: '#8888aa' }}><span>Ask AI ✦</span></button>
          </div>
        </motion.div>

        {/* Bento */}
        <section className="mb-12">
          <p className="text-ghost text-xs tracking-widest mb-4">// NAVIGATE</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {BENTO.map((cell, i) => (
              <motion.div key={cell.href} className={cell.size}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
                <Link href={cell.href} className="block">
                  <div className="panel panel-accent p-5 group cursor-pointer transition-all duration-300 hover:shadow-neon min-h-[130px] flex flex-col">
                    <div className="flex items-start justify-between mb-3">
                      <span className="font-display text-xs tracking-widest" style={{ color: cell.color }}>{cell.label}</span>
                      <span className="text-xl opacity-30 group-hover:opacity-70 transition-opacity">{cell.icon}</span>
                    </div>
                    <p className="text-snow text-sm mb-auto">{cell.sub}</p>
                    <p className="text-xs text-muted mt-3 group-hover:text-ghost transition-colors">{cell.preview}</p>
                    <div className="absolute bottom-0 left-0 h-px w-0 group-hover:w-full transition-all duration-500" style={{ background: cell.color }} />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

        <div className="text-center text-ghost text-xs tracking-widest border-t border-border pt-8">
          Press <kbd className="bg-surface border border-border px-1 rounded">` </kbd> terminal &nbsp;·&nbsp;
          <kbd className="bg-surface border border-border px-1 rounded">⌘K</kbd> commands
        </div>
      </main>
    </>
  );
}

// ── ROOT ───────────────────────────────────────────────────────────────────
export default function HomePage() {
  const { mode, setMode } = useVisitorMode();
  const [showAI, setShowAI]       = useState(false);
  const [darkMode, setDarkMode]   = useState(true);

  // Persist dark mode preference per non-dev mode
  useEffect(() => {
    const saved = localStorage.getItem('pf_dark');
    if (saved !== null) setDarkMode(saved === '1');
  }, []);
  const toggleDark = () => {
    const next = !darkMode;
    setDarkMode(next);
    localStorage.setItem('pf_dark', next ? '1' : '0');
  };

  return (
    <>
      {/* Mode switcher — always visible */}
      <ModeSwitcher mode={mode} setMode={setMode} dark={mode === 'developer' || (mode !== 'developer' && darkMode)} />

      {/* Dark mode toggle — only for recruiter + friend */}
      {mode !== 'developer' && (
        <button
          onClick={toggleDark}
          className="fixed top-3 right-4 z-[300] text-xs px-3 py-1.5 rounded-full border transition-colors"
          style={{
            background: darkMode ? '#1a1a2e' : '#ffffff',
            borderColor: darkMode ? '#333' : '#e5e5e5',
            color: darkMode ? '#aaa' : '#555',
          }}
        >
          {darkMode ? '☀ Light' : '◑ Dark'}
        </button>
      )}

      {mode === 'recruiter' && <RecruiterPage onAI={() => setShowAI(true)} darkMode={darkMode} />}
      {mode === 'developer' && <DeveloperPage onAI={() => setShowAI(true)} />}
      {mode === 'friend'    && <FriendPage    onAI={() => setShowAI(true)} darkMode={darkMode} />}

      {showAI && <AIAssistant onClose={() => setShowAI(false)} mode={mode} />}
    </>
  );
}
