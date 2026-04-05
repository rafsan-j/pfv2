import { Metadata } from 'next';
import { supabase }  from '@/lib/supabase';
import { NavBar }    from '@/components/layout/NavBar';
import Link          from 'next/link';

export const metadata: Metadata = { title: 'The Inkwell' };
export const revalidate = 60;

export default async function InkwellPage() {
  const { data: posts } = await supabase
    .from('pf_inkwell_posts')
    .select('id, title, slug, excerpt, reading_time, created_at')
    .eq('is_published', true)
    .order('created_at', { ascending: false });

  return (
    <>
      <NavBar />
      <main className="max-w-3xl mx-auto px-4 pt-24 pb-16">
        <div className="mb-10">
          <p className="text-[#a78bfa] text-xs tracking-widest mb-2">// THE INKWELL</p>
          <h1 className="font-display text-4xl md:text-5xl text-snow font-bold mb-3">Writing & Poetry</h1>
          <p className="text-ghost max-w-xl">Essays, verse, and thoughts. Some technical, some human, all honest.</p>
        </div>

        {(!posts || posts.length === 0) ? (
          <div className="panel p-12 text-center">
            <p className="font-display text-xs mb-3" style={{ color: '#a78bfa' }}>// FIRST ENTRY LOADING</p>
            <p className="text-ghost text-sm">Write your first post from the admin dashboard.<span className="cursor" /></p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map(post => (
              <Link key={post.id} href={`/inkwell/${post.slug}`}>
                <div className="panel panel-accent p-6 group cursor-pointer hover:border-purple-500/30 transition-all duration-300">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h2 className="font-display text-base text-snow mb-2 group-hover:text-purple-400 transition-colors">{post.title}</h2>
                      {post.excerpt && <p className="text-ghost text-sm leading-relaxed line-clamp-2 mb-3">{post.excerpt}</p>}
                      <div className="flex gap-4 text-xs text-muted">
                        <span>{new Date(post.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        {post.reading_time && <span>{post.reading_time} min read</span>}
                      </div>
                    </div>
                    <span className="text-ghost group-hover:text-purple-400 text-lg transition-colors mt-1 flex-shrink-0">→</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
