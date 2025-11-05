import type { Metadata } from 'next';
import { Navigation } from './components/Navigation';
import './globals.css';

export const metadata: Metadata = {
  title: 'TisOps Hub',
  description: 'Operations and Analytics Hub',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Navigation />
        {children}
      </body>
    </html>
  );
}
