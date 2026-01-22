import type { Metadata } from 'next';
import './globals.css';
import { AppProvider } from '@/contexts/app-provider';
import { ThemeProvider } from '@/components/shared/theme-provider';
import { Toaster } from '@/components/ui/toaster';

export const metadata: Metadata = {
  title: 'Reserva de Salones Parroquiales',
  description: 'Reserva salones para eventos parroquiales fácilmente.',
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&family=PT+Sans:wght@400;700&display=swap"
          rel="stylesheet"
        />
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className="font-body antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <AppProvider>
            {children}
            <Toaster />
          </AppProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
