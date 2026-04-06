'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NavBar } from '@/components/layout/NavBar';
import { supabase } from '@/lib/supabase';
import type { GalleryImage } from '@/lib/supabase';

const CATS = ['all', 'general', 'photography', 'generative', 'ui', 'events'];

export default function VisualsPage() {
  const [images, setImages]     = useState<GalleryImage[]>([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState('all');
  const [selected, setSelected] = useState<GalleryImage | null>(null);

  useEffect(() => {
    supabase
      .from('pf_gallery_images')
      .select('*')
      .order('uploaded_at', { ascending: false })
      .then(({ data, error }) => {
        if (data) setImages(data as GalleryImage[]);
        if (error) console.error(error);
        setLoading(false);
      });
  }, []);

  const visible = filter === 'all' ? images : images.filter(i => i.category === filter);
  const cats = CATS.filter(c => c === 'all' || images.some(i => i.category === c));

  return (
    <>
      <NavBar />
      <main className="min-h-screen px-4 pt-24 pb-20 max-w-6xl mx-auto" style={{ background: '#050505' }}>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <p className="text-xs tracking-widest font-mono mb-2" style={{ color: '#8888aa' }}>// VISUALS</p>
          <h1 className="font-display text-3xl md:text-5xl mb-3" style={{ color: '#e8e8f0' }}>Gallery</h1>
          <p className="text-sm" style={{ color: '#8888aa' }}>Photos, generative art, and visual experiments.</p>
        </motion.div>

        {/* Category filter */}
        {cats.length > 1 && (
          <div className="flex gap-2 flex-wrap mb-8">
            {cats.map(c => (
              <button key={c} onClick={() => setFilter(c)}
                className="px-3 py-1.5 text-[10px] font-mono tracking-widest uppercase rounded transition-all border"
                style={{
                  borderColor: filter === c ? '#fb923c' : 'rgba(136,136,170,0.2)',
                  color:       filter === c ? '#fb923c' : '#8888aa',
                  background:  filter === c ? 'rgba(251,146,60,0.08)' : 'transparent',
                }}>
                {c} {c === 'all' ? `(${images.length})` : `(${images.filter(i => i.category === c).length})`}
              </button>
            ))}
          </div>
        )}

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="aspect-square rounded-lg animate-pulse" style={{ background: '#111118' }} />
            ))}
          </div>
        ) : visible.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-5xl mb-4">📷</p>
            <p className="text-sm font-mono" style={{ color: '#8888aa' }}>No images yet.</p>
          </div>
        ) : (
          <motion.div layout className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            <AnimatePresence>
              {visible.map((img, i) => (
                <motion.div
                  key={img.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.04 }}
                  className="relative group cursor-pointer rounded-lg overflow-hidden border"
                  style={{ borderColor: '#1a1a2e' }}
                  onClick={() => setSelected(img)}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.image_url} alt={img.caption ?? ''}
                    className="w-full aspect-square object-cover transition-transform duration-500 group-hover:scale-105" />
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                    {img.caption && <p className="text-white text-xs line-clamp-2 leading-relaxed">{img.caption}</p>}
                    <span className="text-[10px] font-mono mt-1" style={{ color: '#fb923c' }}>{img.category}</span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Lightbox */}
        <AnimatePresence>
          {selected && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              style={{ background: 'rgba(0,0,0,0.92)' }}
              onClick={() => setSelected(null)}>
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                className="relative max-w-3xl w-full"
                onClick={e => e.stopPropagation()}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={selected.image_url} alt={selected.caption ?? ''}
                  className="w-full max-h-[75vh] object-contain rounded-lg" />
                {(selected.caption || selected.category) && (
                  <div className="mt-3 px-1">
                    {selected.caption && <p className="text-sm text-[#e8e8f0] leading-relaxed">{selected.caption}</p>}
                    {selected.category && <p className="text-xs font-mono mt-1" style={{ color: '#fb923c' }}>{selected.category}</p>}
                  </div>
                )}
                <button
                  onClick={() => setSelected(null)}
                  className="absolute -top-3 -right-3 w-8 h-8 rounded-full flex items-center justify-center text-sm"
                  style={{ background: '#111118', border: '1px solid #1a1a2e', color: '#8888aa' }}>
                  ✕
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </>
  );
}