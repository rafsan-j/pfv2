'use client';
import { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

function Particles() {
  const ref = useRef<THREE.Points>(null!);
  const { mouse } = useThree();

  const [positions, colors] = useMemo(() => {
    const count = 700;
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i*3]   = (Math.random() - .5) * 22;
      pos[i*3+1] = (Math.random() - .5) * 22;
      pos[i*3+2] = (Math.random() - .5) * 10;
      const t = Math.random();
      col[i*3]   = 0;
      col[i*3+1] = t * 1 + (1-t) * .83;
      col[i*3+2] = t * .53 + (1-t) * 1;
    }
    return [pos, col];
  }, []);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.elapsedTime * .04;
    ref.current.rotation.y = t;
    ref.current.rotation.x = t * .3;
    ref.current.position.x += (mouse.x * .4 - ref.current.position.x) * .05;
    ref.current.position.y += (mouse.y * .3 - ref.current.position.y) * .05;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color"    args={[colors, 3]}    />
      </bufferGeometry>
      <pointsMaterial size={.04} vertexColors transparent opacity={.55} sizeAttenuation />
    </points>
  );
}

export function WebGLBackground() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      <Canvas camera={{ position: [0, 0, 5], fov: 60 }}
        gl={{ antialias: false, alpha: true }} dpr={[1, 1.5]}>
        <Particles />
      </Canvas>
    </div>
  );
}
