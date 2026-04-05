import { Metadata } from 'next';
import { NavBar }    from '@/components/layout/NavBar';
import { BDMapClient } from './BDMapClient';

export const metadata: Metadata = { title: 'Coordinates — Bangladesh Map' };

export default function MapPage() {
  return (
    <>
      <NavBar />
      <main className="max-w-6xl mx-auto px-4 pt-24 pb-16">
        <div className="mb-8">
          <p className="text-neon text-xs tracking-widest mb-2">// COORDINATES</p>
          <h1 className="font-display text-4xl md:text-5xl text-snow font-bold mb-3">Bangladesh on the Grid</h1>
          <p className="text-ghost max-w-xl">Every place that shaped me. Click a location to read the story.</p>
        </div>
        <BDMapClient />
      </main>
    </>
  );
}
