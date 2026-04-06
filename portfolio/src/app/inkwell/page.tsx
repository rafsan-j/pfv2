'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { NavBar } from '@/components/layout/NavBar';
import { supabase } from '@/lib/supabase';
import type { InkwellPost } from '@/lib/supabase';

export default function InkwellPage() {
  const [posts, setPosts]   = useState<InkwellPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('pf_inkwell_posts')
      .select('id, title, slug, excerpt, reading_time, created_at, is_published')
      .eq('is_published', true)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) setPosts(data as InkwellPost[]);
        setLoading(false);
      });
  }, []);

  return (
    <>
      <NavBar />
      <main className="min-h-screen max-w-3xl mx-auto px-4 pt-24 pb-20" style={{ background: '#050505' }}>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <p className="text-xs tracking-widest font-mono mb-2" style={{ color: '#8888aa' }}>// THE INKWELL</p>
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-3" style={{ color: '#e8e8f0' }}>
            Writing
          </h1>
          <p className="text-sm" style={{ color: '#8888aa' }}>
            Essays, poetry, and thoughts. Words are code too.
          </p>
        </motion.div>

        {/* Posts */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 rounded-lg animate-pulse" style={{ background: '#111118' }} />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-4xl mb-4">✍</p>
            <p className="text-sm font-mono" style={{ color: '#8888aa' }}>Nothing published yet.</p>
          </div>
        ) : (
          <div className="space-y-px">
            {posts.map((post, i) => (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}>
                <Link
                  href={`/inkwell/${post.slug}`}
                  className="group block border-b py-7 transition-all"
                  style={{ borderColor: '#1a1a2e' }}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h2
                        className="text-lg font-medium mb-2 group-hover:text-[#a78bfa] transition-colors"
                        style={{ color: '#e8e8f0' }}>
                        {post.title}
                      </h2>
                      {post.excerpt && (
                        <p className="text-sm leading-relaxed mb-3 line-clamp-2" style={{ color: '#8888aa' }}>
                          {post.excerpt}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-xs font-mono" style={{ color: '#4a4a6a' }}>
                        <span>
                          {new Date(post.created_at).toLocaleDateString('en-GB', {
                            day: 'numeric', month: 'short', year: 'numeric',
                          })}
                        </span>
                        {post.reading_time && <span>{post.reading_time} min read</span>}
                      </div>
                    </div>
                    <span
                      className="text-lg opacity-0 group-hover:opacity-100 transition-all translate-x-0 group-hover:translate-x-1 flex-shrink-0 mt-1"
                      style={{ color: '#a78bfa' }}>
                      →
                    </span>
                  </div>
                </Link>
              </motion.article>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
