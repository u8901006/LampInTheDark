import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'LampInTheDark - DBT-PTSD 電子日誌卡',
  description: 'DBT-PTSD 治療日誌卡電子化平台，供案主記錄每日與每週的治療進展。'
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-Hant">
      <body>
        {children}
      </body>
    </html>
  );
}
