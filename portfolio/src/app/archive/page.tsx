import { Metadata } from 'next';
import { supabase }  from '@/lib/supabase';
import { NavBar }    from '@/components/layout/NavBar';
import { ArchiveClient } from './ArchiveClient';

export const metadata: Metadata = { title: 'The Archive' };
export const revalidate = 60;

export default async function ArchivePage() {
  const { data: entries } = await supabase
    .from('pf_projects_archive').select('*').order('date_completed', { ascending: false });
  return (
    <>
      <NavBar />
      <main className="max-w-4xl mx-auto px-4 pt-24 pb-16">
        <div className="mb-10">
          <p className="text-cyan text-xs tracking-widest mb-2">// THE ARCHIVE</p>
          <h1 className="font-display text-4xl md:text-5xl text-snow font-bold mb-3">Research & Academic</h1>
          <p className="text-ghost max-w-xl">Theoretical work, competition entries, and experiments. Where ideas live before they ship.</p>
        </div>
        <ArchiveClient entries={entries ?? []} />
      </main>
    </>
  );
}
