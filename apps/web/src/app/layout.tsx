import type { Metadata } from 'next';
import { Providers } from './providers';
import './globals.css';

export const metadata: Metadata = {
  title: {
    template: '%s | School ERP',
    default: 'School ERP — Management System',
  },
  description: 'Production-grade ERP for school management — students, faculty, finance, analytics.',
  robots: { index: false, follow: false }, // Don't index ERP app
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
