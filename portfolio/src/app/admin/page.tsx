'use client';
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import type { Project, InboxMessage, MapLocation, InkwellPost, ArchiveEntry } from '@/lib/supabase';

const ADMIN_PASS = process.env.NEXT_PUBLIC_ADMIN_PASS ?? 'rafsan2972';

type Tab = 'inbox' | 'projects' | 'archive' | 'posts' | 'map' | 'knowledge';

// ── Reusable field ────────────────────────────────────────────────────────────
function Field({ label, value, onChange, type = 'text', rows = 0, placeholder = '' }: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; rows?: number; placeholder?: string;
}) {
  const cls = "w-full bg-[#0d0d12] border border-[#1a1a2e] rounded px-3 py-2 text-sm text-[#e8e8f0] outline-none focus:border-[#00ff88]/50 transition-colors placeholder:text-[#4a4a6a] font-mono";
  return (
    <div>
      <label className="block text-[10px] text-[#8888aa] tracking-widest uppercase mb-1">{label}</label>
      {rows > 0
        ? <textarea rows={rows} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className={cls + ' resize-none'} />
        : <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className={cls} />
      }
    </div>
  );
}

function SaveBtn({ onClick, saving, saved, error }: { onClick: () => void; saving: boolean; saved: boolean; error?: string }) {
  return (
    <div className="flex items-center gap-3">
      <button onClick={onClick} disabled={saving}
        className="px-4 py-2 text-xs font-mono tracking-widest uppercase border border-[#00ff88] text-[#00ff88] hover:bg-[#00ff88] hover:text-black transition-all disabled:opacity-40">
        {saved ? '✓ Saved!' : saving ? 'Saving...' : 'Save'}
      </button>
      {error && <span className="text-xs text-red-400">{error}</span>}
    </div>
  );
}

// ── Inbox ─────────────────────────────────────────────────────────────────────
function InboxTab() {
  const [messages, setMessages] = useState<InboxMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('pf_inbox_messages').select('*').order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) console.error('Inbox fetch error:', error);
        if (data) setMessages(data as InboxMessage[]);
        setLoading(false);
      });
  }, []);

  const markRead = async (id: string) => {
    const { error } = await supabase.from('pf_inbox_messages').update({ is_read: true }).eq('id', id);
    if (error) { alert('Error: ' + error.message); return; }
    setMessages(ms => ms.map(m => m.id === id ? { ...m, is_read: true } : m));
  };

  const del = async (id: string) => {
    const { error } = await supabase.from('pf_inbox_messages').delete().eq('id', id);
    if (error) { alert('Error: ' + error.message); return; }
    setMessages(ms => ms.filter(m => m.id !== id));
  };

  if (loading) return <p className="text-[#8888aa] text-sm text-center py-12">Loading...</p>;
  if (messages.length === 0) return <p className="text-[#8888aa] text-sm text-center py-12">No messages yet.</p>;

  return (
    <div className="space-y-3">
      {messages.map(m => (
        <div key={m.id} className={`bg-[#111118] border rounded-lg p-5 ${!m.is_read ? 'border-[#00ff88]/25' : 'border-[#1a1a2e]'}`}>
          <div className="flex items-start justify-between gap-4 mb-2">
            <div>
              <span className="text-sm text-[#e8e8f0] font-medium">{m.sender_name}</span>
              <span className="text-[#8888aa] text-xs ml-3">{m.sender_email}</span>
              {!m.is_read && <span className="ml-3 text-[10px] px-2 py-0.5 border border-[#00ff88]/35 text-[#00ff88] rounded">NEW</span>}
            </div>
            <div className="flex gap-2 flex-shrink-0">
              {!m.is_read && <button onClick={() => markRead(m.id)} className="text-[10px] px-2 py-1 border border-[#1a1a2e] text-[#8888aa] hover:text-[#00ff88] rounded">Mark read</button>}
              <a href={`mailto:${m.sender_email}`} className="text-[10px] px-2 py-1 border border-[#00d4ff]/40 text-[#00d4ff] rounded">Reply ↗</a>
              <button onClick={() => del(m.id)} className="text-[10px] px-2 py-1 border border-[#1a1a2e] text-[#8888aa] hover:text-red-400 rounded">Delete</button>
            </div>
          </div>
          <p className="text-[#8888aa] text-sm leading-relaxed">{m.message}</p>
          <p className="text-[#4a4a6a] text-[10px] mt-2">{new Date(m.created_at).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}</p>
        </div>
      ))}
    </div>
  );
}

// ── Projects (Lab) ────────────────────────────────────────────────────────────
function ProjectsTab() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [editing, setEditing]   = useState<Partial<Project> | null>(null);
  const [saving, setSaving]     = useState(false);
  const [saved, setSaved]       = useState(false);
  const [saveError, setSaveError] = useState('');
  const [loading, setLoading]   = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from('pf_projects_lab').select('*').order('sort_order');
    if (error) console.error('Projects fetch error:', error);
    if (data) setProjects(data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const blank = (): Partial<Project> => ({
    title: '', description: '', tech_stack: [], github_url: '', live_url: '',
    case_study: '', is_featured: false, sort_order: 0,
  });

  const save = async () => {
    if (!editing?.title) { setSaveError('Title is required'); return; }
    setSaving(true); setSaveError('');
    let result;
    if (editing.id) {
      result = await supabase.from('pf_projects_lab').update(editing).eq('id', editing.id);
    } else {
      result = await supabase.from('pf_projects_lab').insert(editing);
    }
    if (result.error) {
      setSaveError(result.error.message);
      setSaving(false); return;
    }
    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    setEditing(null); load();
  };

  const del = async (id: string) => {
    if (!confirm('Delete this project?')) return;
    const { error } = await supabase.from('pf_projects_lab').delete().eq('id', id);
    if (error) { alert('Delete failed: ' + error.message); return; }
    load();
  };

  if (loading) return <p className="text-[#8888aa] text-sm text-center py-12">Loading...</p>;

  return (
    <div className="space-y-4">
      <button onClick={() => { setEditing(blank()); setSaveError(''); }}
        className="px-4 py-2 text-xs font-mono tracking-widest uppercase border border-[#00ff88] text-[#00ff88] hover:bg-[#00ff88] hover:text-black transition-all">
        + New Project
      </button>

      <AnimatePresence>
        {editing && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="bg-[#111118] border border-[#00ff88]/20 rounded-lg p-6 space-y-4">
            <p className="font-mono text-xs text-[#00ff88] tracking-widest">{editing.id ? '// EDIT PROJECT' : '// NEW PROJECT'}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Title *" value={editing.title ?? ''} onChange={v => setEditing(e => ({ ...e, title: v }))} placeholder="AgriBase" />
              <Field label="Sort Order" value={String(editing.sort_order ?? 0)} onChange={v => setEditing(e => ({ ...e, sort_order: parseInt(v) || 0 }))} type="number" />
            </div>
            <Field label="Description" value={editing.description ?? ''} onChange={v => setEditing(e => ({ ...e, description: v }))} rows={3} placeholder="What does this project do?" />
            <Field label="Tech Stack (comma separated)" value={(editing.tech_stack ?? []).join(', ')} onChange={v => setEditing(e => ({ ...e, tech_stack: v.split(',').map(s => s.trim()).filter(Boolean) }))} placeholder="Python, Flask, PostgreSQL" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="GitHub URL" value={editing.github_url ?? ''} onChange={v => setEditing(e => ({ ...e, github_url: v }))} placeholder="https://github.com/..." />
              <Field label="Live URL" value={editing.live_url ?? ''} onChange={v => setEditing(e => ({ ...e, live_url: v }))} placeholder="https://..." />
            </div>
            <Field label="Case Study" value={editing.case_study ?? ''} onChange={v => setEditing(e => ({ ...e, case_study: v }))} rows={4} placeholder="Problem → Solution → Learnings..." />
            <div className="flex items-center gap-3">
              <input type="checkbox" id="featured" checked={editing.is_featured ?? false}
                onChange={e => setEditing(ed => ({ ...ed, is_featured: e.target.checked }))} className="accent-[#00ff88]" />
              <label htmlFor="featured" className="text-xs text-[#8888aa]">Featured project</label>
            </div>
            <div className="flex gap-3 items-center">
              <SaveBtn onClick={save} saving={saving} saved={saved} error={saveError} />
              <button onClick={() => setEditing(null)} className="text-xs text-[#8888aa] hover:text-white">Cancel</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-2">
        {projects.length === 0 && <p className="text-[#8888aa] text-sm text-center py-8">No projects yet. Add one above.</p>}
        {projects.map(p => (
          <div key={p.id} className="bg-[#111118] border border-[#1a1a2e] rounded-lg p-4 flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm text-[#e8e8f0] font-medium truncate">{p.title}</span>
                {p.is_featured && <span className="text-[10px] px-2 py-0.5 border border-[#ffb400]/40 text-[#ffb400] rounded">Featured</span>}
              </div>
              <div className="flex gap-1 mt-1 flex-wrap">
                {p.tech_stack?.slice(0, 4).map(t => <span key={t} className="text-[10px] px-1.5 py-0.5 border border-[#1a1a2e] text-[#8888aa] rounded">{t}</span>)}
              </div>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button onClick={() => { setEditing(p); setSaveError(''); }} className="text-[10px] px-2 py-1 border border-[#00d4ff]/40 text-[#00d4ff] rounded">Edit</button>
              <button onClick={() => del(p.id)} className="text-[10px] px-2 py-1 border border-[#1a1a2e] text-[#8888aa] hover:text-red-400 rounded">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Archive ───────────────────────────────────────────────────────────────────
function ArchiveTab() {
  const [entries, setEntries]   = useState<ArchiveEntry[]>([]);
  const [editing, setEditing]   = useState<Partial<ArchiveEntry> | null>(null);
  const [saving, setSaving]     = useState(false);
  const [saved, setSaved]       = useState(false);
  const [saveError, setSaveError] = useState('');
  const [loading, setLoading]   = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from('pf_projects_archive').select('*').order('date_completed', { ascending: false });
    if (error) console.error('Archive fetch error:', error);
    if (data) setEntries(data as ArchiveEntry[]);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const blank = (): Partial<ArchiveEntry> => ({
    title: '', abstract_content: '', tags: [], date_completed: new Date().toISOString().split('T')[0],
  });

  const save = async () => {
    if (!editing?.title) { setSaveError('Title is required'); return; }
    setSaving(true); setSaveError('');
    let result;
    if ((editing as ArchiveEntry).id) {
      result = await supabase.from('pf_projects_archive').update(editing).eq('id', (editing as ArchiveEntry).id);
    } else {
      result = await supabase.from('pf_projects_archive').insert(editing);
    }
    if (result.error) {
      setSaveError(result.error.message);
      setSaving(false); return;
    }
    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    setEditing(null); load();
  };

  const del = async (id: string) => {
    if (!confirm('Delete this entry?')) return;
    const { error } = await supabase.from('pf_projects_archive').delete().eq('id', id);
    if (error) { alert('Delete failed: ' + error.message); return; }
    load();
  };

  if (loading) return <p className="text-[#8888aa] text-sm text-center py-12">Loading...</p>;

  return (
    <div className="space-y-4">
      <button onClick={() => { setEditing(blank()); setSaveError(''); }}
        className="px-4 py-2 text-xs font-mono tracking-widest uppercase border border-[#00d4ff] text-[#00d4ff] hover:bg-[#00d4ff] hover:text-black transition-all">
        + New Archive Entry
      </button>

      <AnimatePresence>
        {editing && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="bg-[#111118] border border-[#00d4ff]/20 rounded-lg p-6 space-y-4">
            <p className="font-mono text-xs text-[#00d4ff] tracking-widest">{(editing as ArchiveEntry).id ? '// EDIT ENTRY' : '// NEW ENTRY'}</p>
            <Field label="Title *" value={editing.title ?? ''} onChange={v => setEditing(e => ({ ...e, title: v }))} placeholder="CERN Beamline for Schools" />
            <Field label="Abstract / Content" value={editing.abstract_content ?? ''} onChange={v => setEditing(e => ({ ...e, abstract_content: v }))} rows={4} placeholder="What this research is about..." />
            <Field label="Tags (comma separated)" value={(editing.tags ?? []).join(', ')} onChange={v => setEditing(e => ({ ...e, tags: v.split(',').map(s => s.trim()).filter(Boolean) }))} placeholder="Physics, Research, CERN" />
            <Field label="Date Completed" value={editing.date_completed ?? ''} onChange={v => setEditing(e => ({ ...e, date_completed: v }))} type="date" />
            <Field label="PDF URL (optional)" value={(editing as ArchiveEntry & { pdf_url?: string }).pdf_url ?? ''} onChange={v => setEditing(e => ({ ...e, pdf_url: v }))} placeholder="https://..." />
            <div className="flex gap-3 items-center">
              <SaveBtn onClick={save} saving={saving} saved={saved} error={saveError} />
              <button onClick={() => setEditing(null)} className="text-xs text-[#8888aa] hover:text-white">Cancel</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-2">
        {entries.length === 0 && <p className="text-[#8888aa] text-sm text-center py-8">No archive entries yet.</p>}
        {entries.map(e => (
          <div key={e.id} className="bg-[#111118] border border-[#1a1a2e] rounded-lg p-4 flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <span className="text-sm text-[#e8e8f0] font-medium truncate block">{e.title}</span>
              <div className="flex gap-1 mt-1 flex-wrap">
                {e.tags?.slice(0, 4).map(t => <span key={t} className="text-[10px] px-1.5 py-0.5 border border-[#1a1a2e] text-[#8888aa] rounded">{t}</span>)}
              </div>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button onClick={() => { setEditing(e); setSaveError(''); }} className="text-[10px] px-2 py-1 border border-[#00d4ff]/40 text-[#00d4ff] rounded">Edit</button>
              <button onClick={() => del(e.id)} className="text-[10px] px-2 py-1 border border-[#1a1a2e] text-[#8888aa] hover:text-red-400 rounded">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Inkwell Posts ─────────────────────────────────────────────────────────────
function PostsTab() {
  const [posts, setPosts]         = useState<InkwellPost[]>([]);
  const [editing, setEditing]     = useState<Partial<InkwellPost> | null>(null);
  const [saving, setSaving]       = useState(false);
  const [saved, setSaved]         = useState(false);
  const [saveError, setSaveError] = useState('');
  const [loading, setLoading]     = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    // Fetch ALL posts (drafts + published) — no is_published filter here
    const { data, error } = await supabase
      .from('pf_inkwell_posts').select('*').order('created_at', { ascending: false });
    if (error) console.error('Posts fetch error:', error);
    if (data) setPosts(data as InkwellPost[]);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const blank = (): Partial<InkwellPost> => ({
    title: '', slug: '', content: '', excerpt: '', reading_time: 3, is_published: false,
  });

  const autoSlug = (title: string) =>
    title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const save = async () => {
    if (!editing?.title) { setSaveError('Title is required'); return; }
    if (!editing?.slug)  { setSaveError('Slug is required'); return; }
    setSaving(true); setSaveError('');

    const payload = { ...editing, updated_at: new Date().toISOString() };
    let result;
    if (editing.id) {
      result = await supabase.from('pf_inkwell_posts').update(payload).eq('id', editing.id);
    } else {
      result = await supabase.from('pf_inkwell_posts').insert(payload);
    }

    if (result.error) {
      setSaveError(result.error.message);
      setSaving(false); return;
    }
    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    setEditing(null); load();
  };

  const del = async (id: string) => {
    if (!confirm('Delete this post?')) return;
    const { error } = await supabase.from('pf_inkwell_posts').delete().eq('id', id);
    if (error) { alert('Delete failed: ' + error.message); return; }
    load();
  };

  if (loading) return <p className="text-[#8888aa] text-sm text-center py-12">Loading...</p>;

  return (
    <div className="space-y-4">
      <button onClick={() => { setEditing(blank()); setSaveError(''); }}
        className="px-4 py-2 text-xs font-mono tracking-widest uppercase border border-[#a78bfa] text-[#a78bfa] hover:bg-[#a78bfa] hover:text-black transition-all">
        + New Post
      </button>

      <AnimatePresence>
        {editing && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="bg-[#111118] border border-[#a78bfa]/20 rounded-lg p-6 space-y-4">
            <p className="font-mono text-xs text-[#a78bfa] tracking-widest">{editing.id ? '// EDIT POST' : '// NEW POST'}</p>
            <Field label="Title *" value={editing.title ?? ''} onChange={v => {
              setEditing(e => ({ ...e, title: v, slug: e?.id ? (e.slug ?? '') : autoSlug(v) }));
            }} placeholder="My thoughts on..." />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Slug * (URL)" value={editing.slug ?? ''} onChange={v => setEditing(e => ({ ...e, slug: v }))} placeholder="my-thoughts-on" />
              <Field label="Reading Time (min)" value={String(editing.reading_time ?? 3)} type="number"
                onChange={v => setEditing(e => ({ ...e, reading_time: parseInt(v) || 3 }))} />
            </div>
            <Field label="Excerpt" value={editing.excerpt ?? ''} onChange={v => setEditing(e => ({ ...e, excerpt: v }))} rows={2} placeholder="A short teaser..." />
            <Field label="Content (MDX supported)" value={editing.content ?? ''} onChange={v => setEditing(e => ({ ...e, content: v }))} rows={14} placeholder="# My Post&#10;&#10;Write your content here..." />
            <div className="flex items-center gap-3">
              <input type="checkbox" id="published" checked={editing.is_published ?? false}
                onChange={e => setEditing(ed => ({ ...ed, is_published: e.target.checked }))} className="accent-[#a78bfa]" />
              <label htmlFor="published" className="text-xs text-[#8888aa]">Published (visible on site)</label>
            </div>
            <div className="flex gap-3 items-center">
              <SaveBtn onClick={save} saving={saving} saved={saved} error={saveError} />
              <button onClick={() => setEditing(null)} className="text-xs text-[#8888aa] hover:text-white">Cancel</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-2">
        {posts.length === 0 && <p className="text-[#8888aa] text-sm text-center py-8">No posts yet. Write your first!</p>}
        {posts.map(p => (
          <div key={p.id} className="bg-[#111118] border border-[#1a1a2e] rounded-lg p-4 flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm text-[#e8e8f0] font-medium truncate">{p.title}</span>
                <span className={`text-[10px] px-2 py-0.5 border rounded ${p.is_published ? 'border-[#00ff88]/40 text-[#00ff88]' : 'border-[#1a1a2e] text-[#8888aa]'}`}>
                  {p.is_published ? 'Live' : 'Draft'}
                </span>
              </div>
              <span className="text-[#4a4a6a] text-[10px]">/{p.slug}</span>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button onClick={() => { setEditing(p); setSaveError(''); }} className="text-[10px] px-2 py-1 border border-[#00d4ff]/40 text-[#00d4ff] rounded">Edit</button>
              <button onClick={() => del(p.id)} className="text-[10px] px-2 py-1 border border-[#1a1a2e] text-[#8888aa] hover:text-red-400 rounded">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Map Pins ──────────────────────────────────────────────────────────────────
function MapTab() {
  const [locations, setLocations] = useState<MapLocation[]>([]);
  const [editing, setEditing]     = useState<Partial<MapLocation> | null>(null);
  const [saving, setSaving]       = useState(false);
  const [saved, setSaved]         = useState(false);
  const [saveError, setSaveError] = useState('');

  const load = useCallback(async () => {
    const { data } = await supabase.from('pf_map_locations').select('*').order('created_at');
    if (data) setLocations(data);
  }, []);

  useEffect(() => { load(); }, [load]);

  const blank = (): Partial<MapLocation> => ({
    location_name: '', latitude: 23.8, longitude: 90.4, story: '', is_wishlist: false,
  });

  const save = async () => {
    if (!editing?.location_name) { setSaveError('Location name is required'); return; }
    setSaving(true); setSaveError('');
    let result;
    if (editing.id) {
      result = await supabase.from('pf_map_locations').update(editing).eq('id', editing.id);
    } else {
      result = await supabase.from('pf_map_locations').insert(editing);
    }
    if (result.error) { setSaveError(result.error.message); setSaving(false); return; }
    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    setEditing(null); load();
  };

  const del = async (id: string) => {
    if (!confirm('Delete this location?')) return;
    const { error } = await supabase.from('pf_map_locations').delete().eq('id', id);
    if (error) { alert('Delete failed: ' + error.message); return; }
    load();
  };

  return (
    <div className="space-y-4">
      <button onClick={() => { setEditing(blank()); setSaveError(''); }}
        className="px-4 py-2 text-xs font-mono tracking-widest uppercase border border-[#34d399] text-[#34d399] hover:bg-[#34d399] hover:text-black transition-all">
        + Add Location
      </button>

      <AnimatePresence>
        {editing && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="bg-[#111118] border border-[#34d399]/20 rounded-lg p-6 space-y-4">
            <p className="font-mono text-xs text-[#34d399] tracking-widest">{editing.id ? '// EDIT LOCATION' : '// NEW LOCATION'}</p>
            <Field label="Location Name *" value={editing.location_name ?? ''} onChange={v => setEditing(e => ({ ...e, location_name: v }))} placeholder="Dhaka" />
            <div className="grid grid-cols-2 gap-4">
              <Field label="Latitude" value={String(editing.latitude ?? '')} type="number" onChange={v => setEditing(e => ({ ...e, latitude: parseFloat(v) }))} placeholder="23.8103" />
              <Field label="Longitude" value={String(editing.longitude ?? '')} type="number" onChange={v => setEditing(e => ({ ...e, longitude: parseFloat(v) }))} placeholder="90.4125" />
            </div>
            <Field label="Story / Memory" value={editing.story ?? ''} onChange={v => setEditing(e => ({ ...e, story: v }))} rows={3} placeholder="What happened here..." />
            <div className="flex items-center gap-3">
              <input type="checkbox" id="wishlist" checked={editing.is_wishlist ?? false}
                onChange={e => setEditing(ed => ({ ...ed, is_wishlist: e.target.checked }))} className="accent-[#00d4ff]" />
              <label htmlFor="wishlist" className="text-xs text-[#8888aa]">Wishlist (not yet visited)</label>
            </div>
            <div className="flex gap-3 items-center">
              <SaveBtn onClick={save} saving={saving} saved={saved} error={saveError} />
              <button onClick={() => setEditing(null)} className="text-xs text-[#8888aa] hover:text-white">Cancel</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-2">
        {locations.map(loc => (
          <div key={loc.id} className="bg-[#111118] border border-[#1a1a2e] rounded-lg p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <span className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ background: loc.is_wishlist ? '#00d4ff' : '#00ff88', boxShadow: `0 0 4px ${loc.is_wishlist ? '#00d4ff' : '#00ff88'}` }} />
              <div className="min-w-0">
                <span className="text-sm text-[#e8e8f0] font-medium truncate block">{loc.location_name}</span>
                <span className="text-[#4a4a6a] text-[10px]">{loc.latitude}, {loc.longitude}</span>
              </div>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button onClick={() => { setEditing(loc); setSaveError(''); }} className="text-[10px] px-2 py-1 border border-[#00d4ff]/40 text-[#00d4ff] rounded">Edit</button>
              <button onClick={() => del(loc.id)} className="text-[10px] px-2 py-1 border border-[#1a1a2e] text-[#8888aa] hover:text-red-400 rounded">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── AI Knowledge ──────────────────────────────────────────────────────────────
function KnowledgeTab() {
  const [text, setText]         = useState('');
  const [saving, setSaving]     = useState(false);
  const [saved, setSaved]       = useState(false);
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    supabase.from('pf_ai_knowledge').select('system_prompt_text').eq('id', 1).single()
      .then(({ data }) => { if (data) setText(data.system_prompt_text ?? ''); });
  }, []);

  const save = async () => {
    setSaving(true); setSaveError('');
    const { error } = await supabase.from('pf_ai_knowledge')
      .update({ system_prompt_text: text, last_updated: new Date().toISOString() })
      .eq('id', 1);
    if (error) { setSaveError(error.message); setSaving(false); return; }
    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-4">
      <p className="text-[#8888aa] text-xs leading-relaxed">
        This text is the AI assistant's knowledge base. Edit it to change what the AI knows about you.
        The AI will only answer based on what is written here.
      </p>
      <textarea value={text} onChange={e => setText(e.target.value)} rows={22}
        className="w-full bg-[#0d0d12] border border-[#1a1a2e] rounded px-4 py-3 text-sm text-[#e8e8f0] outline-none focus:border-[#00ff88]/50 font-mono resize-none" />
      <SaveBtn onClick={save} saving={saving} saved={saved} error={saveError} />
    </div>
  );
}

// ── Root ──────────────────────────────────────────────────────────────────────
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
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#050505' }}>
      <div className="bg-[#111118] border border-[#1a1a2e] rounded-lg p-8 w-full max-w-sm">
        <p className="font-mono text-[#00ff88] text-xs tracking-widest mb-2 text-center">// CONTROL CENTER</p>
        <p className="text-[#8888aa] text-xs text-center mb-6">Restricted access.</p>
        <input type="password" value={pass} onChange={e => setPass(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && login()}
          placeholder="Access code..."
          className="w-full bg-[#0d0d12] border border-[#1a1a2e] rounded px-3 py-2.5 text-sm text-[#e8e8f0] outline-none focus:border-[#00ff88]/50 placeholder:text-[#4a4a6a] font-mono mb-4"
          autoFocus />
        <button onClick={login}
          className="w-full py-2.5 text-xs font-mono tracking-widest uppercase border border-[#00ff88] text-[#00ff88] hover:bg-[#00ff88] hover:text-black transition-all">
          Enter Control Center
        </button>
      </div>
    </div>
  );

  const TABS: { id: Tab; label: string; color: string }[] = [
    { id: 'inbox',     label: 'Inbox',    color: '#00ff88' },
    { id: 'projects',  label: 'Projects', color: '#00ff88' },
    { id: 'archive',   label: 'Archive',  color: '#00d4ff' },
    { id: 'posts',     label: 'Inkwell',  color: '#a78bfa' },
    { id: 'map',       label: 'Map Pins', color: '#34d399' },
    { id: 'knowledge', label: 'AI Brain', color: '#ffb400' },
  ];

  return (
    <div className="min-h-screen px-4 pt-8 pb-20 max-w-4xl mx-auto" style={{ background: '#050505', color: '#e8e8f0' }}>
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-[#00ff88] text-xs tracking-widest mb-1 font-mono">// CONTROL CENTER</p>
          <h1 className="text-2xl text-[#e8e8f0] font-bold" style={{ fontFamily: 'Orbitron, monospace' }}>Admin</h1>
        </div>
        <a href="/" className="text-xs px-3 py-1.5 border border-[#1a1a2e] text-[#8888aa] hover:text-white rounded transition-colors">← Site</a>
      </div>

      {/* Tabs */}
      <div className="flex gap-0 mb-6 border-b border-[#1a1a2e] overflow-x-auto">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-4 py-2.5 text-xs tracking-widest uppercase whitespace-nowrap transition-colors border-b-2 -mb-px font-mono ${
              tab === t.id ? 'border-current -mb-px' : 'text-[#8888aa] border-transparent hover:text-[#e8e8f0]'
            }`}
            style={tab === t.id ? { color: t.color, borderColor: t.color } : {}}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'inbox'     && <InboxTab />}
      {tab === 'projects'  && <ProjectsTab />}
      {tab === 'archive'   && <ArchiveTab />}
      {tab === 'posts'     && <PostsTab />}
      {tab === 'map'       && <MapTab />}
      {tab === 'knowledge' && <KnowledgeTab />}
    </div>
  );
}
