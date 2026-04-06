import { NavBar }      from '@/components/layout/NavBar';
import { BDMapClient } from './BDMapClient';

export const metadata = { title: 'Coordinates | Rafsan Jani' };

export default function MapPage() {
  return (
    <>
      <NavBar />
      <main className="min-h-screen px-4 pt-20 pb-16 max-w-5xl mx-auto" style={{ background: '#050505' }}>

        {/* Header */}
        <div className="mb-6">
          <p className="text-xs tracking-widest font-mono mb-1" style={{ color: '#8888aa' }}>
            // COORDINATES
          </p>
          <h1 className="font-display text-3xl font-bold mb-1" style={{ color: '#e8e8f0' }}>
            Bangladesh
          </h1>
          <p className="text-xs font-mono" style={{ color: '#4a4a6a' }}>
            Places visited · memories made · places to go
          </p>
        </div>

        {/* Map component */}
        <BDMapClient />

      </main>
    </>
  );
}
