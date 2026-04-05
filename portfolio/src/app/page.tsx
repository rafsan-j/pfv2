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

const MODES: { id: VisitorMode; label: string }[] = [
  { id: 'recruiter', label: 'Recruiter' },
  { id: 'developer', label: 'Developer' },
  { id: 'friend',    label: 'Friend'    },
];

// ── Mode switcher — position depends on whether NavBar is present ─────────
function ModeSwitcher({
  mode, setMode, isDev, darkMode, showDark, toggleDark,
}: {
  mode: VisitorMode; setMode: (m: VisitorMode) => void;
  isDev: boolean; darkMode: boolean; showDark: boolean; toggleDark: () => void;
}) {
  // Dev mode: goes BELOW the NavBar (top: 56px = h-14 = 3.5rem)
  // Recruiter/friend: the NavBar isn't rendered, so we sit at top
  const topPos = isDev ? '58px' : '10px';

  return (
    <div style={{
      position:       'fixed',
      top:            topPos,
      left:           '50%',
      transform:      'translateX(-50%)',
      zIndex:         300,
      display:        'flex',
      alignItems:     'center',
      gap:            '4px',
      padding:        '4px 6px',
      borderRadius:   '999px',
      background:     isDev ? 'rgba(13,13,18,0.95)' : darkMode ? 'rgba(15,15,15,0.95)' : 'rgba(255,255,255,0.95)',
      border:         isDev ? '1px solid #1a1a2e' : darkMode ? '1px solid #333' : '1px solid #e2e2e2',
      backdropFilter: 'blur(12px)',
      boxShadow:      '0 2px 16px rgba(0,0,0,0.4)',
      whiteSpace:     'nowrap',
    }}>
      {MODES.map(m => (
        <button key={m.id} onClick={() => setMode(m.id)} style={{
          fontSize:     '10px',
          padding:      '4px 12px',
          borderRadius: '999px',
          border:       'none',
          cursor:       'pointer',
          fontWeight:   500,
          transition:   'all 0.2s',
          background:   mode === m.id
            ? (isDev ? '#00ff88' : darkMode ? '#e8e8e8' : '#111')
            : 'transparent',
          color: mode === m.id
            ? (isDev ? '#050505' : darkMode ? '#111' : '#fff')
            : (isDev ? '#8888aa' : darkMode ? '#888' : '#666'),
        }}>
          {m.label}
        </button>
      ))}
      {showDark && (
        <>
          <div style={{ width: '1px', height: '14px', background: isDev ? '#1a1a2e' : darkMode ? '#444' : '#ddd', margin: '0 2px' }} />
          <button onClick={toggleDark} style={{
            fontSize:     '10px',
            padding:      '4px 10px',
            borderRadius: '999px',
            border:       'none',
            cursor:       'pointer',
            background:   'transparent',
            color:        isDev ? '#8888aa' : darkMode ? '#888' : '#666',
          }}>
            {darkMode ? '☀' : '◑'}
          </button>
        </>
      )}
    </div>
  );
}

// ── RECRUITER MODE ─────────────────────────────────────────────────────────
function RecruiterPage({ onAI, darkMode }: { onAI: () => void; darkMode: boolean }) {
  const bg  = darkMode ? '#0a0a0a' : '#ffffff';
  const fg  = darkMode ? '#e8e8e8' : '#111111';
  const sub = darkMode ? '#999999' : '#666666';
  const bdr = darkMode ? '#222222' : '#e5e5e5';

  return (
    <div style={{ minHeight: '100vh', background: bg, color: fg, fontFamily: "'Space Grotesk', sans-serif" }}>
      {/* Spacer so content clears the floating mode switcher pill */}
      <div style={{ height: '56px' }} />

      <main style={{ maxWidth: '900px', margin: '0 auto', padding: '3rem 2rem 5rem' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} style={{ marginBottom: '5rem' }}>
          <p style={{ fontSize: '0.7rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: sub, marginBottom: '1.25rem' }}>
            Engineering Aspirant · Bangladesh
          </p>
          <h1 style={{ fontSize: 'clamp(3rem,10vw,6rem)', fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 300, lineHeight: 1, marginBottom: '1.5rem' }}>
            Rafsan<br />Jani
          </h1>
          <p style={{ fontSize: '1.1rem', lineHeight: 1.7, color: sub, marginBottom: '2.5rem', maxWidth: '36rem' }}>
            Top 0.01% nationally. Builder of precision agriculture systems, CERN particle physics experiments, and sustainable infrastructure technology.
          </p>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <a href="/resume.pdf" style={{ display: 'inline-block', padding: '12px 32px', fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase', background: fg, color: bg, textDecoration: 'none' }}>
              Download Resume
            </a>
            <button onClick={onAI} style={{ padding: '12px 32px', fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase', border: `1px solid ${bdr}`, color: sub, background: 'transparent', cursor: 'pointer' }}>
              Ask AI About Me
            </button>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1px', background: bdr, marginBottom: '5rem' }}>
          {[
            { v: '17th',   l: 'National Rank',       d: 'of 180,000+ students' },
            { v: '5.00',   l: 'HSC GPA',             d: 'Perfect — twice'      },
            { v: '297',    l: 'Cadets Led',           d: 'As College Prefect'   },
            { v: 'Bronze', l: 'Innovation World Cup', d: 'AgriBase project'     },
          ].map(s => (
            <div key={s.l} style={{ padding: '1.5rem', background: bg }}>
              <div style={{ fontSize: '2rem', fontFamily: "'Playfair Display',serif", fontWeight: 300, marginBottom: '4px' }}>{s.v}</div>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, marginBottom: '4px' }}>{s.l}</div>
              <div style={{ fontSize: '0.7rem', color: sub }}>{s.d}</div>
            </div>
          ))}
        </motion.div>

        {/* Projects */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} style={{ marginBottom: '5rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontFamily: "'Playfair Display',serif", fontWeight: 300, paddingBottom: '0.75rem', borderBottom: `1px solid ${bdr}`, marginBottom: '0' }}>
            Selected Projects
          </h2>
          {[
            { t: 'AgriBase',      r: 'Engineer',   a: 'Bronze — Innovation World Cup BD', d: 'Converted 50,000+ agricultural records into a predictive database using Bayesian Regression.' },
            { t: 'CERN Beamline', r: 'Researcher', a: 'International Competition',        d: 'Designed experiment using SiPMs and BC-408 scintillators to verify relativistic time dilation.' },
            { t: 'HAYTHAM X ONE',r: 'Architect',   a: 'Original Research',                d: 'Framework integrating CSP solar with AI management and hydrogen production.' },
          ].map(p => (
            <div key={p.t} style={{ padding: '1.25rem 0', borderBottom: `1px solid ${bdr}`, display: 'flex', gap: '1.5rem' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'baseline', marginBottom: '0.25rem' }}>
                  <span style={{ fontWeight: 500 }}>{p.t}</span>
                  <span style={{ fontSize: '0.7rem', color: sub }}>{p.r}</span>
                </div>
                <p style={{ fontSize: '0.85rem', lineHeight: 1.6, color: sub }}>{p.d}</p>
              </div>
              <span style={{ fontSize: '0.7rem', color: sub, whiteSpace: 'nowrap', flexShrink: 0 }}>{p.a}</span>
            </div>
          ))}
        </motion.div>

        {/* Skills */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
          <h2 style={{ fontSize: '1.25rem', fontFamily: "'Playfair Display',serif", fontWeight: 300, paddingBottom: '0.75rem', borderBottom: `1px solid ${bdr}`, marginBottom: '1rem' }}>
            Technical Skills
          </h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {['Python','C/C++','Flask','HTML/CSS','Arduino','Raspberry Pi','ESP32','Adobe Suite','GitHub'].map(s => (
              <span key={s} style={{ padding: '4px 12px', fontSize: '0.75rem', border: `1px solid ${bdr}`, color: sub }}>{s}</span>
            ))}
          </div>
        </motion.div>

        <div style={{ marginTop: '4rem', paddingTop: '2rem', borderTop: `1px solid ${bdr}`, display: 'flex', gap: '2rem', fontSize: '0.75rem', color: sub, flexWrap: 'wrap' }}>
          <a href="mailto:rafsan2972jani@gmail.com" style={{ color: sub, textDecoration: 'none' }}>rafsan2972jani@gmail.com</a>
          <a href="https://github.com/rafsan-j" target="_blank" rel="noreferrer" style={{ color: sub, textDecoration: 'none' }}>GitHub</a>
          <a href="https://linkedin.com/in/rafsan-jani72" target="_blank" rel="noreferrer" style={{ color: sub, textDecoration: 'none' }}>LinkedIn</a>
          <span>Dinajpur, Bangladesh</span>
        </div>
      </main>
    </div>
  );
}

// ── FRIEND MODE ─────────────────────────────────────────────────────────────
function FriendPage({ onAI, darkMode }: { onAI: () => void; darkMode: boolean }) {
  const bg   = darkMode ? '#0f0a1a' : '#fdf2f8';
  const card = darkMode ? '#1a0f2e' : '#ffffff';
  const fg   = darkMode ? '#e2d9f3' : '#1e293b';
  const sub  = darkMode ? '#9d7fc9' : '#64748b';
  const bdr  = darkMode ? '#2d1f4a' : '#e2e8f0';

  return (
    <div style={{ minHeight: '100vh', background: bg, color: fg, fontFamily: "'Space Grotesk', sans-serif" }}>
      {/* Spacer for mode switcher */}
      <div style={{ height: '56px' }} />

      <main style={{ maxWidth: '560px', margin: '0 auto', padding: '2rem 1.5rem 5rem' }}>
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', margin: '0 auto 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', background: 'linear-gradient(135deg,#f472b6,#a78bfa,#60a5fa)', boxShadow: '0 8px 30px rgba(244,114,182,0.3)' }}>
              👋
            </div>
            <h1 style={{ fontSize: '2rem', fontFamily: 'Georgia,serif', fontWeight: 400, marginBottom: '0.5rem' }}>
              Hey, I'm Rafsan!
            </h1>
            <p style={{ lineHeight: 1.6, color: sub }}>
              Student, builder, occasional poet. I love making things — from apps to physics experiments.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '2rem' }}>
            {[
              { e: '🏆', t: 'Top 0.01%',  b: 'National Merit — 180k+ students.',        bg: darkMode ? '#1a1500' : '#fefce8', bd: darkMode ? '#4a3800' : '#fde047' },
              { e: '🔬', t: 'CERN Exp.',  b: 'Real particle physics experiment.',         bg: darkMode ? '#001a10' : '#f0fdf4', bd: darkMode ? '#004428' : '#86efac' },
              { e: '🌱', t: 'AgriBase',   b: 'Bronze medal app. 50,000+ records.',        bg: darkMode ? '#001020' : '#eff6ff', bd: darkMode ? '#002244' : '#93c5fd' },
              { e: '⚡', t: '297 Cadets', b: 'Led entire college as College Prefect.',    bg: darkMode ? '#1a0020' : '#fdf4ff', bd: darkMode ? '#440050' : '#d8b4fe' },
            ].map(c => (
              <motion.div key={c.t} whileHover={{ y: -3 }} style={{ borderRadius: '16px', padding: '1rem', background: c.bg, border: `1.5px solid ${c.bd}` }}>
                <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{c.e}</div>
                <p style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.25rem' }}>{c.t}</p>
                <p style={{ fontSize: '0.75rem', lineHeight: 1.5, color: sub }}>{c.b}</p>
              </motion.div>
            ))}
          </div>

          <div style={{ borderRadius: '16px', padding: '1.25rem', marginBottom: '2rem', background: card, border: `1.5px solid ${bdr}` }}>
            <p style={{ fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: sub, marginBottom: '0.75rem' }}>Right now I'm...</p>
            {[
              ['💻', 'Building this portfolio'],
              ['📚', 'Studying algorithms & data structures'],
              ['🌍', 'Planning for university in Türkiye'],
              ['☕', 'Surviving on tea and curiosity'],
            ].map(([e, t]) => (
              <div key={t} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.4rem 0', fontSize: '0.875rem', color: sub }}>
                <span style={{ fontSize: '1.1rem' }}>{e}</span>{t}
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Link href="/contact" style={{ flex: 1, textAlign: 'center', padding: '12px', borderRadius: '999px', fontWeight: 600, color: 'white', fontSize: '0.875rem', background: 'linear-gradient(135deg,#f472b6,#a78bfa)', textDecoration: 'none', display: 'block' }}>
              Say Hello! 💌
            </Link>
            <button onClick={onAI} style={{ flex: 1, padding: '12px', borderRadius: '999px', fontWeight: 600, fontSize: '0.875rem', border: '2px solid #a78bfa', color: '#a78bfa', background: 'transparent', cursor: 'pointer' }}>
              Ask AI ✨
            </button>
          </div>
        </motion.div>
      </main>
    </div>
  );
}

// ── DEVELOPER MODE ──────────────────────────────────────────────────────────
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
      {/* pt-14 = NavBar height, then extra for the mode switcher pill below it */}
      <main className="relative z-10 min-h-screen px-4 pb-16 max-w-6xl mx-auto" style={{ paddingTop: '7rem' }}>
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <span className="status-dot" />
            <span className="text-xs tracking-widest font-mono" style={{ color: '#00ff88' }}>DEVELOPER MODE</span>
            <span className="text-xs ml-auto font-mono" style={{ color: '#8888aa' }}>BD / {time}</span>
          </div>
          <h1 className="font-display text-5xl md:text-7xl font-bold mb-2 leading-none tracking-tight">
            <span className="glitch" style={{ color: '#00ff88' }} data-text="RAFSAN">RAFSAN</span>
            <span style={{ color: '#e8e8f0' }}> JANI</span>
          </h1>
          <p className="text-sm tracking-[0.3em] uppercase mb-6 font-mono" style={{ color: '#8888aa' }}>
            Engineering Aspirant &nbsp;·&nbsp; CS Student &nbsp;·&nbsp; Builder
          </p>
          <AnimatePresence mode="wait">
            <motion.p key={statusIdx} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="text-xs tracking-widest mb-8 font-mono" style={{ color: '#8888aa' }}>
              &gt;&nbsp;<span style={{ color: '#00ff88' }}>{STATUSES[statusIdx]}</span><span className="cursor" />
            </motion.p>
          </AnimatePresence>
          <div className="flex gap-4 flex-wrap">
            <a href="https://github.com/rafsan-j" target="_blank" rel="noreferrer" className="btn-neon"><span>View GitHub →</span></a>
            <button onClick={onAI} className="btn-neon" style={{ borderColor: '#4a4a6a', color: '#8888aa' }}><span>Ask AI ✦</span></button>
          </div>
        </motion.div>

        <section className="mb-12">
          <p className="text-xs tracking-widest mb-4 font-mono" style={{ color: '#8888aa' }}>// NAVIGATE</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {BENTO.map((cell, i) => (
              <motion.div key={cell.href} className={cell.size}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
                <Link href={cell.href} className="block">
                  <div className="panel panel-accent p-5 group cursor-pointer transition-all duration-300 min-h-[130px] flex flex-col hover:shadow-neon">
                    <div className="flex items-start justify-between mb-3">
                      <span className="font-display text-xs tracking-widest" style={{ color: cell.color }}>{cell.label}</span>
                      <span className="text-xl opacity-30 group-hover:opacity-70 transition-opacity">{cell.icon}</span>
                    </div>
                    <p className="text-sm mb-auto" style={{ color: '#e8e8f0' }}>{cell.sub}</p>
                    <p className="text-xs mt-3 group-hover:text-ghost transition-colors font-mono" style={{ color: '#4a4a6a' }}>{cell.preview}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

        <div className="text-center text-xs tracking-widest border-t pt-8 font-mono" style={{ color: '#8888aa', borderColor: '#1a1a2e' }}>
          Press <kbd className="px-1 rounded text-[10px]" style={{ background: '#0d0d12', border: '1px solid #1a1a2e' }}>` </kbd> terminal &nbsp;·&nbsp;
          <kbd className="px-1 rounded text-[10px]" style={{ background: '#0d0d12', border: '1px solid #1a1a2e' }}>⌘K</kbd> commands
        </div>
      </main>
    </>
  );
}

// ── ROOT ─────────────────────────────────────────────────────────────────────
export default function HomePage() {
  const { mode, setMode } = useVisitorMode();
  const [showAI, setShowAI]     = useState(false);
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('pf_dark');
    if (saved !== null) setDarkMode(saved === '1');
  }, []);

  const toggleDark = () => {
    const next = !darkMode;
    setDarkMode(next);
    localStorage.setItem('pf_dark', next ? '1' : '0');
  };

  const isDev = mode === 'developer';

  return (
    <>
      <ModeSwitcher
        mode={mode} setMode={setMode}
        isDev={isDev}
        darkMode={darkMode}
        showDark={!isDev}
        toggleDark={toggleDark}
      />
      {mode === 'recruiter' && <RecruiterPage onAI={() => setShowAI(true)} darkMode={darkMode} />}
      {mode === 'developer' && <DeveloperPage onAI={() => setShowAI(true)} />}
      {mode === 'friend'    && <FriendPage    onAI={() => setShowAI(true)} darkMode={darkMode} />}
      {showAI && <AIAssistant onClose={() => setShowAI(false)} mode={mode} />}
    </>
  );
}
