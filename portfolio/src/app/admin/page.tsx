'use client';
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import type { Project, InboxMessage, MapLocation, InkwellPost } from '@/lib/supabase';

const ADMIN_PASS = process.env.NEXT_PUBLIC_ADMIN_PASS ?? 'rafsan2972';

type Tab = 'inbox' | 'projects' | 'posts' | 'map' | 'knowledge';

// ── Small reusable input ───────────────────────────────────────────────────────
function Field({ label, value, onChange, type = 'text', rows = 0, placeholder = '' }: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; rows?: number; placeholder?: string;
}) {
  const cls = "w-full bg-surface border border-border rounded px-3 py-2 text-sm text-snow outline-none focus:border-neon/50 transition-colors placeholder:text-muted font-mono";
  return (
    <div>
      <label className="block text-[10px] text-ghost tracking-widest uppercase mb-1">{label}</label>
      {rows > 0
        ? <textarea rows={rows} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className={cls + ' resize-none'} />
        : <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className={cls} />
      }
    </div>
  );
}

function SaveBtn({ onClick, saving, saved }: { onClick: () => void; saving: boolean; saved: boolean }) {
  return (
    <button onClick={onClick} disabled={saving} className="btn-neon text-xs disabled:opacity-40">
      <span>{saved ? '✓ Saved!' : saving ? 'Saving...' : 'Save'}</span>
    </button>
  );
}

// ── Inbox tab ──────────────────────────────────────────────────────────────────
function InboxTab() {
  const [messages, setMessages] = useState<InboxMessage[]>([]);
  useEffect(() => {
    supabase.from('pf_inbox_messages').select('*').order('created_at', { ascending: false })
      .then(({ data }) => { if (data) setMessages(data as InboxMessage[]); });
  }, []);

  const markRead = async (id: string) => {
    await supabase.from('pf_inbox_messages').update({ is_read: true }).eq('id', id);
    setMessages(ms => ms.map(m => m.id === id ? { ...m, is_read: true } : m));
  };
  const del = async (id: string) => {
    await supabase.from('pf_inbox_messages').delete().eq('id', id);
    setMessages(ms => ms.filter(m => m.id !== id));
  };

  if (messages.length === 0) return <p className="text-ghost text-sm text-center py-12">No messages yet.</p>;
  return (
    <div className="space-y-3">
      {messages.map(m => (
        <motion.div key={m.id} layout className={`panel p-5 ${!m.is_read ? 'border-neon/25' : ''}`}>
          <div className="flex items-start justify-between gap-4 mb-2">
            <div>
              <span className="font-display text-sm text-snow">{m.sender_name}</span>
              <span className="text-muted text-xs ml-3">{m.sender_email}</span>
              {!m.is_read && <span className="tag tag-neon text-[10px] ml-3">NEW</span>}
            </div>
            <div className="flex gap-2 flex-shrink-0">
              {!m.is_read && <button onClick={() => markRead(m.id)} className="tag tag-ghost text-[10px] hover:text-neon">Mark read</button>}
              <a href={`mailto:${m.sender_email}`} className="tag tag-cyan text-[10px]">Reply ↗</a>
              <button onClick={() => del(m.id)} className="tag tag-ghost text-[10px] hover:text-red-400">Delete</button>
            </div>
          </div>
          <p className="text-ghost text-sm leading-relaxed">{m.message}</p>
          <p className="text-muted text-[10px] mt-2">
            {new Date(m.created_at).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}
          </p>
        </motion.div>
      ))}
    </div>
  );
}

// ── Projects tab ───────────────────────────────────────────────────────────────
function ProjectsTab() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [editing, setEditing]   = useState<Partial<Project> | null>(null);
  const [saving, setSaving]     = useState(false);
  const [saved, setSaved]       = useState(false);

  const load = useCallback(() => {
    supabase.from('pf_projects_lab').select('*').order('sort_order').then(({ data }) => { if (data) setProjects(data); });
  }, []);
  useEffect(() => { load(); }, [load]);

  const blank = (): Partial<Project> => ({
    title: '', description: '', tech_stack: [], github_url: '', live_url: '', case_study: '', is_featured: false, sort_order: 0,
  });

  const save = async () => {
    setSaving(true);
    if (editing?.id) {
      await supabase.from('pf_projects_lab').update(editing).eq('id', editing.id);
    } else {
      await supabase.from('pf_projects_lab').insert(editing);
    }
    setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2000);
    setEditing(null); load();
  };

  const del = async (id: string) => {
    if (!confirm('Delete this project?')) return;
    await supabase.from('pf_projects_lab').delete().eq('id', id);
    load();
  };

  return (
    <div className="space-y-4">
      <button onClick={() => setEditing(blank())} className="btn-neon text-xs"><span>+ New Project</span></button>

      <AnimatePresence>
        {editing && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="panel p-6 space-y-4 border-neon/20">
            <p className="font-display text-xs text-neon tracking-widest">{editing.id ? '// EDIT PROJECT' : '// NEW PROJECT'}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Title" value={editing.title ?? ''} onChange={v => setEditing(e => ({ ...e, title: v }))} placeholder="AgriBase" />
              <Field label="Sort Order" value={String(editing.sort_order ?? 0)} onChange={v => setEditing(e => ({ ...e, sort_order: parseInt(v) || 0 }))} type="number" />
            </div>
            <Field label="Description" value={editing.description ?? ''} onChange={v => setEditing(e => ({ ...e, description: v }))} rows={3} placeholder="What does this project do?" />
            <Field label="Tech Stack (comma separated)" value={(editing.tech_stack ?? []).join(', ')} onChange={v => setEditing(e => ({ ...e, tech_stack: v.split(',').map(s => s.trim()).filter(Boolean) }))} placeholder="Python, Flask, PostgreSQL" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="GitHub URL" value={editing.github_url ?? ''} onChange={v => setEditing(e => ({ ...e, github_url: v }))} placeholder="https://github.com/..." />
              <Field label="Live URL" value={editing.live_url ?? ''} onChange={v => setEditing(e => ({ ...e, live_url: v }))} placeholder="https://..." />
            </div>
            <Field label="Case Study (shown in modal)" value={editing.case_study ?? ''} onChange={v => setEditing(e => ({ ...e, case_study: v }))} rows={4} placeholder="Problem → Solution → Learnings..." />
            <div className="flex items-center gap-3">
              <input type="checkbox" id="featured" checked={editing.is_featured ?? false}
                onChange={e => setEditing(ed => ({ ...ed, is_featured: e.target.checked }))}
                className="accent-neon" />
              <label htmlFor="featured" className="text-xs text-ghost">Featured project</label>
            </div>
            <div className="flex gap-3">
              <SaveBtn onClick={save} saving={saving} saved={saved} />
              <button onClick={() => setEditing(null)} className="tag tag-ghost text-xs">Cancel</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-2">
        {projects.map(p => (
          <div key={p.id} className="panel p-4 flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-display text-sm text-snow truncate">{p.title}</span>
                {p.is_featured && <span className="tag tag-amber text-[10px]">Featured</span>}
              </div>
              <div className="flex gap-1 mt-1 flex-wrap">
                {p.tech_stack?.slice(0, 4).map(t => <span key={t} className="tag tag-ghost text-[10px]">{t}</span>)}
              </div>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button onClick={() => setEditing(p)} className="tag tag-cyan text-[10px]">Edit</button>
              <button onClick={() => del(p.id)} className="tag tag-ghost text-[10px] hover:text-red-400">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Posts tab ──────────────────────────────────────────────────────────────────
function PostsTab() {
  const [posts, setPosts]   = useState<InkwellPost[]>([]);
  const [editing, setEditing] = useState<Partial<InkwellPost> | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved]   = useState(false);

  const load = useCallback(() => {
    supabase.from('pf_inkwell_posts').select('*').order('created_at', { ascending: false })
      .then(({ data }) => { if (data) setPosts(data as InkwellPost[]); });
  }, []);
  useEffect(() => { load(); }, [load]);

  const blank = (): Partial<InkwellPost> => ({
    title: '', slug: '', content: '', excerpt: '', reading_time: 3, is_published: false,
  });

  const save = async () => {
    setSaving(true);
    const payload = { ...editing, updated_at: new Date().toISOString() };
    if (editing?.id) {
      await supabase.from('pf_inkwell_posts').update(payload).eq('id', editing.id);
    } else {
      await supabase.from('pf_inkwell_posts').insert(payload);
    }
    setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2000);
    setEditing(null); load();
  };

  const del = async (id: string) => {
    if (!confirm('Delete this post?')) return;
    await supabase.from('pf_inkwell_posts').delete().eq('id', id);
    load();
  };

  const autoSlug = (title: string) => title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  return (
    <div className="space-y-4">
      <button onClick={() => setEditing(blank())} className="btn-neon text-xs"><span>+ New Post</span></button>

      <AnimatePresence>
        {editing && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="panel p-6 space-y-4 border-neon/20">
            <p className="font-display text-xs text-neon tracking-widest">{editing.id ? '// EDIT POST' : '// NEW POST'}</p>
            <Field label="Title" value={editing.title ?? ''} onChange={v => {
              setEditing(e => ({ ...e, title: v, slug: e?.id ? e.slug : autoSlug(v) }));
            }} placeholder="My thoughts on..." />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Slug (URL)" value={editing.slug ?? ''} onChange={v => setEditing(e => ({ ...e, slug: v }))} placeholder="my-thoughts-on" />
              <Field label="Reading Time (minutes)" value={String(editing.reading_time ?? 3)} type="number"
                onChange={v => setEditing(e => ({ ...e, reading_time: parseInt(v) || 3 }))} />
            </div>
            <Field label="Excerpt" value={editing.excerpt ?? ''} onChange={v => setEditing(e => ({ ...e, excerpt: v }))} rows={2} placeholder="A short teaser..." />
            <Field label="Content (MDX supported)" value={editing.content ?? ''} onChange={v => setEditing(e => ({ ...e, content: v }))} rows={12} placeholder="# My Post&#10;&#10;Write your content here..." />
            <div className="flex items-center gap-3">
              <input type="checkbox" id="published" checked={editing.is_published ?? false}
                onChange={e => setEditing(ed => ({ ...ed, is_published: e.target.checked }))}
                className="accent-neon" />
              <label htmlFor="published" className="text-xs text-ghost">Published (visible on site)</label>
            </div>
            <div className="flex gap-3">
              <SaveBtn onClick={save} saving={saving} saved={saved} />
              <button onClick={() => setEditing(null)} className="tag tag-ghost text-xs">Cancel</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-2">
        {posts.map(p => (
          <div key={p.id} className="panel p-4 flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-display text-sm text-snow truncate">{p.title}</span>
                <span className={`tag text-[10px] ${p.is_published ? 'tag-neon' : 'tag-ghost'}`}>{p.is_published ? 'Live' : 'Draft'}</span>
              </div>
              <span className="text-muted text-[10px]">/{p.slug}</span>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button onClick={() => setEditing(p)} className="tag tag-cyan text-[10px]">Edit</button>
              <button onClick={() => del(p.id)} className="tag tag-ghost text-[10px] hover:text-red-400">Delete</button>
            </div>
          </div>
        ))}
        {posts.length === 0 && <p className="text-ghost text-sm text-center py-8">No posts yet. Write your first!</p>}
      </div>
    </div>
  );
}

// ── Map tab ────────────────────────────────────────────────────────────────────
function MapTab() {
  const [locations, setLocations] = useState<MapLocation[]>([]);
  const [editing, setEditing]     = useState<Partial<MapLocation> | null>(null);
  const [saving, setSaving]       = useState(false);
  const [saved, setSaved]         = useState(false);

  const load = useCallback(() => {
    supabase.from('pf_map_locations').select('*').order('created_at').then(({ data }) => { if (data) setLocations(data); });
  }, []);
  useEffect(() => { load(); }, [load]);

  const blank = (): Partial<MapLocation> => ({ location_name: '', latitude: 23.8, longitude: 90.4, story: '', is_wishlist: false });

  const save = async () => {
    setSaving(true);
    if (editing?.id) {
      await supabase.from('pf_map_locations').update(editing).eq('id', editing.id);
    } else {
      await supabase.from('pf_map_locations').insert(editing);
    }
    setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2000);
    setEditing(null); load();
  };

  const del = async (id: string) => {
    if (!confirm('Delete this location?')) return;
    await supabase.from('pf_map_locations').delete().eq('id', id);
    load();
  };

  return (
    <div className="space-y-4">
      <button onClick={() => setEditing(blank())} className="btn-neon text-xs"><span>+ Add Location</span></button>

      <AnimatePresence>
        {editing && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="panel p-6 space-y-4 border-neon/20">
            <p className="font-display text-xs text-neon tracking-widest">{editing.id ? '// EDIT LOCATION' : '// NEW LOCATION'}</p>
            <Field label="Location Name" value={editing.location_name ?? ''} onChange={v => setEditing(e => ({ ...e, location_name: v }))} placeholder="Dhaka" />
            <div className="grid grid-cols-2 gap-4">
              <Field label="Latitude" value={String(editing.latitude ?? '')} type="number" onChange={v => setEditing(e => ({ ...e, latitude: parseFloat(v) }))} placeholder="23.8103" />
              <Field label="Longitude" value={String(editing.longitude ?? '')} type="number" onChange={v => setEditing(e => ({ ...e, longitude: parseFloat(v) }))} placeholder="90.4125" />
            </div>
            <Field label="Story / Memory" value={editing.story ?? ''} onChange={v => setEditing(e => ({ ...e, story: v }))} rows={3} placeholder="What happened here..." />
            <div className="flex items-center gap-3">
              <input type="checkbox" id="wishlist" checked={editing.is_wishlist ?? false}
                onChange={e => setEditing(ed => ({ ...ed, is_wishlist: e.target.checked }))} className="accent-neon" />
              <label htmlFor="wishlist" className="text-xs text-ghost">Wishlist (not yet visited)</label>
            </div>
            <div className="flex gap-3">
              <SaveBtn onClick={save} saving={saving} saved={saved} />
              <button onClick={() => setEditing(null)} className="tag tag-ghost text-xs">Cancel</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-2">
        {locations.map(loc => (
          <div key={loc.id} className="panel p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <span className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ background: loc.is_wishlist ? '#00d4ff' : '#00ff88', boxShadow: `0 0 4px ${loc.is_wishlist ? '#00d4ff' : '#00ff88'}` }} />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-display text-sm text-snow truncate">{loc.location_name}</span>
                  {loc.is_wishlist && <span className="tag tag-cyan text-[10px]">Wishlist</span>}
                </div>
                <span className="text-muted text-[10px]">{loc.latitude}, {loc.longitude}</span>
              </div>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button onClick={() => setEditing(loc)} className="tag tag-cyan text-[10px]">Edit</button>
              <button onClick={() => del(loc.id)} className="tag tag-ghost text-[10px] hover:text-red-400">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── AI Knowledge tab ───────────────────────────────────────────────────────────
function KnowledgeTab() {
  const [text, setText]   = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    supabase.from('pf_ai_knowledge').select('system_prompt_text').eq('id', 1).single()
      .then(({ data }) => { if (data) setText(data.system_prompt_text ?? ''); });
  }, []);

  const save = async () => {
    setSaving(true);
    await supabase.from('pf_ai_knowledge').update({ system_prompt_text: text, last_updated: new Date().toISOString() }).eq('id', 1);
    setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-4">
      <p className="text-ghost text-xs leading-relaxed">
        This text is fed to the AI assistant as its knowledge base. Edit freely — the AI will answer questions strictly based on what you write here.
      </p>
      <textarea value={text} onChange={e => setText(e.target.value)} rows={22}
        className="w-full bg-surface border border-border rounded px-4 py-3 text-sm text-snow outline-none focus:border-neon/50 font-mono resize-none" />
      <SaveBtn onClick={save} saving={saving} saved={saved} />
    </div>
  );
}

// ── Root admin page ────────────────────────────────────────────────────────────
export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [pass, setPass]     = useState('');
  const [tab, setTab]       = useState<Tab>('inbox');

  useEffect(() => {
    if (sessionStorage.getItem('pf_admin') === '1') setAuthed(true);
  }, []);

  const login = () => {
    if (pass === ADMIN_PASS) { setAuthed(true); sessionStorage.setItem('pf_admin', '1'); }
    else alert('Wrong password.');
  };

  if (!authed) return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-grid">
      <div className="panel panel-accent p-8 w-full max-w-sm">
        <p className="font-display text-neon text-xs tracking-widest mb-2 text-center">// CONTROL CENTER</p>
        <p className="text-ghost text-xs text-center mb-6">Restricted access.</p>
        <input type="password" value={pass} onChange={e => setPass(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && login()}
          placeholder="Access code..."
          className="w-full bg-surface border border-border rounded px-3 py-2.5 text-sm text-snow outline-none focus:border-neon/50 placeholder:text-muted font-mono mb-4" autoFocus />
        <button onClick={login} className="btn-neon w-full"><span>Enter Control Center</span></button>
      </div>
    </div>
  );

  const TABS: { id: Tab; label: string }[] = [
    { id: 'inbox',     label: 'Inbox'     },
    { id: 'projects',  label: 'Projects'  },
    { id: 'posts',     label: 'Inkwell'   },
    { id: 'map',       label: 'Map Pins'  },
    { id: 'knowledge', label: 'AI Brain'  },
  ];

  return (
    <div className="min-h-screen px-4 pt-8 pb-20 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-neon text-xs tracking-widest mb-1">// CONTROL CENTER</p>
          <h1 className="font-display text-2xl text-snow">Admin</h1>
        </div>
        <a href="/" className="tag tag-ghost text-xs">← Site</a>
      </div>

      {/* Tabs */}
      <div className="flex gap-0 mb-6 border-b border-border overflow-x-auto">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-4 py-2.5 text-xs tracking-widest uppercase whitespace-nowrap transition-colors border-b-2 -mb-px ${
              tab === t.id ? 'text-neon border-neon' : 'text-ghost border-transparent hover:text-snow'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'inbox'     && <InboxTab />}
      {tab === 'projects'  && <ProjectsTab />}
      {tab === 'posts'     && <PostsTab />}
      {tab === 'map'       && <MapTab />}
      {tab === 'knowledge' && <KnowledgeTab />}
    </div>
  );
}
