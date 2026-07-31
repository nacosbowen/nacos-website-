import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Providers } from './providers';
import TechBackground from '@/components/TechBackground';

export const metadata: Metadata = {
  title: 'NACOS Bowen University',
  description: 'Nigerian Association of Computer Science Students — Bowen University Chapter',
  manifest: '/manifest.json',
  appleWebApp: { capable: true, statusBarStyle: 'default', title: 'NACOS' },
};

export const viewport: Viewport = {
  themeColor: '#1d4ed8',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <TechBackground />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
