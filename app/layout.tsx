import type { Metadata } from 'next';

import { SoundBathProvider } from '@/components/sound-bath/sound-bath-context';
import { FloatingPlayer } from '@/components/sound-bath/floating-player';

import './globals.css';

export const metadata: Metadata = {
  title: 'LampInTheDark',
  description: 'Anonymous trauma-support posting platform with resilient AI moderation.'
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-Hant">
      <body>
        <SoundBathProvider>
          {children}
          <FloatingPlayer />
        </SoundBathProvider>
      </body>
    </html>
  );
}
