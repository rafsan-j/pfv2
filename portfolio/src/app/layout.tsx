import type { Metadata, Viewport } from 'next';
import '@/styles/globals.css';
import { VisitorModeProvider } from '@/components/ui/VisitorModeProvider';
import { CommandPalette }      from '@/components/ui/CommandPalette';
import { Terminal }            from '@/components/ui/Terminal';

export const metadata: Metadata = {
  title: { default: 'Rafsan Jani', template: '%s | Rafsan Jani' },
  description: 'Engineering Aspirant. Top 0.01% National Merit. Builder of AgriBase, CERN Beamline experiments, and sustainable tech.',
  keywords: ['Rafsan Jani', 'CSE', 'Bangladesh', 'Portfolio', 'AI'],
  authors: [{ name: 'Rafsan Jani' }],
  openGraph: {
    type: 'website', locale: 'en_US', siteName: 'Rafsan Jani',
    title: 'Rafsan Jani — Engineering Aspirant',
    description: 'Building at the intersection of AI and sustainable infrastructure.',
  },
  twitter: { card: 'summary_large_image' },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = { themeColor: '#050505', colorScheme: 'dark' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-void text-snow font-mono antialiased">
        <VisitorModeProvider>
          {children}
          <CommandPalette />
          <Terminal />
        </VisitorModeProvider>
      </body>
    </html>
  );
}
