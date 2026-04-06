'use client';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { VisitorMode } from '@/components/ui/VisitorModeProvider';

type Message = { role: 'user' | 'assistant'; content: string };

const STARTERS: Record<VisitorMode, string[]> = {
  recruiter: ["What is Rafsan's strongest skill?", 'Tell me about his leadership.', 'What are his achievements?', 'Is he open to opportunities?'],
  developer: ["What projects has he built?", "What's AgriBase?",  "What's his tech stack?",     'Has he done research?'],
  friend:    ["What does Rafsan do for fun?", 'Where is he from?', "What's he working on?",       "What's his biggest win?"],
};

// ── Strip markdown and render as clean JSX ────────────────────────────────────
function FormattedMessage({ text }: { text: string }) {
  // Split on double newlines for paragraphs, single newlines for line breaks
  const paragraphs = text.split(/\n\n+/);

  return (
    <div style={{ lineHeight: 1.7 }}>
      {paragraphs.map((para, i) => {
        const lines = para.split(/\n/);
        return (
          <div key={i} style={{ marginBottom: i < paragraphs.length - 1 ? '10px' : 0 }}>
            {lines.map((line, j) => {
              // Detect bullet points: lines starting with * or - or a number
              const isBullet = /^[\*\-]\s/.test(line) || /^\d+\.\s/.test(line);
              // Strip markdown bold (**text**), italic (*text*), inline code (`text`)
              const clean = line
                .replace(/\*\*(.+?)\*\*/g, '$1')   // **bold** → bold
                .replace(/\*(.+?)\*/g,   '$1')      // *italic* → italic
                .replace(/`(.+?)`/g,     '$1')      // `code` → code
                .replace(/^[\*\-]\s+/,   '')         // remove leading bullet char
                .replace(/^\d+\.\s+/,    '')         // remove leading number
                .trim();

              if (!clean) return null;

              if (isBullet) {
                return (
                  <div key={j} style={{ display: 'flex', gap: '8px', marginBottom: '4px', paddingLeft: '4px' }}>
                    <span style={{ color: 'currentColor', opacity: 0.5, flexShrink: 0, marginTop: '1px' }}>·</span>
                    <span>{clean}</span>
                  </div>
                );
              }

              return (
                <span key={j}>
                  {clean}
                  {j < lines.length - 1 && <br />}
                </span>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

interface Props { onClose: () => void; mode?: VisitorMode }

export function AIAssistant({ onClose, mode = 'developer' }: Props) {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: mode === 'friend'
        ? "Hey! 👋 I'm Rafsan's AI assistant. Ask me anything about him!"
        : mode === 'recruiter'
          ? "Hello. I'm here to answer questions about Rafsan Jani's background and qualifications."
          : "Hi. I'm Rafsan's AI. Ask me about his projects, skills, or background." },
  ]);
  const [input, setInput]     = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = async (text?: string) => {
    const userMsg = (text ?? input).trim();
    if (!userMsg || loading) return;
    setInput('');
    const updated: Message[] = [...messages, { role: 'user', content: userMsg }];
    setMessages(updated);
    setLoading(true);

    try {
      const res = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: updated }),
      });
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText);
      }
      const reader  = res.body!.getReader();
      const decoder = new TextDecoder();
      let reply = '';
      setMessages(p => [...p, { role: 'assistant', content: '' }]);
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        reply += decoder.decode(value, { stream: true });
        setMessages(p => { const c = [...p]; c[c.length - 1] = { role: 'assistant', content: reply }; return c; });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Connection issue.';
      setMessages(p => [...p, { role: 'assistant', content: `Sorry, something went wrong: ${msg.slice(0, 120)}` }]);
    } finally { setLoading(false); }
  };

  // Theme per mode
  const theme = {
    developer: {
      panelBg: '#111118', headerBg: '#0d0d12', headerBdr: '#1a1a2e',
      accent: '#00ff88', title: '// AI ASSISTANT',
      userBg: 'rgba(0,255,136,0.08)', userBdr: 'rgba(0,255,136,0.2)', userColor: '#e8e8f0',
      aiBg: '#0d0d12', aiBdr: '#1a1a2e', aiColor: '#8888aa',
      inputBg: '#0d0d12', inputBdr: '#1a1a2e', inputColor: '#e8e8f0',
    },
    recruiter: {
      panelBg: '#ffffff', headerBg: '#f5f5f5', headerBdr: '#e5e5e5',
      accent: '#111111', title: 'AI REPRESENTATIVE',
      userBg: '#111', userBdr: '#111', userColor: '#fff',
      aiBg: '#f0f0f0', aiBdr: '#e0e0e0', aiColor: '#333',
      inputBg: '#f9f9f9', inputBdr: '#ddd', inputColor: '#111',
    },
    friend: {
      panelBg: '#1a0f2e', headerBg: '#2d1f4a', headerBdr: '#3d2a5a',
      accent: '#f472b6', title: 'Hey there! ✨',
      userBg: 'rgba(244,114,182,0.12)', userBdr: 'rgba(244,114,182,0.3)', userColor: '#f0d0ff',
      aiBg: '#2d1f4a', aiBdr: '#3d2a5a', aiColor: '#c8a8e8',
      inputBg: '#2d1f4a', inputBdr: '#3d2a5a', inputColor: '#f0d0ff',
    },
  }[mode];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        style={{
          position: 'fixed', inset: 0, zIndex: 500,
          display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
          padding: '1rem', background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)',
        }}
        onClick={e => e.target === e.currentTarget && onClose()}>

        <motion.div
          initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40 }}
          style={{
            width: '100%', maxWidth: '520px', height: '540px',
            display: 'flex', flexDirection: 'column',
            borderRadius: '12px', overflow: 'hidden',
            background: theme.panelBg, border: `1px solid ${theme.headerBdr}`,
            boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
          }}>

          {/* Header */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '12px 16px', borderBottom: `1px solid ${theme.headerBdr}`,
            background: theme.headerBg, flexShrink: 0,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: theme.accent, boxShadow: `0 0 6px ${theme.accent}`, flexShrink: 0 }} />
              <span style={{ fontSize: '11px', fontFamily: 'monospace', letterSpacing: '0.1em', color: theme.accent }}>{theme.title}</span>
            </div>
            <button onClick={onClose}
              style={{ fontSize: '11px', color: theme.aiColor, background: 'none', border: 'none', cursor: 'pointer', letterSpacing: '0.05em' }}>
              ✕ Close
            </button>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {messages.map((m, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                <div style={{
                  maxWidth: '85%', fontSize: '12px', padding: '10px 12px', borderRadius: '8px',
                  border: `1px solid ${m.role === 'user' ? theme.userBdr : theme.aiBdr}`,
                  background: m.role === 'user' ? theme.userBg : theme.aiBg,
                  color: m.role === 'user' ? theme.userColor : theme.aiColor,
                }}>
                  {m.role === 'assistant' && (
                    <span style={{ fontSize: '9px', letterSpacing: '0.1em', color: theme.accent, fontFamily: 'monospace', display: 'block', marginBottom: '6px', opacity: 0.8 }}>
                      RJ.AI
                    </span>
                  )}
                  {m.role === 'assistant' && loading && i === messages.length - 1 && m.content === '' ? (
                    <span style={{ animation: 'pulse 1s ease-in-out infinite', opacity: 0.6 }}>▋</span>
                  ) : (
                    <FormattedMessage text={m.content} />
                  )}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Starter questions */}
          {messages.length <= 1 && (
            <div style={{ padding: '0 16px 12px', display: 'flex', flexWrap: 'wrap', gap: '6px', flexShrink: 0 }}>
              {STARTERS[mode].map(q => (
                <button key={q} onClick={() => send(q)}
                  style={{
                    fontSize: '10px', padding: '4px 10px', cursor: 'pointer',
                    border: `1px solid ${theme.headerBdr}`,
                    color: theme.aiColor, background: theme.headerBg,
                    borderRadius: '4px', transition: 'opacity 0.15s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = '0.7')}
                  onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div style={{ padding: '12px 16px', borderTop: `1px solid ${theme.headerBdr}`, flexShrink: 0 }}>
            <div style={{
              display: 'flex', gap: '8px', alignItems: 'center',
              border: `1px solid ${theme.inputBdr}`, borderRadius: '8px',
              padding: '8px 12px', background: theme.inputBg,
            }}>
              <span style={{ fontSize: '11px', color: theme.accent, fontFamily: 'monospace', flexShrink: 0 }}>&gt;</span>
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
                placeholder="Ask about Rafsan..."
                autoFocus
                style={{
                  flex: 1, background: 'transparent', border: 'none', outline: 'none',
                  fontSize: '13px', fontFamily: 'monospace', color: theme.inputColor,
                }}
              />
              <button onClick={() => send()} disabled={loading}
                style={{
                  fontSize: '10px', fontFamily: 'monospace', letterSpacing: '0.1em',
                  color: loading ? theme.aiColor : theme.accent,
                  background: 'none', border: 'none', cursor: loading ? 'default' : 'pointer',
                  opacity: loading ? 0.4 : 1,
                }}>
                {loading ? '...' : 'SEND'}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>

      <style>{`
        @keyframes pulse { 0%,100% { opacity: 0.6; } 50% { opacity: 1; } }
      `}</style>
    </AnimatePresence>
  );
}
