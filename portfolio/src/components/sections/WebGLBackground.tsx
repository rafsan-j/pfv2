'use client';
import dynamic from 'next/dynamic';

// ssr: false is CRITICAL — @react-three/fiber reads ReactCurrentOwner
// at module evaluation time which crashes on the server.
const WebGLScene = dynamic(() => import('./WebGLScene'), {
  ssr: false,
  loading: () => null,
});

export function WebGLBackground() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      <WebGLScene />
    </div>
  );
}
