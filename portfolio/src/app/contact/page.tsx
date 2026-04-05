'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { NavBar } from '@/components/layout/NavBar';

const SOCIALS = [
  { label: 'Email',        href: 'mailto:rafsan2972jani@gmail.com',       tag: 'rafsan2972jani@gmail.com', icon: '✉' },
  { label: 'GitHub',       href: 'https://github.com/rafsan-j',           tag: 'rafsan-j',                icon: '◈' },
  { label: 'LinkedIn',     href: 'https://linkedin.com/in/ralsan-jani72', tag: 'ralsan-jani72',           icon: '◉' },
  { label: 'Schedule Call', href: 'https://cal.com',                      tag: 'Book a 15-min chat',      icon: '◷' },
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
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, email: form.email, message: form.message, honeypot: form.hp }),
      });
      setStatus(res.ok ? 'sent' : 'error');
    } catch { setStatus('error'); }
  };

  return (
    <>
      <NavBar />
      <main className="max-w-2xl mx-auto px-4 pt-24 pb-16">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-[#f472b6] text-xs tracking-widest mb-2">// TRANSMISSION</p>
          <h1 className="font-display text-4xl md:text-5xl text-snow font-bold mb-3">Get in Touch</h1>
          <p className="text-ghost mb-10">For collaborations, opportunities, or just a conversation. All messages reach me directly.</p>

          {/* Contact options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-10">
            {SOCIALS.map(s => (
              <a key={s.label}
                href={s.href}
                target={s.href.startsWith('http') ? '_blank' : '_self'}
                rel="noreferrer"
                className="panel px-4 py-4 flex items-center gap-3 hover:border-neon/30 transition-all group">
                <span className="text-neon text-sm w-5 flex-shrink-0">{s.icon}</span>
                <div className="min-w-0">
                  <p className="text-[10px] text-muted tracking-widest uppercase">{s.label}</p>
                  <p className="text-xs text-ghost group-hover:text-snow transition-colors truncate">{s.tag}</p>
                </div>
                <span className="ml-auto text-muted group-hover:text-neon transition-colors text-xs">↗</span>
              </a>
            ))}
          </div>

          {/* Form */}
          {status === 'sent' ? (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="panel p-10 text-center">
              <span className="status-dot block mx-auto mb-4" />
              <p className="font-display text-neon text-lg mb-2">Transmission Received</p>
              <p className="text-ghost text-sm">Thanks for reaching out. You'll get a reply within 24 hours.</p>
            </motion.div>
          ) : (
            <form onSubmit={submit} className="panel p-6 space-y-5">
              {/* Honeypot */}
              <input type="text" value={form.hp} onChange={set('hp')}
                className="hidden" tabIndex={-1} autoComplete="off" aria-hidden="true" />

              {[
                { k: 'name',  label: 'Name',  type: 'text',  ph: 'Your name' },
                { k: 'email', label: 'Email', type: 'email', ph: 'your@email.com' },
              ].map(f => (
                <div key={f.k}>
                  <label className="block text-[10px] text-ghost tracking-widest uppercase mb-1.5">{f.label}</label>
                  <input type={f.type} required value={(form as Record<string, string>)[f.k]} onChange={set(f.k)}
                    placeholder={f.ph}
                    className="w-full bg-surface border border-border rounded px-3 py-2.5 text-sm text-snow outline-none
                               focus:border-neon/50 transition-colors placeholder:text-muted font-mono" />
                </div>
              ))}

              <div>
                <label className="block text-[10px] text-ghost tracking-widest uppercase mb-1.5">Message</label>
                <textarea required rows={5} value={form.message} onChange={set('message')}
                  placeholder="What's on your mind..."
                  className="w-full bg-surface border border-border rounded px-3 py-2.5 text-sm text-snow outline-none
                             focus:border-neon/50 transition-colors placeholder:text-muted font-mono resize-none" />
              </div>

              <button type="submit" disabled={status === 'sending'} className="btn-neon w-full disabled:opacity-40">
                <span>{status === 'sending' ? 'Transmitting...' : 'Send Transmission →'}</span>
              </button>

              {status === 'error' && (
                <p className="text-xs text-red-400 text-center">
                  Something went wrong. Email me at <a href="mailto:rafsan2972jani@gmail.com" className="text-neon underline">rafsan2972jani@gmail.com</a>
                </p>
              )}
            </form>
          )}

          {/* Resume hint */}
          <div className="mt-8 panel p-4 flex items-center gap-3">
            <span className="text-neon text-sm">◎</span>
            <div>
              <p className="text-xs text-snow">Looking for my resume?</p>
              <a href="/resume.pdf" className="text-xs text-ghost hover:text-neon link-underline transition-colors">Download PDF →</a>
            </div>
          </div>
        </motion.div>
      </main>
    </>
  );
}
