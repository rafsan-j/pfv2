import { Metadata } from 'next';
import { supabase }  from '@/lib/supabase';
import { NavBar }    from '@/components/layout/NavBar';
import { LabClient } from './LabClient';

export const metadata: Metadata = { title: 'The Lab' };
export const revalidate = 60;

export default async function LabPage() {
  const { data: projects } = await supabase
    .from('pf_projects_lab').select('*').order('sort_order', { ascending: true });
  return (
    <>
      <NavBar />
      <main className="max-w-6xl mx-auto px-4 pt-24 pb-16">
        <div className="mb-10">
          <p className="text-neon text-xs tracking-widest mb-2">// THE LAB</p>
          <h1 className="font-display text-4xl md:text-5xl text-snow font-bold mb-3">Projects & Builds</h1>
          <p className="text-ghost max-w-xl">Things I've built, broken, and rebuilt. From precision agriculture to particle physics.</p>
        </div>
        <LabClient projects={projects ?? []} />
      </main>
    </>
  );
}
