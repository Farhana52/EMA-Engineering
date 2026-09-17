import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import { ToastProvider } from '@/components/Toast';

export const metadata: Metadata = {
  title: 'Invoice & Quotation System | Enterprise Billing',
  description: 'Commercial quotation and invoice generation software system with MongoDB integration and high-fidelity PDF export.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 antialiased">
        <ToastProvider>
          <Navbar />
          <main className="flex-1">
            {children}
          </main>
        </ToastProvider>
      </body>
    </html>
  );
}
