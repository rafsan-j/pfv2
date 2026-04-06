'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import type { Project, InboxMessage, MapLocation, InkwellPost, ArchiveEntry, GalleryImage } from '@/lib/supabase';

const ADMIN_PASS = process.env.NEXT_PUBLIC_ADMIN_PASS ?? 'rafsan2972';
type Tab = 'inbox' | 'projects' | 'archive' | 'posts' | 'map' | 'gallery' | 'knowledge';

// ── Shared field components ───────────────────────────────────────────────────
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
    <div className="flex items-center gap-3 flex-wrap">
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
  if (messages.length === 0) return <p className="text-[#8888aa] text-sm text-center py-12">No messages yet.</p>;
  return (
    <div className="space-y-3">
      {messages.map(m => (
        <div key={m.id} className={`bg-[#111118] border rounded-lg p-5 ${!m.is_read ? 'border-[#00ff88]/25' : 'border-[#1a1a2e]'}`}>
          <div className="flex items-start justify-between gap-4 mb-2 flex-wrap">
            <div>
              <span className="text-sm text-[#e8e8f0] font-medium">{m.sender_name}</span>
              <span className="text-[#8888aa] text-xs ml-3">{m.sender_email}</span>
              {!m.is_read && <span className="ml-3 text-[10px] px-2 py-0.5 border border-[#00ff88]/35 text-[#00ff88] rounded font-mono">NEW</span>}
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

// ── Projects ──────────────────────────────────────────────────────────────────
function ProjectsTab() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [editing, setEditing]   = useState<Partial<Project> | null>(null);
  const [saving, setSaving]     = useState(false);
  const [saved, setSaved]       = useState(false);
  const [saveError, setSaveError] = useState('');

  const load = useCallback(async () => {
    const { data } = await supabase.from('pf_projects_lab').select('*').order('sort_order');
    if (data) setProjects(data);
  }, []);
  useEffect(() => { load(); }, [load]);

  const blank = (): Partial<Project> => ({ title: '', description: '', tech_stack: [], github_url: '', live_url: '', case_study: '', is_featured: false, sort_order: 0 });

  const save = async () => {
    if (!editing?.title) { setSaveError('Title required'); return; }
    setSaving(true); setSaveError('');
    const result = editing.id
      ? await supabase.from('pf_projects_lab').update(editing).eq('id', editing.id)
      : await supabase.from('pf_projects_lab').insert(editing);
    if (result.error) { setSaveError(result.error.message); setSaving(false); return; }
    setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2000);
    setEditing(null); load();
  };

  return (
    <div className="space-y-4">
      <button onClick={() => { setEditing(blank()); setSaveError(''); }} className="px-4 py-2 text-xs font-mono tracking-widest uppercase border border-[#00ff88] text-[#00ff88] hover:bg-[#00ff88] hover:text-black transition-all">+ New Project</button>
      <AnimatePresence>
        {editing && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="bg-[#111118] border border-[#00ff88]/20 rounded-lg p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Title *" value={editing.title ?? ''} onChange={v => setEditing(e => ({ ...e, title: v }))} />
              <Field label="Sort Order" value={String(editing.sort_order ?? 0)} onChange={v => setEditing(e => ({ ...e, sort_order: parseInt(v)||0 }))} type="number" />
            </div>
            <Field label="Description" value={editing.description ?? ''} onChange={v => setEditing(e => ({ ...e, description: v }))} rows={3} />
            <Field label="Tech Stack (comma separated)" value={(editing.tech_stack ?? []).join(', ')} onChange={v => setEditing(e => ({ ...e, tech_stack: v.split(',').map(s=>s.trim()).filter(Boolean) }))} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="GitHub URL" value={editing.github_url ?? ''} onChange={v => setEditing(e => ({ ...e, github_url: v }))} />
              <Field label="Live URL" value={editing.live_url ?? ''} onChange={v => setEditing(e => ({ ...e, live_url: v }))} />
            </div>
            <Field label="Case Study" value={editing.case_study ?? ''} onChange={v => setEditing(e => ({ ...e, case_study: v }))} rows={4} />
            <div className="flex items-center gap-3">
              <input type="checkbox" checked={editing.is_featured ?? false} onChange={e => setEditing(ed => ({ ...ed, is_featured: e.target.checked }))} className="accent-[#00ff88]" />
              <span className="text-xs text-[#8888aa]">Featured project</span>
            </div>
            <div className="flex gap-3 items-center">
              <SaveBtn onClick={save} saving={saving} saved={saved} error={saveError} />
              <button onClick={() => setEditing(null)} className="text-xs text-[#8888aa] hover:text-white">Cancel</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="space-y-2">
        {projects.map(p => (
          <div key={p.id} className="bg-[#111118] border border-[#1a1a2e] rounded-lg p-4 flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <span className="text-sm text-[#e8e8f0] font-medium truncate block">{p.title}</span>
              <div className="flex gap-1 mt-1 flex-wrap">{p.tech_stack?.slice(0,4).map(t => <span key={t} className="text-[10px] px-1.5 py-0.5 border border-[#1a1a2e] text-[#8888aa] rounded">{t}</span>)}</div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => { setEditing(p); setSaveError(''); }} className="text-[10px] px-2 py-1 border border-[#00d4ff]/40 text-[#00d4ff] rounded">Edit</button>
              <button onClick={async () => { if(confirm('Delete?')) { await supabase.from('pf_projects_lab').delete().eq('id',p.id); load(); }}} className="text-[10px] px-2 py-1 border border-[#1a1a2e] text-[#8888aa] hover:text-red-400 rounded">Del</button>
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

  const load = useCallback(async () => {
    const { data } = await supabase.from('pf_projects_archive').select('*').order('date_completed', { ascending: false });
    if (data) setEntries(data as ArchiveEntry[]);
  }, []);
  useEffect(() => { load(); }, [load]);

  const blank = (): Partial<ArchiveEntry> => ({ title: '', abstract_content: '', tags: [], date_completed: new Date().toISOString().split('T')[0] });

  const save = async () => {
    if (!editing?.title) { setSaveError('Title required'); return; }
    setSaving(true); setSaveError('');
    const result = (editing as ArchiveEntry).id
      ? await supabase.from('pf_projects_archive').update(editing).eq('id', (editing as ArchiveEntry).id)
      : await supabase.from('pf_projects_archive').insert(editing);
    if (result.error) { setSaveError(result.error.message); setSaving(false); return; }
    setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2000);
    setEditing(null); load();
  };

  return (
    <div className="space-y-4">
      <button onClick={() => { setEditing(blank()); setSaveError(''); }} className="px-4 py-2 text-xs font-mono tracking-widest uppercase border border-[#00d4ff] text-[#00d4ff] hover:bg-[#00d4ff] hover:text-black transition-all">+ New Archive Entry</button>
      <AnimatePresence>
        {editing && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="bg-[#111118] border border-[#00d4ff]/20 rounded-lg p-6 space-y-4">
            <Field label="Title *" value={editing.title ?? ''} onChange={v => setEditing(e => ({ ...e, title: v }))} />
            <Field label="Abstract" value={editing.abstract_content ?? ''} onChange={v => setEditing(e => ({ ...e, abstract_content: v }))} rows={4} />
            <Field label="Tags (comma separated)" value={(editing.tags ?? []).join(', ')} onChange={v => setEditing(e => ({ ...e, tags: v.split(',').map(s=>s.trim()).filter(Boolean) }))} />
            <Field label="Date Completed" value={editing.date_completed ?? ''} onChange={v => setEditing(e => ({ ...e, date_completed: v }))} type="date" />
            <div className="flex gap-3 items-center">
              <SaveBtn onClick={save} saving={saving} saved={saved} error={saveError} />
              <button onClick={() => setEditing(null)} className="text-xs text-[#8888aa] hover:text-white">Cancel</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="space-y-2">
        {entries.length === 0 && <p className="text-[#8888aa] text-sm text-center py-8">No entries yet.</p>}
        {entries.map(e => (
          <div key={e.id} className="bg-[#111118] border border-[#1a1a2e] rounded-lg p-4 flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <span className="text-sm text-[#e8e8f0] font-medium truncate block">{e.title}</span>
              <div className="flex gap-1 mt-1 flex-wrap">{e.tags?.slice(0,4).map(t => <span key={t} className="text-[10px] px-1.5 py-0.5 border border-[#1a1a2e] text-[#8888aa] rounded">{t}</span>)}</div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => { setEditing(e); setSaveError(''); }} className="text-[10px] px-2 py-1 border border-[#00d4ff]/40 text-[#00d4ff] rounded">Edit</button>
              <button onClick={async () => { if(confirm('Delete?')) { await supabase.from('pf_projects_archive').delete().eq('id',e.id); load(); }}} className="text-[10px] px-2 py-1 border border-[#1a1a2e] text-[#8888aa] hover:text-red-400 rounded">Del</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Inkwell Posts ─────────────────────────────────────────────────────────────
// ── Drop-in replacement for PostsTab inside src/app/admin/page.tsx ──────────
// Replace the entire PostsTab function with this one.
// Make sure `useRouter` is imported at the top of admin/page.tsx:
//   import { useRouter } from 'next/navigation';

function PostsTab() {
  const router = useRouter();
  const [posts, setPosts]         = useState<InkwellPost[]>([]);
  const [editing, setEditing]     = useState<Partial<InkwellPost> | null>(null);
  const [saving, setSaving]       = useState(false);
  const [saved, setSaved]         = useState(false);
  const [saveError, setSaveError] = useState('');
  // Track which post id is currently being toggled (shows spinner on that row)
  const [toggling, setToggling]   = useState<string | null>(null);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from('pf_inkwell_posts')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setPosts(data as InkwellPost[]);
  }, []);

  useEffect(() => { load(); }, [load]);

  const autoSlug = (t: string) =>
    t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const blank = (): Partial<InkwellPost> => ({
    title: '', slug: '', content: '', excerpt: '', reading_time: 3, is_published: false,
  });

  const save = async () => {
    if (!editing?.title) { setSaveError('Title required'); return; }
    if (!editing?.slug)  { setSaveError('Slug required');  return; }
    setSaving(true); setSaveError('');
    const payload = { ...editing, updated_at: new Date().toISOString() };
    const result = editing.id
      ? await supabase.from('pf_inkwell_posts').update(payload).eq('id', editing.id)
      : await supabase.from('pf_inkwell_posts').insert(payload);
    if (result.error) { setSaveError(result.error.message); setSaving(false); return; }
    setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2000);
    setEditing(null);
    await load();
    router.refresh(); // invalidates Next.js server cache → inkwell page updates immediately
  };

  // One-click publish toggle — no need to open the edit form
  const togglePublish = async (post: InkwellPost) => {
    setToggling(post.id);
    const next = !post.is_published;
    const { error } = await supabase
      .from('pf_inkwell_posts')
      .update({ is_published: next, updated_at: new Date().toISOString() })
      .eq('id', post.id);
    if (!error) {
      // Optimistic UI update — no full reload needed
      setPosts(ps => ps.map(p => p.id === post.id ? { ...p, is_published: next } : p));
      router.refresh(); // tell Next.js server cache to bust so /inkwell is fresh
    }
    setToggling(null);
  };

  return (
    <div className="space-y-4">
      <button
        onClick={() => { setEditing(blank()); setSaveError(''); }}
        className="px-4 py-2 text-xs font-mono tracking-widest uppercase border border-[#a78bfa] text-[#a78bfa] hover:bg-[#a78bfa] hover:text-black transition-all">
        + New Post
      </button>

      {/* Edit form */}
      <AnimatePresence>
        {editing && (
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="bg-[#111118] border border-[#a78bfa]/20 rounded-lg p-6 space-y-4">
            <p className="font-mono text-xs text-[#a78bfa] tracking-widest">
              {editing.id ? '// EDIT POST' : '// NEW POST'}
            </p>

            <Field
              label="Title *"
              value={editing.title ?? ''}
              onChange={v => setEditing(e => ({
                ...e, title: v,
                slug: e?.id ? (e.slug ?? '') : autoSlug(v),
              }))}
              placeholder="My thoughts on..." />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field
                label="Slug * (URL)"
                value={editing.slug ?? ''}
                onChange={v => setEditing(e => ({ ...e, slug: v }))}
                placeholder="my-thoughts-on" />
              <Field
                label="Reading Time (min)"
                value={String(editing.reading_time ?? 3)}
                type="number"
                onChange={v => setEditing(e => ({ ...e, reading_time: parseInt(v) || 3 }))} />
            </div>

            <Field
              label="Excerpt"
              value={editing.excerpt ?? ''}
              onChange={v => setEditing(e => ({ ...e, excerpt: v }))}
              rows={2}
              placeholder="A short teaser..." />

            <Field
              label="Content (MDX supported)"
              value={editing.content ?? ''}
              onChange={v => setEditing(e => ({ ...e, content: v }))}
              rows={14}
              placeholder="# My Post&#10;&#10;Write your content here..." />

            {/* Publish toggle inside form */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setEditing(e => ({ ...e, is_published: !e?.is_published }))}
                className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none"
                style={{
                  background: editing.is_published ? '#a78bfa' : '#1a1a2e',
                }}>
                <span
                  className="inline-block h-4 w-4 rounded-full bg-white shadow transition-transform"
                  style={{ transform: editing.is_published ? 'translateX(22px)' : 'translateX(4px)' }}
                />
              </button>
              <span className="text-xs font-mono" style={{ color: editing.is_published ? '#a78bfa' : '#8888aa' }}>
                {editing.is_published ? 'Published — visible on site' : 'Draft — hidden from visitors'}
              </span>
            </div>

            <div className="flex gap-3 items-center">
              <SaveBtn onClick={save} saving={saving} saved={saved} error={saveError} />
              <button
                onClick={() => setEditing(null)}
                className="text-xs text-[#8888aa] hover:text-white">
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Post list */}
      <div className="space-y-2">
        {posts.length === 0 && (
          <p className="text-[#8888aa] text-sm text-center py-8">No posts yet. Write your first!</p>
        )}
        {posts.map(p => (
          <div
            key={p.id}
            className="bg-[#111118] border border-[#1a1a2e] rounded-lg p-4 flex items-center justify-between gap-4">

            {/* Title + slug */}
            <div className="flex-1 min-w-0">
              <span className="text-sm text-[#e8e8f0] font-medium truncate block">{p.title}</span>
              <span className="text-[#4a4a6a] text-[10px] font-mono">/{p.slug}</span>
            </div>

            {/* One-click publish toggle */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => togglePublish(p)}
                disabled={toggling === p.id}
                title={p.is_published ? 'Click to unpublish' : 'Click to publish'}
                className="relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none disabled:opacity-50"
                style={{ background: p.is_published ? '#a78bfa' : '#2a2a3a' }}>
                {toggling === p.id ? (
                  <span className="absolute inset-0 flex items-center justify-center">
                    <span className="w-2.5 h-2.5 border border-white/50 border-t-white rounded-full animate-spin" />
                  </span>
                ) : (
                  <span
                    className="inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform"
                    style={{ transform: p.is_published ? 'translateX(18px)' : 'translateX(3px)' }}
                  />
                )}
              </button>
              <span
                className="text-[10px] font-mono w-10 flex-shrink-0"
                style={{ color: p.is_published ? '#a78bfa' : '#8888aa' }}>
                {p.is_published ? 'Live' : 'Draft'}
              </span>
            </div>

            {/* Edit / Delete */}
            <div className="flex gap-2 flex-shrink-0">
              <button
                onClick={() => { setEditing(p); setSaveError(''); }}
                className="text-[10px] px-2 py-1 border border-[#00d4ff]/40 text-[#00d4ff] rounded">
                Edit
              </button>
              <button
                onClick={async () => {
                  if (!confirm('Delete this post?')) return;
                  await supabase.from('pf_inkwell_posts').delete().eq('id', p.id);
                  load();
                  router.refresh();
                }}
                className="text-[10px] px-2 py-1 border border-[#1a1a2e] text-[#8888aa] hover:text-red-400 rounded">
                Del
              </button>
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

  const save = async () => {
    if (!editing?.location_name) { setSaveError('Name required'); return; }
    setSaving(true); setSaveError('');
    const result = editing.id
      ? await supabase.from('pf_map_locations').update(editing).eq('id', editing.id)
      : await supabase.from('pf_map_locations').insert(editing);
    if (result.error) { setSaveError(result.error.message); setSaving(false); return; }
    setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2000);
    setEditing(null); load();
  };

  return (
    <div className="space-y-4">
      <button onClick={() => { setEditing({ location_name:'', latitude:23.8, longitude:90.4, story:'', is_wishlist:false }); setSaveError(''); }} className="px-4 py-2 text-xs font-mono tracking-widest uppercase border border-[#34d399] text-[#34d399] hover:bg-[#34d399] hover:text-black transition-all">+ Add Location</button>
      <AnimatePresence>
        {editing && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="bg-[#111118] border border-[#34d399]/20 rounded-lg p-6 space-y-4">
            <Field label="Location Name *" value={editing.location_name ?? ''} onChange={v => setEditing(e => ({ ...e, location_name: v }))} />
            <div className="grid grid-cols-2 gap-4">
              <Field label="Latitude" value={String(editing.latitude ?? '')} type="number" onChange={v => setEditing(e => ({ ...e, latitude: parseFloat(v) }))} />
              <Field label="Longitude" value={String(editing.longitude ?? '')} type="number" onChange={v => setEditing(e => ({ ...e, longitude: parseFloat(v) }))} />
            </div>
            <Field label="Story" value={editing.story ?? ''} onChange={v => setEditing(e => ({ ...e, story: v }))} rows={3} />
            <div className="flex items-center gap-3">
              <input type="checkbox" checked={editing.is_wishlist ?? false} onChange={e => setEditing(ed => ({ ...ed, is_wishlist: e.target.checked }))} className="accent-[#00d4ff]" />
              <span className="text-xs text-[#8888aa]">Wishlist (not yet visited)</span>
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
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: loc.is_wishlist ? '#00d4ff' : '#00ff88', boxShadow: `0 0 4px ${loc.is_wishlist?'#00d4ff':'#00ff88'}` }} />
              <div><span className="text-sm text-[#e8e8f0] font-medium block">{loc.location_name}</span><span className="text-[#4a4a6a] text-[10px] font-mono">{loc.latitude}, {loc.longitude}</span></div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => { setEditing(loc); setSaveError(''); }} className="text-[10px] px-2 py-1 border border-[#00d4ff]/40 text-[#00d4ff] rounded">Edit</button>
              <button onClick={async () => { if(confirm('Delete?')) { await supabase.from('pf_map_locations').delete().eq('id',loc.id); load(); }}} className="text-[10px] px-2 py-1 border border-[#1a1a2e] text-[#8888aa] hover:text-red-400 rounded">Del</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Gallery (fully rebuilt) ───────────────────────────────────────────────────
function GalleryTab() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [images, setImages]         = useState<GalleryImage[]>([]);
  const [dragOver, setDragOver]     = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [caption, setCaption]       = useState('');
  const [category, setCategory]     = useState('general');
  const [uploading, setUploading]   = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');

  const CATS = ['general', 'photography', 'generative', 'ui', 'events'];
  const MAX_MB = 10;

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from('pf_gallery_images')
      .select('*')
      .order('uploaded_at', { ascending: false });
    if (data) setImages(data as GalleryImage[]);
    if (error) console.error('Gallery load error:', error);
  }, []);
  useEffect(() => { load(); }, [load]);

  // When a file is chosen (drag or click), show preview but DON'T upload yet
  const stageFile = (file: File) => {
    setUploadError('');
    setUploadSuccess('');
    if (!file.type.startsWith('image/')) { setUploadError('Please select an image file.'); return; }
    if (file.size > MAX_MB * 1024 * 1024) { setUploadError(`File too large. Max ${MAX_MB} MB. Your file: ${(file.size/1024/1024).toFixed(1)} MB.`); return; }
    setPendingFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) stageFile(f);
    e.target.value = ''; // allow re-selecting same file
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) stageFile(f);
  };

  const clearPending = () => {
    setPendingFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setUploadError('');
    setUploadSuccess('');
  };

  // Commit the upload when user clicks Upload button
  const commitUpload = async () => {
    if (!pendingFile) return;
    setUploading(true);
    setUploadError('');
    setUploadSuccess('');

    try {
      const ext      = pendingFile.name.split('.').pop()?.toLowerCase() ?? 'jpg';
      const filename = `gallery/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      // Upload to Supabase Storage
      const { data: storageData, error: storageErr } = await supabase.storage
        .from('portfolio_media')
        .upload(filename, pendingFile, {
          contentType: pendingFile.type,
          upsert: false,
        });

      let imageUrl: string;

      if (storageErr) {
        // Fallback: store as base64 data URL in the DB
        console.warn('Storage upload failed, using base64 fallback:', storageErr.message);
        imageUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = e => resolve(e.target!.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(pendingFile);
        });
      } else {
        // Get the public URL
        const { data: urlData } = supabase.storage
          .from('portfolio_media')
          .getPublicUrl(storageData.path);
        imageUrl = urlData.publicUrl;
      }

      // Insert record into DB
      const { error: dbErr } = await supabase.from('pf_gallery_images').insert({
        image_url: imageUrl,
        caption:   caption.trim() || null,
        category,
      });

      if (dbErr) throw new Error(dbErr.message);

      setUploadSuccess('Image uploaded successfully!');
      setCaption('');
      setCategory('general');
      clearPending();
      await load();
      router.refresh();
    } catch (err: unknown) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const del = async (img: GalleryImage) => {
    if (!confirm('Delete this image?')) return;
    // Try to remove from storage if it's a storage URL
    if (img.image_url.includes('portfolio_media')) {
      const path = img.image_url.split('/portfolio_media/')[1];
      if (path) await supabase.storage.from('portfolio_media').remove([path]);
    }
    await supabase.from('pf_gallery_images').delete().eq('id', img.id);
    load();
    router.refresh();
  };

  return (
    <div className="space-y-6">

      {/* ── Upload Panel ─────────────────────────────────────────────────── */}
      <div className="bg-[#111118] border border-[#fb923c]/20 rounded-lg p-6 space-y-5">
        <p className="font-mono text-xs text-[#fb923c] tracking-widest">// UPLOAD IMAGE</p>

        {/* Drop zone / preview toggle */}
        {!pendingFile ? (
          /* Drop zone */
          <div
            onDragEnter={e => { e.preventDefault(); setDragOver(true); }}
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center cursor-pointer transition-all select-none ${
              dragOver
                ? 'border-[#fb923c] bg-[#fb923c]/5 scale-[1.01]'
                : 'border-[#2a2a3a] hover:border-[#fb923c]/50 hover:bg-[#fb923c]/3'
            }`}>
            <span className="text-4xl mb-3 pointer-events-none">📁</span>
            <p className="text-sm text-[#8888aa] mb-1 pointer-events-none">
              {dragOver ? 'Drop it!' : 'Drag & drop an image here'}
            </p>
            <p className="text-xs text-[#4a4a6a] pointer-events-none">or click to browse — max {MAX_MB} MB</p>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileInput} className="hidden" />
          </div>
        ) : (
          /* Preview + form */
          <div className="space-y-4">
            <div className="flex gap-4 items-start">
              {/* Preview thumbnail */}
              <div className="relative flex-shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={previewUrl!} alt="Preview"
                  className="w-28 h-28 object-cover rounded-lg border border-[#fb923c]/30" />
                <button onClick={clearPending}
                  className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[#0d0d12] border border-[#1a1a2e] text-[#8888aa] hover:text-white text-xs flex items-center justify-center">
                  ✕
                </button>
              </div>

              {/* File info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-[#e8e8f0] truncate">{pendingFile.name}</p>
                <p className="text-xs text-[#4a4a6a] mt-0.5">{(pendingFile.size / 1024 / 1024).toFixed(2)} MB · {pendingFile.type}</p>
              </div>
            </div>

            {/* Caption */}
            <div>
              <label className="block text-[10px] text-[#8888aa] tracking-widest uppercase mb-1">Caption (optional)</label>
              <input value={caption} onChange={e => setCaption(e.target.value)}
                placeholder="Describe this image..."
                className="w-full bg-[#0d0d12] border border-[#1a1a2e] rounded px-3 py-2 text-sm text-[#e8e8f0] outline-none focus:border-[#fb923c]/50 placeholder:text-[#4a4a6a] font-mono" />
            </div>

            {/* Category */}
            <div>
              <label className="block text-[10px] text-[#8888aa] tracking-widest uppercase mb-1">Category</label>
              <div className="flex gap-2 flex-wrap">
                {CATS.map(c => (
                  <button key={c} onClick={() => setCategory(c)}
                    className="px-3 py-1 text-[10px] font-mono tracking-widest uppercase rounded transition-all border"
                    style={{
                      borderColor: category === c ? '#fb923c' : '#1a1a2e',
                      color:       category === c ? '#fb923c' : '#8888aa',
                      background:  category === c ? 'rgba(251,146,60,0.08)' : 'transparent',
                    }}>
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Upload button */}
            <button
              onClick={commitUpload}
              disabled={uploading}
              className="w-full py-3 text-sm font-mono tracking-widest uppercase rounded-lg border transition-all disabled:opacity-40"
              style={{
                borderColor: '#fb923c',
                color:       uploading ? '#8888aa' : '#000',
                background:  uploading ? 'transparent' : '#fb923c',
              }}>
              {uploading ? '⏳ Uploading...' : '⬆  Upload Image'}
            </button>
          </div>
        )}

        {/* Status messages */}
        {uploadError   && <p className="text-xs text-red-400 bg-red-950/30 border border-red-800/30 rounded px-3 py-2">❌ {uploadError}</p>}
        {uploadSuccess && <p className="text-xs text-[#00ff88] bg-[#00ff88]/5 border border-[#00ff88]/20 rounded px-3 py-2">✓ {uploadSuccess}</p>}
      </div>

      {/* ── Image Grid ───────────────────────────────────────────────────── */}
      <div>
        <p className="font-mono text-xs text-[#8888aa] tracking-widest mb-3">// GALLERY ({images.length} images)</p>
        {images.length === 0
          ? <p className="text-[#8888aa] text-sm text-center py-8 border border-dashed border-[#1a1a2e] rounded-lg">No images yet. Upload one above.</p>
          : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {images.map(img => (
                <div key={img.id} className="relative group rounded-lg overflow-hidden border border-[#1a1a2e]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.image_url} alt={img.caption ?? ''}
                    className="w-full aspect-square object-cover" />
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                    {img.caption && <p className="text-white text-[11px] text-center line-clamp-2 leading-relaxed">{img.caption}</p>}
                    <span className="text-[10px] font-mono text-[#fb923c] px-2 py-0.5 border border-[#fb923c]/40 rounded">{img.category}</span>
                    <button onClick={() => del(img)}
                      className="mt-1 text-[10px] px-3 py-1 bg-red-500/80 hover:bg-red-500 text-white rounded transition-colors font-mono">
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        }
      </div>
    </div>
  );
}

// ── AI Knowledge ──────────────────────────────────────────────────────────────
function KnowledgeTab() {
  const [text, setText]           = useState('');
  const [saving, setSaving]       = useState(false);
  const [saved, setSaved]         = useState(false);
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    supabase.from('pf_ai_knowledge').select('system_prompt_text').eq('id', 1).single()
      .then(({ data }) => { if (data) setText(data.system_prompt_text ?? ''); });
  }, []);

  const save = async () => {
    setSaving(true); setSaveError('');
    const { error } = await supabase.from('pf_ai_knowledge')
      .update({ system_prompt_text: text, last_updated: new Date().toISOString() }).eq('id', 1);
    if (error) { setSaveError(error.message); setSaving(false); return; }
    setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-4">
      <p className="text-[#8888aa] text-xs leading-relaxed">This text is the AI assistant's knowledge base. Write everything you want Rafsan's AI to know about you.</p>
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
          onKeyDown={e => e.key === 'Enter' && login()} placeholder="Access code..."
          className="w-full bg-[#0d0d12] border border-[#1a1a2e] rounded px-3 py-2.5 text-sm text-[#e8e8f0] outline-none focus:border-[#00ff88]/50 placeholder:text-[#4a4a6a] font-mono mb-4" autoFocus />
        <button onClick={login} className="w-full py-2.5 text-xs font-mono tracking-widest uppercase border border-[#00ff88] text-[#00ff88] hover:bg-[#00ff88] hover:text-black transition-all">Enter</button>
      </div>
    </div>
  );

  const TABS: { id: Tab; label: string; color: string }[] = [
    { id: 'inbox',     label: 'Inbox',    color: '#00ff88' },
    { id: 'projects',  label: 'Projects', color: '#00ff88' },
    { id: 'archive',   label: 'Archive',  color: '#00d4ff' },
    { id: 'posts',     label: 'Inkwell',  color: '#a78bfa' },
    { id: 'map',       label: 'Map',      color: '#34d399' },
    { id: 'gallery',   label: 'Gallery',  color: '#fb923c' },
    { id: 'knowledge', label: 'AI Brain', color: '#ffb400' },
  ];

  return (
    <div className="min-h-screen px-4 pt-8 pb-20 max-w-4xl mx-auto" style={{ background: '#050505', color: '#e8e8f0' }}>
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-[#00ff88] text-xs tracking-widest mb-1 font-mono">// CONTROL CENTER</p>
          <h1 className="text-2xl text-[#e8e8f0] font-bold font-display">Admin</h1>
        </div>
        <a href="/" className="text-xs px-3 py-1.5 border border-[#1a1a2e] text-[#8888aa] hover:text-white rounded transition-colors font-mono">← Site</a>
      </div>

      <div className="flex gap-0 mb-6 border-b border-[#1a1a2e] overflow-x-auto">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className="px-4 py-2.5 text-xs tracking-widest uppercase whitespace-nowrap transition-colors border-b-2 -mb-px font-mono"
            style={tab === t.id ? { color: t.color, borderColor: t.color } : { color: '#8888aa', borderColor: 'transparent' }}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'inbox'     && <InboxTab />}
      {tab === 'projects'  && <ProjectsTab />}
      {tab === 'archive'   && <ArchiveTab />}
      {tab === 'posts'     && <PostsTab />}
      {tab === 'map'       && <MapTab />}
      {tab === 'gallery'   && <GalleryTab />}
      {tab === 'knowledge' && <KnowledgeTab />}
    </div>
  );
}