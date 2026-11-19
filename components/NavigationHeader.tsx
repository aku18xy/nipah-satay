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
  Eye,
  Glasses
} from 'lucide-react';
import { useSeniorMode } from './SeniorModeContext';

export default function NavigationHeader() {
  const pathname = usePathname();
  const [isOnline, setIsOnline] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isSeniorMode, toggleSeniorMode } = useSeniorMode();

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

  const navLinks = [
    { href: '/', label: 'Ringkasan', icon: Flame },
    { href: '/pos', label: 'POS Kaunter', icon: Store, badge: 'Meja' },
    { href: '/kitchen', label: 'Dapur KDS', icon: CookingPot, badge: 'Live' },
    { href: '/production', label: 'Kilang Sate', icon: Factory, badge: 'Hasil' },
    { href: '/wholesale', label: 'Borong & Katering', icon: Package },
    { href: '/reports', label: 'Laporan & Kos', icon: BarChart3 },
    { href: '/menu', label: 'Menu Pelanggan', icon: ExternalLink },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#121110]/95 backdrop-blur-md border-b border-orange-950/40 text-stone-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo & Outlet Location */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-lg shadow-orange-950/60 group-hover:scale-105 transition-transform">
              <Flame className="w-6 h-6 sm:w-7 sm:h-7 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight bg-gradient-to-r from-orange-400 via-amber-300 to-amber-500 bg-clip-text text-transparent">
                  NIPAH SATAY™
                </span>
                <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-orange-950/80 text-orange-400 border border-orange-800/40">
                  Operasi
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-stone-400 font-medium">
                Pulau Indah, Klang • Kilang & Restoran
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
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                    isActive
                      ? 'bg-orange-600/25 text-orange-400 border border-orange-500/40 shadow-sm'
                      : 'text-stone-300 hover:text-white hover:bg-stone-800/60'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                  {link.badge && (
                    <span className="text-[10px] bg-orange-500/20 text-orange-300 px-1 rounded font-mono">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Status & Quick Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Senior Mode Toggle Button (Tulisan Besar) */}
            <button
              onClick={toggleSeniorMode}
              className={`flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-extrabold border transition-all ${
                isSeniorMode
                  ? 'bg-amber-500 text-stone-950 border-amber-400 shadow-md shadow-amber-950/50 scale-105'
                  : 'bg-stone-900 text-stone-300 border-stone-700 hover:text-white hover:border-orange-500'
              }`}
              title="Tukar antara mod biasa dan mod tulisan besar/mudah baca untuk warga emas"
            >
              <Glasses className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
              <span className="hidden sm:inline">
                {isSeniorMode ? 'Tulisan Besar (Aktif)' : 'Mod Jelas (A+)'}
              </span>
              <span className="sm:hidden font-mono text-xs font-black">
                {isSeniorMode ? 'A++' : 'A+'}
              </span>
            </button>

            {/* Pulau Indah Connectivity Status */}
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[11px] sm:text-xs font-bold border ${
                isOnline
                  ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/40'
                  : 'bg-amber-950/50 text-amber-300 border-amber-800/50 animate-pulse'
              }`}
            >
              {isOnline ? (
                <>
                  <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="hidden md:inline">Online</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3.5 h-3.5 text-amber-400" />
                  <span className="font-semibold">Mod Offline</span>
                </>
              )}
            </div>

            {/* Link to POS */}
            <Link
              href="/pos"
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs sm:text-sm font-black shadow-md shadow-orange-950/50 transition-all hover:scale-[1.02]"
            >
              <Store className="w-4 h-4" />
              <span>POS Meja</span>
            </Link>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden p-2 rounded-xl bg-stone-900 border border-stone-800 text-stone-200 hover:text-white"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-[#121110] border-b border-orange-950/60 px-4 pt-2 pb-4 space-y-1.5">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-3.5 py-3 rounded-xl text-base font-bold ${
                  isActive
                    ? 'bg-orange-600/25 text-orange-400 border border-orange-500/40'
                    : 'text-stone-200 hover:bg-stone-800/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5 text-orange-400" />
                  <span>{link.label}</span>
                </div>
                {link.badge && (
                  <span className="text-xs bg-stone-800 text-stone-300 px-2 py-0.5 rounded font-mono">
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
