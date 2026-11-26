import type { Metadata, Viewport } from 'next';
import './globals.css';
import NavigationHeader from '@/components/NavigationHeader';
import BottomNav from '@/components/BottomNav';
import PwaInstallPrompt from '@/components/PwaInstallPrompt';
import { SeniorModeProvider } from '@/components/SeniorModeContext';
import { AuthRoleProvider } from '@/components/AuthRoleContext';
import RoleAuthModal from '@/components/RoleAuthModal';

export const metadata: Metadata = {
  title: 'Nipah Satay™ | Sistem Pengurusan Operasi & POS',
  description: 'Sistem Pengurusan Komprehensif: Barisan Pengeluaran Sate, POS Meja & Dapur Pintar (KDS) Nipah Satay, Pulau Indah Klang',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/icons/favicon.png', sizes: '64x64', type: 'image/png' },
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
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
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Nipah Satay" />
        <meta name="application-name" content="Nipah Satay" />
        <meta name="theme-color" content="#ea580c" />
      </head>
      <body className="min-h-screen bg-[#0c0a09] text-stone-100 flex flex-col antialiased selection:bg-orange-600 selection:text-white">
        <SeniorModeProvider>
          <AuthRoleProvider>
            <RoleAuthModal />
            <PwaInstallPrompt />
            <NavigationHeader />
            <main className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-6 py-3 sm:py-6 pb-24 md:pb-8">
              {children}
            </main>
            <BottomNav />
          </AuthRoleProvider>
        </SeniorModeProvider>
        
        {/* PWA Service Worker Registration Script with Auto-Update Check */}
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
