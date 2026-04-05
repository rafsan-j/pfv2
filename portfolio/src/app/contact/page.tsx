'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { NavBar } from '@/components/layout/NavBar';

const SOCIALS = [
  { label: 'Email',         href: 'mailto:rafsan2972jani@gmail.com',           tag: 'rafsan2972jani@gmail.com', icon: '✉' },
  { label: 'GitHub',        href: 'https://github.com/rafsan-j',               tag: 'rafsan-j',                 icon: '◈' },
  { label: 'LinkedIn',      href: 'https://linkedin.com/in/rafsan-jani72',     tag: 'rafsan-jani72',            icon: '◉' },
  { label: 'Schedule Call', href: 'https://cal.com',                            tag: 'Book a 15-min chat',       icon: '◷' },
];

type Status = 'idle' | 'sending' | 'sent' | 'error';

export default function ContactPage() {
  const [form, setForm]     = useState({ name: '', email: '', message: '', hp: '' });
  const [status, setStatus] = useState<Status>('idle');

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, email: form.email, message: form.message, honeypot: form.hp }),
      });
      setStatus(res.ok ? 'sent' : 'error');
    } catch { setStatus('error'); }
  };

  const inputCls = "w-full bg-[#0d0d12] border border-[#1a1a2e] rounded px-3 py-2.5 text-sm text-[#e8e8f0] outline-none focus:border-[#00ff88]/50 transition-colors placeholder:text-[#4a4a6a] font-mono";

  return (
    <>
      <NavBar />
      <main className="max-w-2xl mx-auto px-4 pt-24 pb-16">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-xs tracking-widest mb-2 font-mono" style={{ color: '#f472b6' }}>// TRANSMISSION</p>
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-3" style={{ color: '#e8e8f0' }}>Get in Touch</h1>
          <p className="mb-10" style={{ color: '#8888aa' }}>For collaborations, opportunities, or just a conversation. All messages reach me directly.</p>

          {/* Social links */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-10">
            {SOCIALS.map(s => (
              <a key={s.label}
                href={s.href}
                target={s.href.startsWith('http') ? '_blank' : '_self'}
                rel="noreferrer"
                className="group"
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '16px', borderRadius: '8px',
                  background: '#111118', border: '1px solid #1a1a2e',
                  textDecoration: 'none', transition: 'border-color 0.2s',
                }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(0,255,136,0.3)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = '#1a1a2e')}
              >
                <span style={{ color: '#00ff88', width: '20px', flexShrink: 0, fontFamily: 'monospace' }}>{s.icon}</span>
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: '10px', color: '#4a4a6a', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '2px', fontFamily: 'monospace' }}>{s.label}</p>
                  <p style={{ fontSize: '12px', color: '#8888aa', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.tag}</p>
                </div>
                <span style={{ marginLeft: 'auto', color: '#4a4a6a', fontSize: '12px', flexShrink: 0 }}>↗</span>
              </a>
            ))}
          </div>

          {/* Form */}
          {status === 'sent' ? (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              style={{ background: '#111118', border: '1px solid #1a1a2e', borderRadius: '8px', padding: '40px', textAlign: 'center' }}>
              <span className="status-dot" style={{ display: 'block', margin: '0 auto 16px' }} />
              <p className="font-display" style={{ color: '#00ff88', fontSize: '1.1rem', marginBottom: '8px' }}>Transmission Received</p>
              <p style={{ color: '#8888aa', fontSize: '14px' }}>Thanks for reaching out. You'll get a reply within 24 hours.</p>
            </motion.div>
          ) : (
            <form onSubmit={submit} style={{ background: '#111118', border: '1px solid #1a1a2e', borderRadius: '8px', padding: '24px' }}>
              {/* Honeypot — hidden from real users */}
              <input type="text" value={form.hp} onChange={set('hp')}
                style={{ display: 'none' }} tabIndex={-1} autoComplete="off" aria-hidden="true" />

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {[
                  { k: 'name',  label: 'Name',  type: 'text',  ph: 'Your name'      },
                  { k: 'email', label: 'Email', type: 'email', ph: 'your@email.com'  },
                ].map(f => (
                  <div key={f.k}>
                    <label style={{ display: 'block', fontSize: '10px', color: '#8888aa', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '6px', fontFamily: 'monospace' }}>{f.label}</label>
                    <input type={f.type} required value={(form as Record<string, string>)[f.k]} onChange={set(f.k)}
                      placeholder={f.ph} className={inputCls} />
                  </div>
                ))}

                <div>
                  <label style={{ display: 'block', fontSize: '10px', color: '#8888aa', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '6px', fontFamily: 'monospace' }}>Message</label>
                  <textarea required rows={5} value={form.message} onChange={set('message')}
                    placeholder="What's on your mind..."
                    className={inputCls} style={{ resize: 'none' }} />
                </div>

                <button type="submit" disabled={status === 'sending'}
                  className="btn-neon w-full" style={{ opacity: status === 'sending' ? 0.4 : 1 }}>
                  <span>{status === 'sending' ? 'Transmitting...' : 'Send Transmission →'}</span>
                </button>

                {status === 'error' && (
                  <p style={{ fontSize: '12px', color: '#f87171', textAlign: 'center' }}>
                    Something went wrong. Email me at{' '}
                    <a href="mailto:rafsan2972jani@gmail.com" style={{ color: '#00ff88' }}>rafsan2972jani@gmail.com</a>
                  </p>
                )}
              </div>
            </form>
          )}

          {/* Resume link */}
          <div style={{ marginTop: '2rem', background: '#111118', border: '1px solid #1a1a2e', borderRadius: '8px', padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ color: '#00ff88', fontFamily: 'monospace' }}>◎</span>
            <div>
              <p style={{ fontSize: '12px', color: '#e8e8f0' }}>Looking for my resume?</p>
              <a href="/resume.pdf" style={{ fontSize: '12px', color: '#8888aa', textDecoration: 'none' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#00ff88')}
                onMouseLeave={e => (e.currentTarget.style.color = '#8888aa')}>
                Download PDF →
              </a>
            </div>
          </div>
        </motion.div>
      </main>
    </>
  );
}
