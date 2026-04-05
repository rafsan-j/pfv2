'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import type { GalleryImage } from '@/lib/supabase';

const CATS = ['all', 'photography', 'generative', 'ui', 'general'];

export function GalleryClient({ images }: { images: GalleryImage[] }) {
  const [filter, setFilter]     = useState('all');
  const [lightbox, setLightbox] = useState<GalleryImage | null>(null);

  const shown = filter === 'all' ? images : images.filter(i => i.category === filter);

  return (
    <>
      <div className="flex gap-2 flex-wrap mb-8">
        {CATS.map(cat => (
          <button key={cat} onClick={() => setFilter(cat)}
            className={`tag transition-all ${filter === cat ? 'tag-amber' : 'tag-ghost hover:text-snow'}`}>{cat}</button>
        ))}
      </div>

      {shown.length === 0 && (
        <div className="panel p-12 text-center">
          <p className="font-display text-xs text-amber mb-2">// GALLERY EMPTY</p>
          <p className="text-ghost text-sm">Upload images from the admin dashboard.<span className="cursor" /></p>
        </div>
      )}

      {/* Masonry grid */}
      <div className="columns-2 md:columns-3 lg:columns-4 gap-3 space-y-3">
        {shown.map((img, i) => (
          <motion.div key={img.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }} className="break-inside-avoid">
            <div onClick={() => setLightbox(img)}
              className="relative group cursor-pointer overflow-hidden rounded border border-border hover:border-amber/40 transition-all">
              <Image src={img.image_url} alt={img.caption ?? ''} width={400} height={300}
                className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-void/0 group-hover:bg-void/40 transition-all duration-300 flex items-end p-3">
                {img.caption && (
                  <p className="text-snow text-xs opacity-0 group-hover:opacity-100 transition-opacity font-mono">{img.caption}</p>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-void/95 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={e => e.target === e.currentTarget && setLightbox(null)}>
            <button onClick={() => setLightbox(null)}
              className="absolute top-4 right-4 text-ghost hover:text-snow text-2xl z-10">✕</button>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="max-w-4xl w-full">
              <Image src={lightbox.image_url} alt={lightbox.caption ?? ''} width={1200} height={800}
                className="w-full h-auto object-contain rounded" />
              {lightbox.caption && (
                <p className="text-center text-ghost text-sm mt-4 font-mono">{lightbox.caption}</p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
