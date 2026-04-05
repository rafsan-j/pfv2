'use client';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { VisitorMode } from '@/components/ui/VisitorModeProvider';

type Message = { role: 'user' | 'assistant'; content: string };

const STARTERS: Record<VisitorMode, string[]> = {
  recruiter: ["What is Rafsan's strongest skill?", 'Tell me about his leadership.', 'What are his achievements?', 'Is he open to opportunities?'],
  developer: ["What projects has he built?", "What's AgriBase?", "What's his tech stack?", 'Has he done research?'],
  friend:    ["What does Rafsan do for fun?", 'Where is he from?', "What's he working on?", "What's his biggest achievement?"],
};

interface Props { onClose: () => void; mode?: VisitorMode; }

export function AIAssistant({ onClose, mode = 'developer' }: Props) {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: mode === 'friend'
        ? "Hey! 👋 I'm Rafsan's AI assistant. Ask me anything about him!"
        : mode === 'recruiter'
          ? "Hello. I'm here to answer questions about Rafsan Jani's background and qualifications."
          : "Hi. I'm Rafsan's AI representative. Ask me about his projects, skills, or background." },
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
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: updated }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const reader  = res.body!.getReader();
      const decoder = new TextDecoder();
      let reply = '';
      setMessages(p => [...p, { role: 'assistant', content: '' }]);
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        reply += decoder.decode(value, { stream: true });
        setMessages(p => { const c = [...p]; c[c.length-1] = { role: 'assistant', content: reply }; return c; });
      }
    } catch (err) {
      console.error('AI error:', err);
      setMessages(p => [...p, { role: 'assistant', content: 'Connection issue — please try again in a moment, or email rafsan2972jani@gmail.com directly.' }]);
    } finally { setLoading(false); }
  };

  // Theme vars per mode
  const isRecruiter = mode === 'recruiter';
  const isFriend    = mode === 'friend';
  const panelBg     = isRecruiter ? '#ffffff' : isFriend ? '#1a0f2e' : '#111118';
  const headerBg    = isRecruiter ? '#f5f5f5' : isFriend ? '#2d1f4a' : '#0d0d12';
  const headerBdr   = isRecruiter ? '#e5e5e5' : isFriend ? '#3d2a5a' : '#1a1a2e';
  const accentColor = isRecruiter ? '#111111' : isFriend ? '#f472b6' : '#00ff88';
  const titleColor  = isRecruiter ? '#111' : isFriend ? '#f472b6' : '#00ff88';
  const msgUserBg   = isRecruiter ? '#111' : isFriend ? 'rgba(244,114,182,0.12)' : 'rgba(0,255,136,0.08)';
  const msgUserTxt  = isRecruiter ? '#fff' : '#e8e8f0';
  const msgAstBg    = isRecruiter ? '#f0f0f0' : isFriend ? '#2d1f4a' : '#0d0d12';
  const msgAstTxt   = isRecruiter ? '#333' : '#8888aa';
  const inputBg     = isRecruiter ? '#f9f9f9' : isFriend ? '#2d1f4a' : '#0d0d12';
  const inputBdr    = isRecruiter ? '#ddd' : isFriend ? '#3d2a5a' : '#1a1a2e';
  const inputTxt    = isRecruiter ? '#111' : '#e8e8f0';

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[500] flex items-end md:items-center justify-center p-4"
        style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
        onClick={e => e.target === e.currentTarget && onClose()}>
        <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40 }}
          className="w-full max-w-lg flex flex-col rounded-xl overflow-hidden border shadow-2xl"
          style={{ height: '520px', background: panelBg, borderColor: headerBdr }}>

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b flex-shrink-0"
            style={{ background: headerBg, borderColor: headerBdr }}>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ background: accentColor, boxShadow: `0 0 6px ${accentColor}` }} />
              <span className="text-xs font-mono tracking-widest" style={{ color: titleColor }}>
                {isRecruiter ? 'AI REPRESENTATIVE' : isFriend ? 'Hey there! ✨' : 'AI ASSISTANT'}
              </span>
            </div>
            <button onClick={onClose} className="text-xs transition-opacity hover:opacity-60"
              style={{ color: msgAstTxt }}>✕ Close</button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className="max-w-[82%] text-xs px-3 py-2 rounded-lg leading-relaxed border"
                  style={{
                    background:  m.role === 'user' ? msgUserBg : msgAstBg,
                    color:       m.role === 'user' ? msgUserTxt : msgAstTxt,
                    borderColor: m.role === 'user' ? `${accentColor}30` : headerBdr,
                  }}
                >
                  {m.role === 'assistant' && (
                    <span className="text-[10px] mr-1 font-mono" style={{ color: accentColor }}>
                      {isRecruiter ? 'RJ.AI' : isFriend ? '✨' : 'RJ.AI>'}
                    </span>
                  )}
                  {m.content}
                  {m.role === 'assistant' && loading && i === messages.length-1 && m.content === '' && (
                    <span className="animate-pulse">▋</span>
                  )}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Starters */}
          {messages.length <= 1 && (
            <div className="px-4 pb-2 flex flex-wrap gap-1.5 flex-shrink-0">
              {STARTERS[mode].map(q => (
                <button key={q} onClick={() => send(q)}
                  className="text-[10px] px-2 py-1 rounded border transition-opacity hover:opacity-70"
                  style={{ borderColor: headerBdr, color: msgAstTxt, background: headerBg }}>
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="px-4 pb-4 flex-shrink-0">
            <div className="flex gap-2 border rounded-lg px-3 py-2" style={{ background: inputBg, borderColor: inputBdr }}>
              <span className="text-xs self-center" style={{ color: accentColor }}>&gt;</span>
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && send()}
                placeholder="Ask about Rafsan..."
                className="flex-1 bg-transparent text-sm outline-none font-mono placeholder:opacity-40"
                style={{ color: inputTxt }}
                autoFocus
              />
              <button onClick={() => send()} disabled={loading}
                className="text-xs font-mono transition-opacity hover:opacity-70 disabled:opacity-30"
                style={{ color: accentColor }}>
                {loading ? '...' : 'SEND'}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
