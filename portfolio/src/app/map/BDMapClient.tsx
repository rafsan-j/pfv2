'use client';
import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { MapLocation } from '@/lib/supabase';
import { supabase } from '@/lib/supabase';

// ── Coordinate math ──────────────────────────────────────────────────────────
// SVG viewBox: 1544.65 × 2132.51
// Bangladesh district paths actually span:
//   X: 42.29 → 1390.71
//   Y: 66.07 → 1700.37
// (measured from actual M commands in path data)
// Geographic bounds: lat 20.59–26.63, lng 88.01–92.68

const VW = 1544.65, VH = 2132.51;
const SVG_X_MIN = 42.29,  SVG_X_MAX = 1390.71;
const SVG_Y_MIN = 66.07,  SVG_Y_MAX = 1700.37;
const BD_LAT_MAX = 26.63, BD_LAT_MIN = 20.59;
const BD_LNG_MIN = 88.01, BD_LNG_MAX = 92.68;

function toSVGPercent(lat: number, lng: number) {
  const svgX = (lng - BD_LNG_MIN) / (BD_LNG_MAX - BD_LNG_MIN) * (SVG_X_MAX - SVG_X_MIN) + SVG_X_MIN;
  const svgY = (BD_LAT_MAX - lat) / (BD_LAT_MAX - BD_LAT_MIN) * (SVG_Y_MAX - SVG_Y_MIN) + SVG_Y_MIN;
  return { x: svgX / VW * 100, y: svgY / VH * 100 };
}

export function BDMapClient() {
  const [locations, setLocations] = useState<MapLocation[]>([]);
  const [selected, setSelected]   = useState<MapLocation | null>(null);
  const [wishlist, setWishlist]   = useState(false);

  useEffect(() => {
    supabase.from('pf_map_locations').select('*').then(({ data }) => {
      if (data) setLocations(data);
    });
  }, []);

  const visible = wishlist ? locations : locations.filter(l => !l.is_wishlist);

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 200px)', minHeight: '500px' }}>

      {/* Controls */}
      <div className="flex items-center gap-4 mb-3 flex-shrink-0 flex-wrap">
        <button
          onClick={() => setWishlist(w => !w)}
          className={`tag transition-all ${wishlist ? 'tag-cyan' : 'tag-ghost'}`}
        >
          {wishlist ? '◉' : '○'} Wishlist
        </button>
        <div className="flex gap-4 text-xs text-ghost">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full inline-block" style={{ background: '#00ff88', boxShadow: '0 0 5px #00ff88' }} />
            Visited
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full inline-block" style={{ background: '#00d4ff', boxShadow: '0 0 5px #00d4ff' }} />
            Wishlist
          </span>
        </div>
      </div>

      {/* Map area */}
      <div className="relative flex-1 panel overflow-hidden flex items-center justify-center" style={{ minHeight: 0, background: '#050d1a' }}>

        {/*
          IMPORTANT: The pin container must match EXACTLY the SVG aspect ratio.
          We use a wrapper div with the same 1544.65:2132.51 ratio.
          Pins are placed as % of this wrapper → they align with SVG coordinates.
        */}
        <div
          className="relative"
          style={{
            aspectRatio: `${VW} / ${VH}`,
            height: '100%',
            maxWidth: '100%',
            maxHeight: '100%',
          }}
        >
          {/* SVG map — fills wrapper exactly */}
          <img
            src="/bd_map_paths.svg"
            alt="Bangladesh District Map"
            className="absolute inset-0 w-full h-full"
            style={{ objectFit: 'fill' }}
          />

          {/* Story pins — % of this wrapper = % of SVG viewBox */}
          {visible.map(loc => {
            const { x, y } = toSVGPercent(loc.latitude, loc.longitude);
            const isSelected = selected?.id === loc.id;
            const color = loc.is_wishlist ? '#00d4ff' : '#00ff88';
            return (
              <button
                key={loc.id}
                onClick={() => setSelected(s => s?.id === loc.id ? null : loc)}
                className="absolute group focus:outline-none z-10"
                style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)' }}
                title={loc.location_name}
              >
                {/* Pulse ring */}
                <span
                  className="absolute rounded-full animate-ping"
                  style={{
                    width: '18px', height: '18px',
                    top: '50%', left: '50%',
                    transform: 'translate(-50%, -50%)',
                    background: color,
                    opacity: 0.3,
                    animationDuration: '2.2s',
                  }}
                />
                {/* Pin */}
                <span
                  className="relative block rounded-full transition-all duration-200"
                  style={{
                    width:       isSelected ? '14px' : '10px',
                    height:      isSelected ? '14px' : '10px',
                    background:  color,
                    boxShadow:   `0 0 ${isSelected ? '14px' : '6px'} ${color}`,
                    border:      `2px solid ${color}`,
                  }}
                />
                {/* Label */}
                <span
                  className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2
                             whitespace-nowrap font-mono text-[9px]
                             bg-surface/95 border border-border rounded px-1.5 py-0.5
                             opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                  style={{ color }}
                >
                  {loc.location_name}
                </span>
              </button>
            );
          })}
        </div>

        {/* Story card */}
        <AnimatePresence>
          {selected && (
            <motion.div
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
              className="absolute bottom-3 left-3 right-3 sm:left-auto sm:right-3 sm:w-60 z-20
                         bg-surface/95 backdrop-blur-sm border border-neon/20 rounded-lg p-4"
            >
              <div className="flex justify-between items-start mb-2">
                <p className="font-display text-sm text-snow">{selected.location_name}</p>
                <button onClick={() => setSelected(null)} className="text-ghost hover:text-snow ml-2">✕</button>
              </div>
              {selected.is_wishlist && <span className="tag tag-cyan text-[10px] mb-2 inline-block">Wishlist</span>}
              {selected.visited_date && <p className="text-[10px] text-muted mb-1">{selected.visited_date}</p>}
              {selected.story && <p className="text-ghost text-xs leading-relaxed">{selected.story}</p>}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Location pills */}
      <div className="flex gap-2 mt-3 flex-wrap flex-shrink-0">
        {visible.map(loc => (
          <button
            key={loc.id}
            onClick={() => setSelected(s => s?.id === loc.id ? null : loc)}
            className={`tag text-[10px] transition-all ${
              selected?.id === loc.id
                ? loc.is_wishlist ? 'tag-cyan' : 'tag-neon'
                : 'tag-ghost hover:text-snow'
            }`}
          >
            {loc.location_name}
          </button>
        ))}
      </div>
    </div>
  );
}
