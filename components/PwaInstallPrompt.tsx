'use client';

import React, { useState, useEffect } from 'react';
import { Download, Smartphone, X, CheckCircle2, MoreVertical, PlusSquare, ArrowUpRight } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export default function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [showBanner, setShowBanner] = useState(true);

  useEffect(() => {
    // Check if app is already running in standalone mode (installed PWA)
    if (
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true
    ) {
      setIsInstalled(true);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const installedHandler = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      setShowGuideModal(false);
    };

    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', installedHandler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', installedHandler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === 'accepted') {
          setIsInstalled(true);
        }
        setDeferredPrompt(null);
      } catch (err) {
        setShowGuideModal(true);
      }
    } else {
      // If native deferred prompt isn't fired yet by the browser, show visual guide
      setShowGuideModal(true);
    }
  };

  if (isInstalled) {
    return null;
  }

  return (
    <>
      {/* Top Banner on Mobile & Tablet */}
      {showBanner && (
        <div className="bg-gradient-to-r from-orange-950 via-stone-900 to-amber-950 border-b border-orange-800/60 px-3 py-2 text-stone-100 flex items-center justify-between gap-2 shadow-md">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-orange-600 flex items-center justify-center flex-shrink-0 shadow-sm animate-pulse">
              <Download className="w-4 h-4 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-extrabold text-orange-200 truncate">
                Pasang Aplikasi Nipah Satay™ (PWA)
              </p>
              <p className="text-[10px] text-stone-400 truncate">
                Boleh dibuka skrin penuh tanpa browser bar & jimat kuota data
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              onClick={handleInstallClick}
              className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-extrabold text-xs shadow-md border border-orange-400 active:scale-95 flex items-center gap-1.5 cursor-pointer"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Pasang App</span>
            </button>
            <button
              onClick={() => setShowBanner(false)}
              className="p-1 rounded-md text-stone-400 hover:text-white"
              title="Tutup banner"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Panduan Pasang PWA Modal (Untuk Chrome Tablet & Android Lama) */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-orange-800/80 rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl relative text-stone-100">
            <button
              onClick={() => setShowGuideModal(false)}
              className="absolute top-4 right-4 p-1 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-600 flex items-center justify-center shadow-md">
                <Smartphone className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-white">Cara Pasang Aplikasi (Tablet & Telefon)</h3>
                <p className="text-xs text-orange-400 font-medium">Langkah mudah muat turun ke Skrin Utama</p>
              </div>
            </div>

            <div className="space-y-3 bg-stone-950/80 p-3.5 rounded-xl border border-stone-800 text-xs">
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-orange-600/30 text-orange-400 font-extrabold flex items-center justify-center flex-shrink-0 text-xs border border-orange-500/40">
                  1
                </span>
                <div>
                  <p className="font-bold text-stone-200">Tekan Menu Tiga Titik di Chrome</p>
                  <p className="text-stone-400 text-[11px] mt-0.5 flex items-center gap-1">
                    Lihat bucu atas kanan pelayar Chrome anda dan tekan <MoreVertical className="w-3.5 h-3.5 inline text-amber-400" />.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-orange-600/30 text-orange-400 font-extrabold flex items-center justify-center flex-shrink-0 text-xs border border-orange-500/40">
                  2
                </span>
                <div>
                  <p className="font-bold text-stone-200">Pilih &quot;Pasang Aplikasi&quot; atau &quot;Tambah ke Skrin Utama&quot;</p>
                  <p className="text-stone-400 text-[11px] mt-0.5 flex items-center gap-1">
                    Cari pilihan bertulis <PlusSquare className="w-3.5 h-3.5 inline text-emerald-400" /> <b>&quot;Install app&quot;</b> atau <b>&quot;Add to Home screen&quot;</b>.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-orange-600/30 text-orange-400 font-extrabold flex items-center justify-center flex-shrink-0 text-xs border border-orange-500/40">
                  3
                </span>
                <div>
                  <p className="font-bold text-stone-200">Tekan &quot;Pasang&quot; / &quot;Install&quot;</p>
                  <p className="text-stone-400 text-[11px] mt-0.5">
                    Ikon logo <b>Nipah Satay™</b> akan terus muncul pada desktop tablet/telefon anda seperti aplikasi biasa tanpa palang browser!
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowGuideModal(false)}
                className="w-full py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs shadow-lg transition-all"
              >
                Faham &amp; Saya Akan Cuba Sekarang
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
