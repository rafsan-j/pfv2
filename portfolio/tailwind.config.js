/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        // IMPORTANT: Do NOT use names that clash with Tailwind built-ins.
        // 'border' and 'surface' were renamed below.
        void:      '#050505',
        surface:   '#0d0d12',   // used as bg-surface  (safe — not a built-in)
        'panel-c': '#111118',   // was 'panel' — renamed to avoid confusion
        'border-c':'#1a1a2e',   // was 'border' — Tailwind uses 'border' internally
        neon:      '#00ff88',
        cyan:      '#00d4ff',
        amber:     '#ffb400',
        muted:     '#4a4a6a',
        dim:       '#2a2a3e',
        ghost:     '#8888aa',
        snow:      '#e8e8f0',
      },
      fontFamily: {
        // 'display' is a valid CSS font-display property, but as a Tailwind
        // font utility it's fine because Tailwind prefixes it: font-display
        mono:    ['JetBrains Mono', 'monospace'],
        display: ['Orbitron', 'monospace'],
        sans:    ['Space Grotesk', 'sans-serif'],
        serif:   ['Playfair Display', 'Georgia', 'serif'],
      },
      animation: {
        'pulse-neon':   'pulseNeon 2s ease-in-out infinite',
        'cursor-blink': 'blink 1s step-end infinite',
        'fade-up':      'fadeUp 0.6s ease forwards',
      },
      keyframes: {
        pulseNeon: {
          '0%, 100%': { boxShadow: '0 0 5px #00ff88, 0 0 10px #00ff88' },
          '50%':      { boxShadow: '0 0 20px #00ff88, 0 0 40px #00ff88' },
        },
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0' },
        },
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(24px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
      },
      boxShadow: {
        'neon':    '0 0 10px rgba(0,255,136,0.5), 0 0 20px rgba(0,255,136,0.2)',
        'neon-lg': '0 0 20px rgba(0,255,136,0.6), 0 0 40px rgba(0,255,136,0.3)',
        'cyan':    '0 0 10px rgba(0,212,255,0.5)',
      },
    },
  },
  plugins: [],
};
