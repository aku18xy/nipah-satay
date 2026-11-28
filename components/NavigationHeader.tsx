'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Flame, 
  Store, 
  CookingPot, 
  Factory, 
  Package, 
  BarChart3, 
  Menu as MenuIcon, 
  X,
  ExternalLink,
  Download,
  UserCheck,
  Layers,
  ArrowRight,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { useAuthRole } from './AuthRoleContext';

export default function NavigationHeader() {
  const pathname = usePathname();
  const [isOnline, setIsOnline] = useState(true);
  const [appLauncherOpen, setAppLauncherOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { roleConfig, canAccess, setShowAuthModal } = useAuthRole();

  useEffect(() => {
    setMounted(true);
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Kunci tatalan latar belakang semasa App Launcher dibuka
  useEffect(() => {
    if (appLauncherOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [appLauncherOpen]);

  // Tutup App Launcher bila route bertukar atau bila Escape ditekan
  useEffect(() => {
    setAppLauncherOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setAppLauncherOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Senarai Modul Aplikasi Kendiri (Single App Architecture)
  const allNavLinks = [
    { 
      href: '/pos', 
      label: 'POS Kaunter', 
      sublabel: 'Pesanan Meja, Bungkus & Kira Bil', 
      icon: Store, 
      badge: 'Kaunter',
      color: 'from-orange-500 to-amber-600',
      description: 'Aplikasi juruwang untuk pesanan meja makan dulu, bungkus walk-in, dan kiraan bil terus.'
    },
    { 
      href: '/pos/backoffice', 
      label: 'POS Backoffice', 
      sublabel: 'Urus Menu, Harga, Gambar & Kategori', 
      icon: Layers, 
      badge: 'Katalog',
      color: 'from-amber-500 to-orange-600',
      description: 'Aplikasi pengurusan menu, kemas kini harga, ketersediaan stok, dan kategori makanan.'
    },
    { 
      href: '/kitchen', 
      label: 'Dapur KDS Live', 
      sublabel: 'Paparan Tiket Grill, Wok & Bar Minuman', 
      icon: CookingPot, 
      badge: 'Live Dapur',
      color: 'from-red-500 to-orange-600',
      description: 'Aplikasi paparan dapur pintar untuk giliran panggangan sate arang, kuali panas dan minuman.'
    },
    { 
      href: '/production', 
      label: 'Kilang Sate', 
      sublabel: 'Pemprosesan Daging, Cucuk & Chiller', 
      icon: Factory, 
      badge: 'Pengeluaran',
      color: 'from-amber-600 to-yellow-600',
      description: 'Aplikasi kilang untuk hasil timbang daging segar, cucuk sate harian, dan peti sejuk beku.'
    },
    { 
      href: '/wholesale', 
      label: 'Borong & Katering', 
      sublabel: 'Pesanan Pukal B2B & Tempahan Acara', 
      icon: Package, 
      badge: 'B2B',
      color: 'from-emerald-500 to-teal-600',
      description: 'Aplikasi pengurusan pesanan borong sate mentah/bakar dan katering majlis keraian.'
    },
    { 
      href: '/reports', 
      label: 'Laporan & Kos', 
      sublabel: 'Analitik Jualan, Margin & Kos Operasi', 
      icon: BarChart3, 
      badge: 'Eksekutif',
      color: 'from-blue-500 to-indigo-600',
      description: 'Aplikasi laporan perniagaan, kos makanan (COGS), dan keuntungan bersih harian.'
    },
    { 
      href: '/', 
      label: 'Pusat Kawalan Utama', 
      sublabel: 'Ringkasan Eksekutif & Metrik Utama', 
      icon: Flame, 
      badge: 'Ringkasan',
      color: 'from-orange-600 to-red-600',
      description: 'Aplikasi pemantauan eksekutif dan status operasi dua sayap (Restoran & Kilang).'
    },
    { 
      href: '/menu', 
      label: 'Menu Pelanggan', 
      sublabel: 'Katalog Paparan QR untuk Pelanggan', 
      icon: ExternalLink, 
      badge: 'Pelanggan',
      color: 'from-stone-700 to-stone-800',
      description: 'Aplikasi paparan menu digital mesra telefon untuk pelanggan imbas kod QR meja.'
    },
  ];

  // Tapis modul berdasarkan kebenaran peranan
  const navLinks = allNavLinks.filter((link) => canAccess(link.href));
  const homeHref = roleConfig?.id === 'executive' ? '/' : roleConfig?.id === 'kitchen' ? '/kitchen' : roleConfig?.id === 'production' ? '/production' : '/pos';

  // Kenal pasti modul aplikasi semasa
  const currentApp = allNavLinks.find(link => link.href === pathname) 
    || (pathname.startsWith('/pos/backoffice') ? allNavLinks[1] : pathname.startsWith('/pos') ? allNavLinks[0] : null);

  const CurrentAppIcon = currentApp ? currentApp.icon : Flame;

  return (
    <header className="sticky top-0 z-50 neu-nav-bar text-stone-100 select-none">
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo & Aplikasi Aktif Semasa */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <Link href={homeHref} className="flex items-center gap-2 group min-w-0">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-neu-orange group-hover:scale-105 transition-transform flex-shrink-0">
                <Flame className="w-4 h-4 sm:w-5 sm:h-5 text-white animate-pulse" />
              </div>
              <div className="min-w-0 hidden sm:block">
                <span className="font-extrabold text-sm tracking-tight bg-gradient-to-r from-orange-400 via-amber-300 to-amber-500 bg-clip-text text-transparent truncate block">
                  NIPAH SATAY™
                </span>
              </div>
            </Link>

            {/* Lencana Modul Aplikasi Aktif (Single App Indicator) */}
            {currentApp && (
              <div className="flex items-center gap-1.5 pl-1 sm:pl-2 border-l border-stone-800/80">
                <span className="px-2.5 py-1 rounded-xl neu-inset-sm text-xs font-black text-orange-400 flex items-center gap-1.5 truncate max-w-[140px] sm:max-w-none">
                  <CurrentAppIcon className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                  <span className="truncate">{currentApp.label}</span>
                </span>
              </div>
            )}
          </div>

          {/* Navigasi Utama: Melalui Butang Burger Sahaja (Semua Modul Diuruskan Sebagai Aplikasi Kendiri) */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 flex-shrink-0">
            {/* Pulau Indah Connectivity Indicator */}
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[10px] sm:text-xs font-bold ${
                isOnline
                  ? 'neu-inset-sm text-emerald-400'
                  : 'neu-inset-sm text-amber-300 animate-pulse'
              }`}
              title={isOnline ? 'Online' : 'Offline'}
            >
              <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]' : 'bg-amber-400'}`} />
              <span className="hidden md:inline">{isOnline ? 'Online' : 'Offline'}</span>
            </div>

            {/* Role Authentication Badge & Switch Button */}
            <button
              type="button"
              onClick={() => setShowAuthModal(true)}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl neu-btn text-stone-200 text-xs font-bold transition-all active:scale-95"
              title="Tukar Peranan Petugas (Role-Based Auth)"
            >
              <span>{roleConfig ? roleConfig.icon : '👤'}</span>
              <span className="text-[10px] sm:text-xs font-black text-amber-300 hidden sm:inline">
                {roleConfig ? roleConfig.shortLabel : 'Akses'}
              </span>
            </button>

            {/* BUTANG BURGER UTAMA (Pintu Masuk Semua Aplikasi & Modul) */}
            <button
              type="button"
              onClick={() => setAppLauncherOpen(!appLauncherOpen)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all active:scale-95 cursor-pointer ${
                appLauncherOpen
                  ? 'neu-btn-primary shadow-neu-orange text-white'
                  : 'neu-btn text-stone-200 hover:text-white'
              }`}
              aria-label="Buka Pelancar Aplikasi"
              title="Buka Menu Modul / Pelancar Aplikasi"
            >
              {appLauncherOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <MenuIcon className="w-5 h-5 text-orange-400" />
              )}
              <span className="font-extrabold text-xs hidden sm:inline">Aplikasi</span>
            </button>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* PELANCAR APLIKASI (PORTAL TOP-LEVEL KE DOCUMENT.BODY)    */}
      {/* ======================================================== */}
      {mounted && appLauncherOpen && createPortal(
        <div 
          className="fixed inset-0 z-[9999] bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fadeIn"
          onClick={() => setAppLauncherOpen(false)}
        >
          <div 
            className="neu-card-lg max-w-2xl w-full max-h-[92vh] sm:max-h-[88vh] flex flex-col rounded-3xl relative text-stone-100 shadow-neu-flat-lg overflow-hidden border border-stone-800/80 bg-[#181614]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Pelancar Aplikasi (Pinned Top - Tidak Akan Terpotong) */}
            <div className="p-4 sm:p-5 border-b border-stone-800/80 flex items-center justify-between shrink-0 bg-[#181614]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white shadow-neu-orange shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                    <span>Pusat Aplikasi Nipah Satay™</span>
                  </h2>
                  <p className="text-[11px] text-stone-400">
                    Pilih modul aplikasi kendiri untuk dilancarkan:
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setAppLauncherOpen(false)}
                className="p-2.5 rounded-xl neu-btn text-stone-400 hover:text-white shrink-0 active:scale-95"
                title="Tutup (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Grid Aplikasi Kendiri (Scrollable Cleanly) */}
            <div className="p-3 sm:p-4 overflow-y-auto flex-1 min-h-0 space-y-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5">
                {navLinks.map((app) => {
                  const Icon = app.icon;
                  const isCurrent = pathname === app.href || (app.href === '/pos' && pathname.startsWith('/pos') && !pathname.startsWith('/pos/backoffice'));

                  return (
                    <Link
                      key={app.href}
                      href={app.href}
                      onClick={() => setAppLauncherOpen(false)}
                      className={`p-3 rounded-2xl flex items-center gap-3 transition-all duration-200 cursor-pointer active:scale-98 ${
                        isCurrent
                          ? 'neu-inset border border-orange-500/60 shadow-neu-pressed'
                          : 'neu-card hover:shadow-neu-flat-lg hover:border-orange-500/30'
                      }`}
                    >
                      <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${app.color} flex items-center justify-center text-white shrink-0 shadow-md`}>
                        <Icon className="w-5 h-5" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className={`font-black text-sm truncate ${isCurrent ? 'text-orange-400' : 'text-white'}`}>
                            {app.label}
                          </span>
                          {isCurrent ? (
                            <span className="text-[9px] font-black px-2 py-0.5 rounded-full neu-btn-primary text-white shadow-neu-orange shrink-0">
                              Aktif
                            </span>
                          ) : (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-lg neu-inset-sm text-stone-400 shrink-0">
                              {app.badge}
                            </span>
                          )}
                        </div>

                        <p className="text-[11px] text-stone-300 font-semibold mt-0.5 truncate">
                          {app.sublabel}
                        </p>
                      </div>

                      <ArrowRight className={`w-4 h-4 shrink-0 transition-transform ${isCurrent ? 'text-orange-400' : 'text-stone-500'}`} />
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Footer (Pinned Bottom - Sentiasa Boleh Dilihat) */}
            <div className="p-3.5 sm:p-4 border-t border-stone-800/80 bg-[#151311] shrink-0 flex flex-col sm:flex-row items-center justify-between gap-2.5">
              <div className="flex items-center gap-2 text-xs text-stone-400">
                <span>Peranan:</span>
                <span className="font-extrabold text-amber-300">{roleConfig ? roleConfig.label : 'Petugas'}</span>
                <button
                  type="button"
                  onClick={() => {
                    setAppLauncherOpen(false);
                    setShowAuthModal(true);
                  }}
                  className="px-2.5 py-1 rounded-lg neu-btn text-[10px] font-bold text-orange-400 hover:text-white active:scale-95"
                >
                  Tukar Peranan
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  setAppLauncherOpen(false);
                  const event = new CustomEvent('nipah:install-pwa');
                  window.dispatchEvent(event);
                  alert(
                    'Cara Pasang PWA Nipah Satay™:\n\n1. Tekan butang menu 3 titik (⋮) di bucu atas kanan Chrome.\n2. Pilih "Install app" atau "Add to Home screen" (Tambah ke Skrin Utama).\n3. Tekan "Install" untuk muat turun ke desktop/tablet anda!'
                  );
                }}
                className="px-3 py-1.5 rounded-xl neu-btn text-xs font-bold text-stone-300 hover:text-white flex items-center gap-1.5 active:scale-95"
              >
                <Download className="w-3.5 h-3.5 text-orange-400" />
                <span>Pasang PWA ke Skrin Utama</span>
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </header>
  );
}
