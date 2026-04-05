import { Metadata }  from 'next';
import { notFound }  from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { supabase }  from '@/lib/supabase';
import { NavBar }    from '@/components/layout/NavBar';
import Link          from 'next/link';

interface Props { params: { slug: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { data } = await supabase.from('pf_inkwell_posts').select('title,excerpt').eq('slug', params.slug).single();
  return { title: data?.title ?? 'Post', description: data?.excerpt };
}

export default async function PostPage({ params }: Props) {
  const { data: post } = await supabase
    .from('pf_inkwell_posts').select('*').eq('slug', params.slug).eq('is_published', true).single();
  if (!post) notFound();

  return (
    <>
      <NavBar />
      <main className="max-w-2xl mx-auto px-4 pt-24 pb-16">
        <Link href="/inkwell" className="text-xs text-ghost hover:text-neon transition-colors mb-8 inline-block">← Back to Inkwell</Link>
        <article>
          <header className="mb-10">
            <h1 className="font-display text-3xl md:text-4xl text-snow font-bold mb-4 leading-tight">{post.title}</h1>
            <div className="flex gap-4 text-xs text-muted mb-4">
              <span>{new Date(post.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
              {post.reading_time && <span>{post.reading_time} min read</span>}
            </div>
            <div className="h-px bg-gradient-to-r from-purple-500/30 via-purple-500/10 to-transparent" />
          </header>
          <div className="mdx-content">
            <MDXRemote source={post.content} />
          </div>
        </article>
      </main>
    </>
  );
}
