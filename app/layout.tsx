import type { Metadata, Viewport } from 'next';
import './globals.css';
import NavigationHeader from '@/components/NavigationHeader';
import { SeniorModeProvider } from '@/components/SeniorModeContext';

export const metadata: Metadata = {
  title: 'Nipah Satay™ | Sistem Pengurusan Operasi & POS',
  description: 'Sistem Pengurusan Komprehensif: Barisan Pengeluaran Sate, POS Meja & Dapur Pintar (KDS) Nipah Satay, Pulau Indah Klang',
  manifest: '/manifest.json',
  icons: {
    icon: '/images/satay_skewer.jpg',
    apple: '/images/satay_skewer.jpg',
  },
};

export const viewport: Viewport = {
  themeColor: '#ea580c',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ms">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className="min-h-screen bg-[#0c0a09] text-stone-100 flex flex-col antialiased selection:bg-orange-600 selection:text-white">
        <SeniorModeProvider>
          <NavigationHeader />
          <main className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-6 py-4">
            {children}
          </main>
        </SeniorModeProvider>
        
        {/* PWA Service Worker Registration Script */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(
                    function(registration) {
                      registration.update();
                      console.log('Nipah Satay PWA SW registered successfully');
                    },
                    function(err) {
                      console.log('SW registration failed: ', err);
                    }
                  );
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
