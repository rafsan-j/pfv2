'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Project } from '@/lib/supabase';

export function LabClient({ projects }: { projects: Project[] }) {
  const [filter, setFilter]     = useState('all');
  const [selected, setSelected] = useState<Project | null>(null);

  const allTags = ['all', ...Array.from(new Set(projects.flatMap(p => p.tech_stack ?? [])))];
  const shown   = filter === 'all' ? projects : projects.filter(p => p.tech_stack?.includes(filter));

  return (
    <>
      <div className="flex gap-2 flex-wrap mb-8">
        {allTags.slice(0, 14).map(tag => (
          <button key={tag} onClick={() => setFilter(tag)}
            className={`tag transition-all ${filter === tag ? 'tag-neon' : 'tag-ghost hover:text-snow'}`}>
            {tag}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {shown.map((p, i) => (
            <motion.div key={p.id} layout
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }} transition={{ delay: i * 0.05 }}>
              <div onClick={() => setSelected(p)}
                className="panel panel-accent p-5 h-full cursor-pointer group hover:border-neon/30 transition-all duration-300 flex flex-col">
                {p.is_featured && <span className="tag tag-amber mb-3 self-start">Featured</span>}
                <h3 className="font-display text-sm text-snow mb-2 group-hover:text-neon transition-colors">{p.title}</h3>
                <p className="text-ghost text-xs leading-relaxed mb-4 line-clamp-3 flex-1">{p.description}</p>
                <div className="flex flex-wrap gap-1 mb-4">
                  {p.tech_stack?.map(t => <span key={t} className="tag tag-cyan text-[10px]">{t}</span>)}
                </div>
                <div className="flex gap-3 text-xs mt-auto">
                  {p.github_url && (
                    <a href={p.github_url} target="_blank" rel="noreferrer"
                      onClick={e => e.stopPropagation()}
                      className="text-ghost hover:text-neon link-underline transition-colors">GitHub ↗</a>
                  )}
                  {p.live_url && (
                    <a href={p.live_url} target="_blank" rel="noreferrer"
                      onClick={e => e.stopPropagation()}
                      className="text-ghost hover:text-cyan link-underline transition-colors">Live ↗</a>
                  )}
                  {p.case_study && (
                    <span className="ml-auto text-ghost group-hover:text-neon cursor-pointer transition-colors">Case Study →</span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {shown.length === 0 && (
        <p className="text-center text-ghost py-16 text-sm">No projects tagged: {filter}</p>
      )}

      {/* Case study modal */}
      <AnimatePresence>
        {selected && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-void/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={e => e.target === e.currentTarget && setSelected(null)}>
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }}
              className="panel w-full max-w-2xl max-h-[80vh] overflow-y-auto p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="font-display text-xl text-snow">{selected.title}</h2>
                <button onClick={() => setSelected(null)} className="text-ghost hover:text-snow text-xl leading-none">✕</button>
              </div>
              <div className="flex flex-wrap gap-1 mb-4">
                {selected.tech_stack?.map(t => <span key={t} className="tag tag-cyan">{t}</span>)}
              </div>
              <p className="text-ghost text-sm leading-relaxed mb-4">{selected.description}</p>
              {selected.case_study && (
                <div className="border-t border-border pt-4">
                  <p className="text-xs text-neon tracking-widest mb-3">// CASE STUDY</p>
                  <p className="text-ghost text-sm leading-relaxed whitespace-pre-wrap">{selected.case_study}</p>
                </div>
              )}
              <div className="flex gap-4 mt-6 flex-wrap">
                {selected.github_url && (
                  <a href={selected.github_url} target="_blank" rel="noreferrer" className="btn-neon text-xs"><span>GitHub ↗</span></a>
                )}
                {selected.live_url && (
                  <a href={selected.live_url} target="_blank" rel="noreferrer"
                    className="btn-neon text-xs" style={{ borderColor: '#00d4ff', color: '#00d4ff' }}><span>Live Demo ↗</span></a>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
