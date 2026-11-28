'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Flame, 
  Store, 
  CookingPot, 
  Factory, 
  Package, 
  BarChart3, 
  Wifi, 
  WifiOff, 
  Menu as MenuIcon, 
  X,
  ExternalLink,
  Glasses,
  Download,
  UserCheck,
  Layers
} from 'lucide-react';
import { useSeniorMode } from './SeniorModeContext';
import { useAuthRole } from './AuthRoleContext';

export default function NavigationHeader() {
  const pathname = usePathname();
  const [isOnline, setIsOnline] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isSeniorMode, toggleSeniorMode } = useSeniorMode();
  const { roleConfig, canAccess, setShowAuthModal } = useAuthRole();

  useEffect(() => {
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

  const allNavLinks = [
    { href: '/', label: 'Ringkasan', icon: Flame },
    { href: '/pos', label: 'POS Kaunter', icon: Store, badge: 'Meja' },
    { href: '/pos/backoffice', label: 'Backoffice', icon: Layers, badge: 'Menu' },
    { href: '/kitchen', label: 'Dapur KDS', icon: CookingPot, badge: 'Live' },
    { href: '/production', label: 'Kilang Sate', icon: Factory, badge: 'Hasil' },
    { href: '/wholesale', label: 'Borong & Katering', icon: Package },
    { href: '/reports', label: 'Laporan & Kos', icon: BarChart3 },
    { href: '/menu', label: 'Menu Pelanggan', icon: ExternalLink },
  ];

  // Filter links dynamically based on role permissions
  const navLinks = allNavLinks.filter((link) => canAccess(link.href));
  const homeHref = roleConfig?.id === 'executive' ? '/' : roleConfig?.id === 'kitchen' ? '/kitchen' : roleConfig?.id === 'production' ? '/production' : '/pos';

  return (
    <header className="sticky top-0 z-50 neu-nav-bar text-stone-100">
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo & Outlet Location */}
          <Link href={homeHref} className="flex items-center gap-2 sm:gap-3 group min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-neu-orange group-hover:scale-105 transition-transform flex-shrink-0">
              <Flame className="w-5 h-5 sm:w-6 sm:h-6 text-white animate-pulse" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm sm:text-base tracking-tight bg-gradient-to-r from-orange-400 via-amber-300 to-amber-500 bg-clip-text text-transparent truncate">
                  NIPAH SATAY™
                </span>
                <span className="hidden sm:inline-block text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded neu-inset-sm text-orange-400">
                  Operasi
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-stone-400 font-medium truncate">
                <span className="sm:hidden">Pulau Indah, Klang</span>
                <span className="hidden sm:inline">Pulau Indah, Klang • Kilang & Restoran</span>
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden xl:flex items-center gap-1.5">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                    isActive
                      ? 'neu-inset text-orange-400 border border-orange-500/30'
                      : 'text-stone-300 hover:text-white hover:neu-surface hover:shadow-neu-flat-sm'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                  {link.badge && (
                    <span className="text-[10px] bg-orange-500/20 text-orange-300 px-1.5 py-0.5 rounded-full font-mono">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Mobile Status & Quick Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 flex-shrink-0">
            {/* Senior Mode Toggle (Tulisan Besar) */}
            <button
              onClick={toggleSeniorMode}
              className={`flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 ${
                isSeniorMode
                  ? 'bg-amber-500 text-stone-950 shadow-neu-amber font-black'
                  : 'neu-btn text-stone-300'
              }`}
              title="Tukar Mod Warga Emas (A+)"
            >
              <Glasses className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isSeniorMode ? 'text-stone-950 font-black' : 'text-amber-400'}`} />
              <span className="font-mono text-[11px] sm:text-xs">
                {isSeniorMode ? 'A++' : 'A+'}
              </span>
            </button>

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
              <span className="hidden sm:inline">{isOnline ? 'Online' : 'Offline'}</span>
            </div>

            {/* Role Authentication Badge & Switch Button */}
            <button
              type="button"
              onClick={() => setShowAuthModal(true)}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl neu-btn text-stone-200 text-xs font-bold transition-all active:scale-95"
              title="Tukar Peranan Petugas (Role-Based Auth)"
            >
              <span>{roleConfig ? roleConfig.icon : '👤'}</span>
              <span className="text-[10px] sm:text-xs font-black text-amber-300">
                {roleConfig ? roleConfig.shortLabel : 'Pilih Peranan'}
              </span>
            </button>

            {/* Quick POS link on desktop (only if permitted) */}
            {canAccess('/pos') && (
              <Link
                href="/pos"
                className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-xl neu-btn-primary text-xs font-bold"
              >
                <Store className="w-3.5 h-3.5" />
                <span>POS</span>
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden p-2 rounded-xl neu-btn text-stone-200 hover:text-white"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-[#121110] border-b border-orange-950/60 px-3 pt-2 pb-4 space-y-1">
          {/* Peranan Semasa */}
          <div className="mb-2 p-2.5 rounded-xl bg-stone-900 border border-stone-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">{roleConfig ? roleConfig.icon : '👤'}</span>
              <div>
                <span className="text-[10px] text-stone-400 block font-bold uppercase">Peranan Petugas</span>
                <span className="text-xs font-black text-amber-300">
                  {roleConfig ? roleConfig.label : 'Belum Dipilih'}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                setShowAuthModal(true);
              }}
              className="px-2.5 py-1 rounded-lg bg-orange-600 text-white font-bold text-xs shadow active:scale-95"
            >
              Tukar
            </button>
          </div>

          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-bold ${
                  isActive
                    ? 'bg-orange-600/25 text-orange-400 border border-orange-500/40'
                    : 'text-stone-200 hover:bg-stone-800/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 text-orange-400" />
                  <span>{link.label}</span>
                </div>
                {link.badge && (
                  <span className="text-[10px] bg-stone-800 text-stone-300 px-1.5 py-0.5 rounded font-mono">
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}

          <div className="pt-2 border-t border-stone-800 mt-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                // Trigger PWA install if available or alert guide
                const event = new CustomEvent('nipah:install-pwa');
                window.dispatchEvent(event);
                alert(
                  'Cara Pasang PWA Nipah Satay™:\n\n1. Tekan butang menu 3 titik (⋮) di bucu atas kanan Chrome.\n2. Pilih "Install app" atau "Add to Home screen" (Tambah ke Skrin Utama).\n3. Tekan "Install" untuk muat turun ke desktop/tablet anda!'
                );
              }}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-md active:scale-95"
            >
              <div className="flex items-center gap-3">
                <Download className="w-4 h-4 text-white" />
                <span>Pasang Aplikasi Nipah Satay (PWA)</span>
              </div>
              <span className="text-[10px] bg-black/30 px-2 py-0.5 rounded-lg text-amber-200">
                Install App
              </span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
