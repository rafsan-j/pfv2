import { Metadata } from 'next';
import { supabase }  from '@/lib/supabase';
import { NavBar }    from '@/components/layout/NavBar';
import { GalleryClient } from './GalleryClient';

export const metadata: Metadata = { title: 'Visuals' };
export const revalidate = 60;

export default async function VisualsPage() {
  const { data: images } = await supabase
    .from('pf_gallery_images').select('*').order('uploaded_at', { ascending: false });
  return (
    <>
      <NavBar />
      <main className="max-w-6xl mx-auto px-4 pt-24 pb-16">
        <div className="mb-10">
          <p className="text-[#fb923c] text-xs tracking-widest mb-2">// VISUALS</p>
          <h1 className="font-display text-4xl md:text-5xl text-snow font-bold mb-3">Photography & Art</h1>
          <p className="text-ghost max-w-xl">A visual log. Photography, generative experiments, and UI explorations.</p>
        </div>
        <GalleryClient images={images ?? []} />
      </main>
    </>
  );
}
