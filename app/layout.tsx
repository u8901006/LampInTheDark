import type { Metadata } from 'next';

import './globals.css';

export const metadata: Metadata = {
  title: 'LampInTheDark',
  description: 'Anonymous trauma-support posting platform with resilient AI moderation.'
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-Hant">
      <body>{children}</body>
    </html>
  );
}
