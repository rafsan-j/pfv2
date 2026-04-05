import { Metadata }  from 'next';
import { notFound }  from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { supabase }  from '@/lib/supabase';
import { NavBar }    from '@/components/layout/NavBar';
import Link          from 'next/link';

// Pass ALL lucide icons you might use in MDX content.
// Add more here if you use them in your posts.
import {
  BookOpen, Code, Terminal, Zap, Star, Heart,
  ArrowRight, ExternalLink, Info, AlertCircle,
  CheckCircle, XCircle, Lightbulb, Globe,
} from 'lucide-react';

interface Props { params: { slug: string } }

// MDX components — anything you reference in post content must be here
const mdxComponents = {
  // Lucide icons — use in MDX as <BookOpen /> etc.
  BookOpen, Code, Terminal, Zap, Star, Heart,
  ArrowRight, ExternalLink, Info, AlertCircle,
  CheckCircle, XCircle, Lightbulb, Globe,
  // Custom callout box
  Callout: ({ children }: { children: React.ReactNode }) => (
    <div style={{ background: 'rgba(0,255,136,0.05)', border: '1px solid rgba(0,255,136,0.2)', borderRadius: '6px', padding: '1rem', margin: '1.5rem 0' }}>
      {children}
    </div>
  ),
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { data } = await supabase
    .from('pf_inkwell_posts')
    .select('title,excerpt')
    .eq('slug', params.slug)
    .single();
  return { title: data?.title ?? 'Post', description: data?.excerpt };
}

export default async function PostPage({ params }: Props) {
  const { data: post } = await supabase
    .from('pf_inkwell_posts')
    .select('*')
    .eq('slug', params.slug)
    .eq('is_published', true)
    .single();

  if (!post) notFound();

  return (
    <>
      <NavBar />
      <main className="max-w-2xl mx-auto px-4 pt-24 pb-16">
        <Link href="/inkwell" className="text-xs text-[#8888aa] hover:text-[#00ff88] transition-colors mb-8 inline-block">
          ← Back to Inkwell
        </Link>
        <article>
          <header className="mb-10">
            <h1 className="font-display text-3xl md:text-4xl font-bold mb-4 leading-tight" style={{ color: '#e8e8f0' }}>
              {post.title}
            </h1>
            <div className="flex gap-4 text-xs mb-4 font-mono" style={{ color: '#4a4a6a' }}>
              <span>{new Date(post.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
              {post.reading_time && <span>{post.reading_time} min read</span>}
            </div>
            <div className="h-px bg-gradient-to-r from-purple-500/30 via-purple-500/10 to-transparent" />
          </header>
          <div className="mdx-content">
            <MDXRemote source={post.content} components={mdxComponents} />
          </div>
        </article>
      </main>
    </>
  );
}
