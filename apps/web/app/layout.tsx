import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/header';
import { QueryProvider } from '@/providers/query-provider';
import { Toaster } from '@/components/ui/sonner';

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
    <html lang="en" className="dark">
      <body className="font-sans antialiased">
        <QueryProvider>
          <Header />
          {children}
          <Toaster />
        </QueryProvider>
      </body>
    </html>
  );
}
